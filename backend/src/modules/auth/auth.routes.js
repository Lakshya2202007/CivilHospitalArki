const express = require('express');
const { validate } = require('../../middleware/validate');
const { requireAuth, requireRole } = require('../../middleware/auth');
const controller = require('./auth.controller');

const router = express.Router();

const loginSchema = {
  username: { type: 'string', required: true, max: 64, label: 'Username' },
  password: { type: 'string', required: true, max: 128, label: 'Password' },
};

const createAdminSchema = {
  username: { type: 'string', required: true, max: 64, label: 'Username' },
  password: { type: 'string', required: true, max: 128, label: 'Password' },
  name: { type: 'string', required: true, max: 120, label: 'Full name' },
  role: { type: 'string', enum: ['admin', 'superadmin'], default: 'admin', label: 'Role' },
};

const changePasswordSchema = {
  currentPassword: { type: 'string', required: true, max: 128, label: 'Current password' },
  newPassword: { type: 'string', required: true, max: 128, label: 'New password' },
};

router.post('/login', validate(loginSchema), controller.login);

router.get('/me', requireAuth, controller.me);
router.post('/change-password', requireAuth, validate(changePasswordSchema), controller.changePassword);

// Managing other admin accounts is superadmin-only.
router.get('/admins', requireAuth, requireRole('superadmin'), controller.listAdmins);
router.post('/admins', requireAuth, requireRole('superadmin'), validate(createAdminSchema), controller.createAdmin);
router.delete('/admins/:id', requireAuth, requireRole('superadmin'), controller.deleteAdmin);

module.exports = router;
