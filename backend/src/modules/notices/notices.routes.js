const express = require('express');
const { validate, validatePartial } = require('../../middleware/validate');
const { requireAuth } = require('../../middleware/auth');
const { createSchema, updateSchema } = require('./notices.schema');
const controller = require('./notices.controller');

const router = express.Router();

/* ── Public ── */
router.get('/', controller.listPublic);

/* ── Admin ── */
router.get('/admin/all', requireAuth, controller.listAll);
router.get('/admin/:id', requireAuth, controller.getOne);
router.post('/', requireAuth, validate(createSchema), controller.create);
router.put('/:id', requireAuth, validatePartial(updateSchema), controller.update);
router.patch('/:id/visibility', requireAuth, controller.toggleVisibility);
router.delete('/:id', requireAuth, controller.remove);

module.exports = router;
