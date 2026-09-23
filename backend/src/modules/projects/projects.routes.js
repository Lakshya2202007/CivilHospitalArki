const express = require('express');
const { validate, validatePartial } = require('../../middleware/validate');
const { requireAuth } = require('../../middleware/auth');
const { createSchema, updateSchema } = require('./projects.schema');
const controller = require('./projects.controller');

const router = express.Router();

/* ── Public ── */
router.get('/', controller.listPublic);
router.get('/meta', controller.getMeta);

/* ── Admin (token required) ── */
router.get('/admin/all', requireAuth, controller.listAll);
router.get('/admin/:id', requireAuth, controller.getOne);
router.post('/', requireAuth, validate(createSchema), controller.create);
router.put('/:id', requireAuth, validatePartial(updateSchema), controller.update);
router.delete('/:id', requireAuth, controller.remove);

module.exports = router;
