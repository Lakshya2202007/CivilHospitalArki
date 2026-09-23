/**
 * Thin fetch wrapper for the Civil Hospital Arki API.
 * Attaches the admin token, unwraps { success, data }, and throws on failure.
 */

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'cha_admin_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body, auth = false, isFormData = false } = {}) {
  const headers = {};
  if (!isFormData && body !== undefined) headers['Content-Type'] = 'application/json';

  if (auth) {
    const token = tokenStore.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Is the backend running?', 0);
  }

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    // An expired or invalid token means the session is over — clear it so the
    // route guard bounces the user to the login screen.
    if (res.status === 401) tokenStore.clear();
    throw new ApiError(payload.message || `Request failed (${res.status})`, res.status, payload.details);
  }

  return payload;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};

/** Uploads a PDF or image and returns { url, name, size, mimeType }. */
export async function uploadFile(file) {
  const form = new FormData();
  form.append('file', file);
  const res = await request('/uploads', { method: 'POST', body: form, auth: true, isFormData: true });
  return res.data;
}
