import { api } from './client';

const authed = { auth: true };

export const bannersApi = {
  listPublic: () => api.get('/banners'),
  listAll: () => api.get('/banners/admin/all', authed),
  getOne: (id) => api.get(`/banners/admin/${id}`, authed),
  create: (payload) => api.post('/banners', payload, authed),
  update: (id, payload) => api.put(`/banners/${id}`, payload, authed),
  remove: (id) => api.del(`/banners/${id}`, authed),
};
