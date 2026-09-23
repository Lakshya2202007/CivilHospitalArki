const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const env = require('../../config/env');
const ApiError = require('../../utils/ApiError');

const UPLOAD_ROOT = path.resolve(__dirname, '../../../uploads');

const ALLOWED = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_ROOT),
  filename: (req, file, cb) => {
    // Never trust the client filename on disk — store a random name, keep the
    // original only as a display label.
    const ext = ALLOWED[file.mimetype] || path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (!ALLOWED[file.mimetype]) {
    return cb(ApiError.badRequest('Only PDF, JPG, PNG and WebP files are allowed.'));
  }
  return cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.uploadMaxBytes, files: 1 },
});

module.exports = { upload, UPLOAD_ROOT, ALLOWED };
