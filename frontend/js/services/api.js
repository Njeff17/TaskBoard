// Base API client
const API_BASE = '/api/v1';

// Retrieves the stored JWT token.
export const getToken = () => localStorage.getItem('taskboard_token');

// Stores the JWT token and user data after login / register.
export const setSession = (token, user) => {
  localStorage.setItem('taskboard_token', token);
  localStorage.setItem('taskboard_user', JSON.stringify(user));
};

// Removes the session from local storage (logout).
export const clearSession = () => {
  localStorage.removeItem('taskboard_token');
  localStorage.removeItem('taskboard_user');
};

// Returns the stored user object, or null.
export const getCurrentUser = () => {
  const raw = localStorage.getItem('taskboard_user');
  return raw ? JSON.parse(raw) : null;
};

// Core request function.
export const request = async (path, options = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.error || `HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.details = data.details;

    // Auto-redirect on 401 (expired / invalid token)
    if (response.status === 401 && !path.includes('/auth/')) {
      clearSession();
      window.location.href = '/pages/login.html';
    }

    throw error;
  }

  return data;
};

export const get = (path, opts) => request(path, { method: 'GET', ...opts });
export const post = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) });
export const patch = (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) });
export const del = (path) => request(path, { method: 'DELETE' });
