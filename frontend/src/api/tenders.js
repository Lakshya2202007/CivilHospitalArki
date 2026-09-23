import { api } from './client';

const authed = { auth: true };

export const tendersApi = {
  /** Public table: filtering, sorting and pagination handled server-side. */
  listPublic: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
    ).toString();
    return api.get(`/tenders${qs ? `?${qs}` : ''}`);
  },

  /** Dropdown options shared by the admin form and the public filters. */
  meta: () => api.get('/tenders/meta'),

  listAll: () => api.get('/tenders/admin/all', authed),
  getOne: (id) => api.get(`/tenders/admin/${id}`, authed),
  create: (payload) => api.post('/tenders', payload, authed),
  update: (id, payload) => api.put(`/tenders/${id}`, payload, authed),
  remove: (id) => api.del(`/tenders/${id}`, authed),
};
