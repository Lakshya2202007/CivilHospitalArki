const asyncHandler = require('../../utils/asyncHandler');
const service = require('./publicNotices.service');

const listPublic = asyncHandler(async (req, res) => {
  const { data, pagination, stats } = await service.listPublic(req.query);
  res.json({ success: true, data, pagination, stats });
});

const getMeta = asyncHandler(async (req, res) => {
  res.json({ success: true, data: service.getMeta() });
});

const listAll = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.listAll() });
});

const getOne = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getById(req.params.id) });
});

const create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, data: await service.create(req.validated) });
});

const update = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.update(req.params.id, req.validated) });
});

const remove = asyncHandler(async (req, res) => {
  res.json({ success: true, ...(await service.remove(req.params.id)) });
});

module.exports = { listPublic, getMeta, listAll, getOne, create, update, remove };
