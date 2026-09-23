const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const ApiError = require('../../utils/ApiError');
const repo = require('./auth.repository');

const SALT_ROUNDS = 10;

const publicShape = ({ passwordHash, ...rest }) => rest;

function signToken(admin) {
  return jwt.sign(
    { sub: admin.id, username: admin.username, role: admin.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

async function login({ username, password }) {
  const admin = await repo.findByUsername(username);
  // Same message either way, so the response can't be used to enumerate usernames.
  if (!admin) throw ApiError.unauthorized('Invalid username or password.');

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) throw ApiError.unauthorized('Invalid username or password.');

  if (admin.isActive === false) throw ApiError.forbidden('This account has been disabled.');

  await repo.update(admin.id, { lastLoginAt: new Date().toISOString() });

  return { token: signToken(admin), admin: publicShape(admin) };
}

async function getProfile(id) {
  const admin = await repo.findById(id);
  if (!admin) throw ApiError.notFound('Admin account no longer exists.');
  return publicShape(admin);
}

async function createAdmin({ username, password, name, role = 'admin' }) {
  const existing = await repo.findByUsername(username);
  if (existing) throw ApiError.badRequest('That username is already taken.');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const created = await repo.create({ username, passwordHash, name, role, isActive: true });
  return publicShape(created);
}

async function listAdmins() {
  return repo.list();
}

async function changePassword(id, { currentPassword, newPassword }) {
  const admin = await repo.findById(id);
  if (!admin) throw ApiError.notFound('Admin account no longer exists.');

  const ok = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!ok) throw ApiError.badRequest('Current password is incorrect.');

  await repo.update(id, { passwordHash: await bcrypt.hash(newPassword, SALT_ROUNDS) });
  return { message: 'Password updated.' };
}

async function deleteAdmin(id, requesterId) {
  if (id === requesterId) throw ApiError.badRequest('You cannot delete your own account.');
  const total = await repo.count();
  if (total <= 1) throw ApiError.badRequest('At least one admin account must remain.');
  await repo.remove(id);
  return { message: 'Admin removed.' };
}

module.exports = { login, getProfile, createAdmin, listAdmins, changePassword, deleteAdmin, signToken };
