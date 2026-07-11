const express = require('express');
const router = express.Router();

const {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');

const {
  getTeacherDashboard,
} = require('../controllers/dashboardController');

const { protect } = require('../middlewares/authMiddleware');
const { requireRole, requirePermission } = require('../middlewares/roleMiddleware');
const { checkCourseOwner } = require('../middlewares/ownerMiddleware');
const {
  validateCreateSubject,
  validateUpdateSubject,
  validateSubjectId,
  validateSubjectQuery,
} = require('../validations/subjectValidation');

// ─── Protected routes for Teacher ─────────────────────────────────────────────
router.use(protect);
router.use(requireRole('Teacher'));

// ─── Dashboard ─────────────────────────────────────────────────────────────
router.get('/dashboard', requirePermission('subjects:view'), getTeacherDashboard);

// ─── Course Management ───────────────────────────────────────────────────────
// Middleware to inject owner to query/body
const setOwnerQuery = (req, res, next) => {
  req.query.owner = req.user._id;
  next();
};

const setOwnerBody = (req, res, next) => {
  req.body.owner = req.user._id;
  next();
};

// GET /api/teacher/courses
router.get('/courses', requirePermission('subjects:view'), setOwnerQuery, validateSubjectQuery, getAllSubjects);

// GET /api/teacher/courses/:id
router.get('/courses/:id', requirePermission('subjects:view'), validateSubjectId, checkCourseOwner, getSubjectById);

// POST /api/teacher/courses
router.post('/courses', requirePermission('subjects:create'), setOwnerBody, validateCreateSubject, createSubject);

// PUT /api/teacher/courses/:id
router.put('/courses/:id', requirePermission('subjects:update'), validateSubjectId, checkCourseOwner, validateUpdateSubject, updateSubject);

// DELETE /api/teacher/courses/:id
router.delete('/courses/:id', requirePermission('subjects:update'), validateSubjectId, checkCourseOwner, deleteSubject);

// ─── Lesson & Registration Management ─────────────────────────────────────────
// Trỏ các API lessons của subjectId về lessonRoutes
// Lưu ý: lessonRoutes cần phải được cấu hình để không xung đột. 
// Hiện tại ở app.js, lessonRoutes dùng parameter `:subjectId`. 
// Do ta dùng router riêng, ta gọi app.use('/api/teacher/courses/:subjectId/lessons', require('./lessonRoutes')) ở app.js

module.exports = router;
