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
const { requireRole } = require('../middlewares/roleMiddleware');
const { checkCourseOwner } = require('../middlewares/ownerMiddleware');
const {
  validateCreateSubject,
  validateUpdateSubject,
  validateSubjectId,
  validateSubjectQuery,
} = require('../validations/subjectValidation');

// ─── Protected routes for Teacher ─────────────────────────────────────────────
router.use(protect);
router.use(requireRole('Teacher', 'Expert')); // Allowing Expert as well since they are similar in this system based on authMiddleware/subjectController

// ─── Dashboard ─────────────────────────────────────────────────────────────
router.get('/dashboard', getTeacherDashboard);

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
router.get('/courses', setOwnerQuery, validateSubjectQuery, getAllSubjects);

// GET /api/teacher/courses/:id
router.get('/courses/:id', validateSubjectId, checkCourseOwner, getSubjectById);

// POST /api/teacher/courses
router.post('/courses', setOwnerBody, validateCreateSubject, createSubject);

// PUT /api/teacher/courses/:id
router.put('/courses/:id', validateSubjectId, checkCourseOwner, validateUpdateSubject, updateSubject);

// DELETE /api/teacher/courses/:id
router.delete('/courses/:id', validateSubjectId, checkCourseOwner, deleteSubject);

// ─── Lesson & Registration Management ─────────────────────────────────────────
// Trỏ các API lessons của subjectId về lessonRoutes
// Lưu ý: lessonRoutes cần phải được cấu hình để không xung đột. 
// Hiện tại ở app.js, lessonRoutes dùng parameter `:subjectId`. 
// Do ta dùng router riêng, ta gọi app.use('/api/teacher/courses/:subjectId/lessons', require('./lessonRoutes')) ở app.js

module.exports = router;
