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

router.post('/', validateCreateTask, taskController.createTask);
router.get('/', taskController.listTasks);
router.get('/:taskId', taskController.getTask);
router.patch('/:taskId', validateUpdateTask, taskController.updateTask);
router.delete('/:taskId', taskController.deleteTask);

module.exports = router;
