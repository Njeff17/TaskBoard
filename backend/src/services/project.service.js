const { Project } = require('../models');

/**
 * Creates a new project owned by the given user.
 */
const createProject = async (userId, { name, description }) => {
  return Project.create({ name, description: description || null, userId });
};

/**
 * Lists all projects owned by the given user, newest first.
 */
const listProjects = async (userId) => {
  return Project.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
  });
};

/**
 * Retrieves a single project that belongs to the given user.
 * Throws 404 if the project doesn't exist or belongs to another user.
 */
const getProject = async (userId, projectId) => {
  const project = await Project.findOne({ where: { id: projectId, userId } });
  if (!project) {
    const error = new Error('Project not found');
    error.status = 404;
    throw error;
  }
  return project;
};

/**
 * Updates the name and/or description of a project.
 */
const updateProject = async (userId, projectId, fields) => {
  const project = await getProject(userId, projectId);
  await project.update(fields);
  return project;
};

/**
 * Deletes a project (and all its tasks via cascade).
 */
const deleteProject = async (userId, projectId) => {
  const project = await getProject(userId, projectId);
  await project.destroy();
};

module.exports = { createProject, listProjects, getProject, updateProject, deleteProject };
