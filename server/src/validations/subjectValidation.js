const { body, param, query, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// ─── Helper: send validation errors ───────────────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

// ─── Validate MongoDB ObjectId param ─────────────────────────────────────────
const validateSubjectId = [
  param('id')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid subject ID format.'),
  validate,
];

// ─── Validate create subject body ────────────────────────────────────────────
const validateCreateSubject = [
  body('name')
    .notEmpty()
    .withMessage('Subject name is required.') // BR-SUB-001
    .isString()
    .withMessage('Subject name must be a string.')
    .trim()
    .isLength({ max: 150 })
    .withMessage('Subject name must not exceed 150 characters.'), // BR-SUB-002

  body('category')
    .notEmpty()
    .withMessage('Category is required.') // BR-SUB-003
    .isString()
    .withMessage('Category must be a string.'),

  body('owner')
    .notEmpty()
    .withMessage('Owner (Expert) is required.') // BR-SUB-004
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Owner must be a valid user ID.'),

  body('thumbnail')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('Thumbnail must be a string.'),

  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('Description must be a string.')
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters.'),

  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean.'),

  body('status')
    .optional()
    .isIn(['Draft', 'Published', 'Unpublished', 'Inactive'])
    .withMessage('Status must be one of: Draft, Published, Unpublished, Inactive.'),

  validate,
];

// ─── Validate update subject body ────────────────────────────────────────────
const validateUpdateSubject = [
  body('name')
    .optional()
    .isString()
    .withMessage('Subject name must be a string.')
    .trim()
    .isLength({ max: 150 })
    .withMessage('Subject name must not exceed 150 characters.'),

  body('category')
    .optional()
    .isString()
    .withMessage('Category must be a string.'),

  body('owner')
    .optional()
    .custom((value) => !value || mongoose.Types.ObjectId.isValid(value))
    .withMessage('Owner must be a valid user ID.'),

  body('thumbnail')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('Thumbnail must be a string.'),

  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('Description must be a string.')
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters.'),

  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean.'),

  body('status')
    .optional()
    .isIn(['Draft', 'Published', 'Unpublished', 'Inactive'])
    .withMessage('Status must be one of: Draft, Published, Unpublished, Inactive.'),

  validate,
];

// ─── Validate query params ────────────────────────────────────────────────────
const validateSubjectQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer.'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100.'),

  query('status')
    .optional({ checkFalsy: true })
    .isIn(['Draft', 'Published', 'Unpublished', 'Inactive'])
    .withMessage('Invalid status filter.'),

  query('featured')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Featured must be true or false.'),

  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc.'),

  validate,
];

module.exports = {
  validateCreateSubject,
  validateUpdateSubject,
  validateSubjectId,
  validateSubjectQuery,
};
