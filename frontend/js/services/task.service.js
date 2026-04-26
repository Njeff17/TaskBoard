import { get, post, patch, del } from './api.js';

export const getTasks = async (projectId, status = '') => {
  const qs = status ? `?status=${status}` : '';
  const data = await get(`/projects/${projectId}/tasks${qs}`);
  return data.tasks;
};

export const getTask = async (projectId, taskId) => {
  const data = await get(`/projects/${projectId}/tasks/${taskId}`);
  return data.task;
};

export const createTask = async (projectId, { title, description, status, dueDate }) => {
  const data = await post(`/projects/${projectId}/tasks`, { title, description, status, dueDate });
  return data.task;
};

export const updateTask = async (projectId, taskId, updates) => {
  const data = await patch(`/projects/${projectId}/tasks/${taskId}`, updates);
  return data.task;
};

export const deleteTask = async (projectId, taskId) => {
  return del(`/projects/${projectId}/tasks/${taskId}`);
};
