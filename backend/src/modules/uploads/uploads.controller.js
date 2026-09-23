const path = require('path');
const fs = require('fs/promises');
const asyncHandler = require('../../utils/asyncHandler');
const ApiError = require('../../utils/ApiError');
const { UPLOAD_ROOT } = require('./uploads.middleware');

/** POST /api/uploads — returns the URL to store on the project/notice/banner. */
const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file was provided.');

  res.status(201).json({
    success: true,
    data: {
      url: `/uploads/${req.file.filename}`,
      name: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
    },
  });
});

/** DELETE /api/uploads/:filename — clears a replaced or unused file. */
const removeFile = asyncHandler(async (req, res) => {
  const { filename } = req.params;

  // Reject anything that tries to escape the uploads directory.
  if (/[/\\]/.test(filename) || filename.includes('..')) {
    throw ApiError.badRequest('Invalid file name.');
  }

  const target = path.join(UPLOAD_ROOT, filename);
  if (!target.startsWith(UPLOAD_ROOT)) throw ApiError.badRequest('Invalid file name.');

  try {
    await fs.unlink(target);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  res.json({ success: true, message: 'File removed.' });
});

module.exports = { uploadFile, removeFile };
