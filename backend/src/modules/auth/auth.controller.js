const asyncHandler = require('../../utils/asyncHandler');
const service = require('./auth.service');

const login = asyncHandler(async (req, res) => {
  const result = await service.login(req.validated);
  res.json({ success: true, ...result });
});

const me = asyncHandler(async (req, res) => {
  const admin = await service.getProfile(req.admin.id);
  res.json({ success: true, admin });
});

const listAdmins = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.listAdmins() });
});

const createAdmin = asyncHandler(async (req, res) => {
  const admin = await service.createAdmin(req.validated);
  res.status(201).json({ success: true, admin });
});

const changePassword = asyncHandler(async (req, res) => {
  res.json({ success: true, ...(await service.changePassword(req.admin.id, req.validated)) });
});

const deleteAdmin = asyncHandler(async (req, res) => {
  res.json({ success: true, ...(await service.deleteAdmin(req.params.id, req.admin.id)) });
});

module.exports = { login, me, listAdmins, createAdmin, changePassword, deleteAdmin };
