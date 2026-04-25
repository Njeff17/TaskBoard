const express = require('express');

// mergeParams: true allows access to :projectId from the parent router
const router = express.Router({ mergeParams: true });
const taskController = require('../controllers/task.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  validateCreateTask,
  validateUpdateTask,
} = require('../validators/task.validator');

// All task routes require authentication
router.use(authenticate);

router.post('/:projectId/tasks', validateCreateTask, taskController.createTask);
router.get('/:projectId/tasks', taskController.listTasks);
router.get('/:projectId/tasks/:taskId', taskController.getTask);
router.patch('/:projectId/tasks/:taskId', validateUpdateTask, taskController.updateTask);
router.delete('/:projectId/tasks/:taskId', taskController.deleteTask);

module.exports = router;
