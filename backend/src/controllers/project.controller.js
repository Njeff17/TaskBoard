const projectService = require('../services/project.service');

const createProject = async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.user.id, req.body);
    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    next(error);
  }
};

const listProjects = async (req, res, next) => {
  try {
    const projects = await projectService.listProjects(req.user.id);
    res.json({ projects });
  } catch (error) {
    next(error);
  }
};

const getProject = async (req, res, next) => {
  try {
    const project = await projectService.getProject(req.user.id, req.params.id);
    res.json({ project });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.user.id, req.params.id, req.body);
    res.json({ message: 'Project updated successfully', project });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.user.id, req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createProject, listProjects, getProject, updateProject, deleteProject };
