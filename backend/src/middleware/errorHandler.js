const env = require('../config/env');
const ApiError = require('../utils/ApiError');

/** 404 for anything no router claimed. */
function notFound(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

/* eslint-disable no-unused-vars */
function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let message = err.message || 'Something went wrong.';

  // Multer surfaces upload problems with a code rather than a status.
  if (err.code === 'LIMIT_FILE_SIZE') {
    status = 400;
    message = 'File is too large.';
  }

  if (status >= 500) console.error('[error]', err);

  res.status(status).json({
    success: false,
    message,
    ...(err.details ? { details: err.details } : {}),
    ...(env.nodeEnv === 'development' && status >= 500 ? { stack: err.stack } : {}),
  });
}
/* eslint-enable no-unused-vars */

module.exports = { notFound, errorHandler };
