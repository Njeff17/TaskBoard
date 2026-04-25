import { post, get, patch, setSession, clearSession } from './api.js';

export const register = async ({ name, email, password }) => {
  const data = await post('/auth/register', { name, email, password });
  setSession(data.token, data.user);
  return data;
};

export const login = async ({ email, password }) => {
  const data = await post('/auth/login', { email, password });
  setSession(data.token, data.user);
  return data;
};

export const logout = async () => {
  try {
    await post('/auth/logout', {});
  } finally {
    clearSession();
    window.location.href = '/pages/login.html';
  }
};

export const getProfile = async () => {
  const data = await get('/auth/profile');
  return data.user;
};

export const updateProfile = async ({ name }) => {
  const data = await patch('/auth/profile', { name });
  // Refresh stored user object
  const stored = JSON.parse(localStorage.getItem('taskboard_user') || '{}');
  localStorage.setItem('taskboard_user', JSON.stringify({ ...stored, name: data.user.name }));
  return data.user;
};
