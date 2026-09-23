const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

/**
 * Verifies the Bearer token and attaches { id, username, role } to req.admin.
 * Put this in front of every write route; public GETs stay open.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Missing or malformed Authorization header.'));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.admin = { id: payload.sub, username: payload.username, role: payload.role };
    return next();
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Session expired. Please sign in again.'
        : 'Invalid session token.';
    return next(ApiError.unauthorized(message));
  }
}

/** Restricts a route to specific roles, e.g. requireRole('superadmin'). */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.admin) return next(ApiError.unauthorized());
  if (!roles.includes(req.admin.role)) return next(ApiError.forbidden());
  return next();
};

module.exports = { requireAuth, requireRole };
