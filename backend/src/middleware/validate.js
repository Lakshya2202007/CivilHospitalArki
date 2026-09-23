const ApiError = require('../utils/ApiError');

/**
 * Tiny schema validator — keeps dependencies low while still rejecting junk.
 *
 * Schema shape: { field: { type, required, enum, max, min, default, label } }
 * Types: 'string' | 'number' | 'boolean' | 'date' | 'any'
 *
 * `partial: true` (used by PATCH/PUT) skips required checks for absent fields.
 */
function buildValidator(schema, { partial = false } = {}) {
  return (req, res, next) => {
    const input = req.body || {};
    const output = {};
    const errors = [];

    for (const [field, rule] of Object.entries(schema)) {
      const label = rule.label || field;
      const has = Object.prototype.hasOwnProperty.call(input, field);
      let value = input[field];

      if (!has || value === '' || value === null || value === undefined) {
        if (partial && !has) continue;
        if (rule.required && !partial) {
          errors.push(`${label} is required.`);
          continue;
        }
        if (has && rule.required && partial) {
          errors.push(`${label} cannot be empty.`);
          continue;
        }
        if (rule.default !== undefined && !has) {
          output[field] = rule.default;
          continue;
        }
        if (has) output[field] = rule.type === 'string' ? '' : null;
        continue;
      }

      switch (rule.type) {
        case 'number': {
          const n = Number(value);
          if (Number.isNaN(n)) { errors.push(`${label} must be a number.`); continue; }
          if (rule.min !== undefined && n < rule.min) { errors.push(`${label} must be at least ${rule.min}.`); continue; }
          if (rule.max !== undefined && n > rule.max) { errors.push(`${label} must be at most ${rule.max}.`); continue; }
          value = n;
          break;
        }
        case 'boolean':
          value = value === true || value === 'true' || value === 1 || value === '1';
          break;
        case 'date': {
          const d = new Date(value);
          if (Number.isNaN(d.getTime())) { errors.push(`${label} must be a valid date.`); continue; }
          value = d.toISOString();
          break;
        }
        case 'string': {
          value = String(value).trim();
          if (rule.max && value.length > rule.max) { errors.push(`${label} must be under ${rule.max} characters.`); continue; }
          break;
        }
        default:
          break;
      }

      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(`${label} must be one of: ${rule.enum.join(', ')}.`);
        continue;
      }

      output[field] = value;
    }

    if (errors.length) return next(ApiError.badRequest('Validation failed.', errors));

    req.validated = output;
    return next();
  };
}

const validate = (schema) => buildValidator(schema, { partial: false });
const validatePartial = (schema) => buildValidator(schema, { partial: true });

module.exports = { validate, validatePartial };
