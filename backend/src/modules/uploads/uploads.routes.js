const express = require('express');
const { requireAuth } = require('../../middleware/auth');
const { upload } = require('./uploads.middleware');
const controller = require('./uploads.controller');

const router = express.Router();

// Uploading is admin-only; the resulting files are served publicly from /uploads.
router.post('/', requireAuth, upload.single('file'), controller.uploadFile);
router.delete('/:filename', requireAuth, controller.removeFile);

module.exports = router;
