/**
 * Creates the first admin account.
 *
 *   1. Set SEED_ADMIN_USERNAME / SEED_ADMIN_PASSWORD in backend/.env
 *   2. npm run seed:admin
 *
 * Safe to re-run: it will not overwrite an existing account.
 */
const env = require('../config/env');
const { initFirebase } = require('../config/firebase');
const repo = require('../modules/auth/auth.repository');
const service = require('../modules/auth/auth.service');

async function main() {
  const { username, password, name } = env.seedAdmin;

  if (!password) {
    console.error('SEED_ADMIN_PASSWORD is not set in .env — aborting.');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('SEED_ADMIN_PASSWORD must be at least 8 characters — aborting.');
    process.exit(1);
  }

  initFirebase();

  const existing = await repo.findByUsername(username);
  if (existing) {
    console.log(`Admin "${username}" already exists. Nothing to do.`);
    process.exit(0);
  }

  // The first account is a superadmin so it can create the others.
  const admin = await service.createAdmin({ username, password, name, role: 'superadmin' });
  console.log(`Created superadmin "${admin.username}" (${admin.id}).`);
  console.log('Sign in at /admin/login with the credentials from your .env file.');
  process.exit(0);
}

main().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
