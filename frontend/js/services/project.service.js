import { get, post, patch, del } from './api.js';

export const getProjects = async () => {
  const data = await get('/projects');
  return data.projects;
};

export const getProject = async (id) => {
  const data = await get(`/projects/${id}`);
  return data.project;
};

export const createProject = async ({ name, description }) => {
  const data = await post('/projects', { name, description });
  return data.project;
};

export const updateProject = async (id, { name, description }) => {
  const data = await patch(`/projects/${id}`, { name, description });
  return data.project;
};

export const deleteProject = async (id) => {
  return del(`/projects/${id}`);
};
