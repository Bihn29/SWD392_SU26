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
const validateRoleId = [
  param('id')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid role ID format.'),
  validate,
];

// ─── Validate create role body ────────────────────────────────────────────
const validateCreateRole = [
  body('name')
    .notEmpty()
    .withMessage('Tên vai trò là bắt buộc')
    .isString()
    .withMessage('Tên vai trò phải là chuỗi')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Tên vai trò không được vượt quá 100 ký tự'),

  body('code')
    .notEmpty()
    .withMessage('Mã vai trò là bắt buộc')
    .isString()
    .withMessage('Mã vai trò phải là chuỗi')
    .trim(),

  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('Mô tả phải là chuỗi')
    .isLength({ max: 500 })
    .withMessage('Mô tả không được vượt quá 500 ký tự'),

  body('permissions')
    .isArray()
    .withMessage('Quyền hạn phải là một mảng')
    .custom((value) => value.length > 0)
    .withMessage('Vui lòng chọn ít nhất một quyền'),

  body('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage('Trạng thái phải là Active hoặc Inactive'),

  validate,
];

// ─── Validate update role body ────────────────────────────────────────────
const validateUpdateRole = [
  body('name')
    .optional()
    .isString()
    .withMessage('Tên vai trò phải là chuỗi')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Tên vai trò không được vượt quá 100 ký tự'),

  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .isString()
    .withMessage('Mô tả phải là chuỗi')
    .isLength({ max: 500 })
    .withMessage('Mô tả không được vượt quá 500 ký tự'),

  body('permissions')
    .optional()
    .isArray()
    .withMessage('Quyền hạn phải là một mảng')
    .custom((value) => value.length > 0)
    .withMessage('Vui lòng chọn ít nhất một quyền'),

  body('status')
    .optional()
    .isIn(['Active', 'Inactive'])
    .withMessage('Trạng thái phải là Active hoặc Inactive'),

  validate,
];

// ─── Validate query params ────────────────────────────────────────────────────
const validateRoleQuery = [
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
    .isIn(['Active', 'Inactive'])
    .withMessage('Invalid status filter.'),

  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc.'),

  validate,
];

module.exports = {
  validateCreateRole,
  validateUpdateRole,
  validateRoleId,
  validateRoleQuery,
};
