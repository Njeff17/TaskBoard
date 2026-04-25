const express = require('express');

const router = express.Router();
const projectController = require('../controllers/project.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  validateCreateProject,
  validateUpdateProject,
} = require('../validators/project.validator');

// All project routes require authentication
router.use(authenticate);

router.post('/', validateCreateProject, projectController.createProject);
router.get('/', projectController.listProjects);
router.get('/:id', projectController.getProject);
router.patch('/:id', validateUpdateProject, projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
