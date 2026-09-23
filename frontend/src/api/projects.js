import { api } from './client';

const authed = { auth: true };

export const projectsApi = {
  /** Public table: filters + pagination handled server-side. */
  listPublic: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
    ).toString();
    return api.get(`/projects${qs ? `?${qs}` : ''}`);
  },

  /** Dropdown options shared by the admin form and the public filters. */
  meta: () => api.get('/projects/meta'),

  listAll: () => api.get('/projects/admin/all', authed),
  getOne: (id) => api.get(`/projects/admin/${id}`, authed),
  create: (payload) => api.post('/projects', payload, authed),
  update: (id, payload) => api.put(`/projects/${id}`, payload, authed),
  remove: (id) => api.del(`/projects/${id}`, authed),
};
