const { Task, Project } = require('../models');

/**
 * Verifies the requesting user owns the project.
 * This check is called before every task operation to prevent IDOR.
 */
const assertProjectOwner = async (userId, projectId) => {
  const project = await Project.findOne({ where: { id: projectId, userId } });
  if (!project) {
    const error = new Error('Project not found');
    error.status = 404;
    throw error;
  }
  return project;
};

/**
 * Creates a task inside a project after verifying ownership.
 */
const createTask = async (userId, projectId, { title, description, status, dueDate }) => {
  await assertProjectOwner(userId, projectId);
  return Task.create({
    title,
    description: description || null,
    status: status || 'TODO',
    dueDate: dueDate || null,
    projectId,
  });
};

/**
 * Lists all tasks in a project. Optionally filtered by status query param.
 */
const listTasks = async (userId, projectId, filters = {}) => {
  await assertProjectOwner(userId, projectId);
  const where = { projectId };
  if (filters.status) {
    where.status = filters.status;
  }
  return Task.findAll({ where, order: [['createdAt', 'DESC']] });
};

/**
 * Returns a single task by ID within a validated project.
 */
const getTask = async (userId, projectId, taskId) => {
  await assertProjectOwner(userId, projectId);
  const task = await Task.findOne({ where: { id: taskId, projectId } });
  if (!task) {
    const error = new Error('Task not found');
    error.status = 404;
    throw error;
  }
  return task;
};

/**
 * Updates allowed fields on a task.
 */
const updateTask = async (userId, projectId, taskId, updates) => {
  const task = await getTask(userId, projectId, taskId);
  const allowed = ['title', 'description', 'status', 'dueDate'];
  const safeUpdates = Object.fromEntries(
    Object.entries(updates).filter(([key]) => allowed.includes(key))
  );
  await task.update(safeUpdates);
  return task;
};

/**
 * Deletes a task.
 */
const deleteTask = async (userId, projectId, taskId) => {
  const task = await getTask(userId, projectId, taskId);
  await task.destroy();
};

module.exports = { createTask, listTasks, getTask, updateTask, deleteTask };
