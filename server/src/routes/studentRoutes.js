const express = require('express');
const router = express.Router();
const { getStudentHome, enrollCourse, checkEnrollment } = require('../controllers/studentController');
const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

// Chỉ Student mới được vào route này
router.use(protect);
router.use(requireRole('Student'));

// GET /api/student/home
router.get('/home', getStudentHome);

// POST /api/student/enroll/:courseId
router.post('/enroll/:courseId', enrollCourse);

// GET /api/student/enrollment-status/:courseId
router.get('/enrollment-status/:courseId', checkEnrollment);

module.exports = router;
