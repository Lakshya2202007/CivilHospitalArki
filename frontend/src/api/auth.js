import { api } from './client';

const authed = { auth: true };

export const authApi = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  me: () => api.get('/auth/me', authed),
  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword }, authed),
  listAdmins: () => api.get('/auth/admins', authed),
  createAdmin: (payload) => api.post('/auth/admins', payload, authed),
  removeAdmin: (id) => api.del(`/auth/admins/${id}`, authed),
};
