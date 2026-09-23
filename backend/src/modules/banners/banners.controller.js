const asyncHandler = require('../../utils/asyncHandler');
const service = require('./banners.service');

const listPublic = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.listPublic() });
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

module.exports = { listPublic, listAll, getOne, create, update, remove };
