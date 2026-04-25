const { body, validationResult } = require('express-validator');

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

const validateCreateProject = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ max: 150 }).withMessage('Project name cannot exceed 150 characters'),
  body('description')
    .optional({ nullable: true, checkFalsy: false })
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  handleValidation,
];

const validateUpdateProject = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Project name cannot be empty')
    .isLength({ max: 150 }).withMessage('Project name cannot exceed 150 characters'),
  body('description')
    .optional({ nullable: true })
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  handleValidation,
];

module.exports = { validateCreateProject, validateUpdateProject };
