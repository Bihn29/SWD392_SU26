const express = require('express');
const router = express.Router();
const { getStudentHome, enrollCourse, checkEnrollment, getCourseLessons, getQuizQuestions, getStudentQuizzes } = require('../controllers/studentController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');
const { requirePermission } = require('../middlewares/roleMiddleware');

// Chỉ Student mới được vào route này
router.use(protect);
router.use(requireRole('Student'));

// GET /api/student/home
router.get('/home', getStudentHome);

// GET /api/student/quizzes
router.get('/quizzes', getStudentQuizzes);

// POST /api/student/enroll/:courseId
router.post('/enroll/:courseId', requirePermission('courses:register'), enrollCourse);

// GET /api/student/enrollment-status/:courseId
router.get('/enrollment-status/:courseId', checkEnrollment);

// GET /api/student/courses/:courseId/lessons
router.get('/courses/:courseId/lessons', requirePermission('courses:learn'), getCourseLessons);

// GET /api/student/courses/:courseId/lessons/:lessonId/questions
router.get('/courses/:courseId/lessons/:lessonId/questions', requirePermission('courses:learn'), getQuizQuestions);

module.exports = router;
