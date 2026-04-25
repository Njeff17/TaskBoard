const { body, validationResult } = require('express-validator');

const VALID_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

const validateCreateTask = [
  body('title')
    .trim()
    .notEmpty().withMessage('Task title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional({ nullable: true })
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('status')
    .optional()
    .isIn(VALID_STATUSES).withMessage('Status must be one of: TODO, IN_PROGRESS, DONE'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Due date must be a valid date in YYYY-MM-DD format'),
  handleValidation,
];

const validateUpdateTask = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional({ nullable: true })
    .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),
  body('status')
    .optional()
    .isIn(VALID_STATUSES).withMessage('Status must be one of: TODO, IN_PROGRESS, DONE'),
  body('dueDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('Due date must be a valid date in YYYY-MM-DD format'),
  handleValidation,
];

module.exports = { validateCreateTask, validateUpdateTask };
