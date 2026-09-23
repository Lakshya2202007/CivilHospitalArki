import { api } from './client';

const authed = { auth: true };

export const publicNoticesApi = {
  /** Public table: filtering, sorting and pagination handled server-side. */
  listPublic: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
    ).toString();
    return api.get(`/public-notices${qs ? `?${qs}` : ''}`);
  },

  /** Dropdown options shared by the admin form and the public filters. */
  meta: () => api.get('/public-notices/meta'),

  listAll: () => api.get('/public-notices/admin/all', authed),
  getOne: (id) => api.get(`/public-notices/admin/${id}`, authed),
  create: (payload) => api.post('/public-notices', payload, authed),
  update: (id, payload) => api.put(`/public-notices/${id}`, payload, authed),
  remove: (id) => api.del(`/public-notices/${id}`, authed),
};
