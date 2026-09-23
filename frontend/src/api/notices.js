import { api } from './client';

const authed = { auth: true };

export const noticesApi = {
  listPublic: () => api.get('/notices'),
  listAll: () => api.get('/notices/admin/all', authed),
  getOne: (id) => api.get(`/notices/admin/${id}`, authed),
  create: (payload) => api.post('/notices', payload, authed),
  update: (id, payload) => api.put(`/notices/${id}`, payload, authed),
  toggleVisibility: (id) => api.patch(`/notices/${id}/visibility`, undefined, authed),
  remove: (id) => api.del(`/notices/${id}`, authed),
};
