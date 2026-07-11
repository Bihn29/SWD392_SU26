const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const progressController = require('../controllers/progressController');
const { requirePermission } = require('../middlewares/roleMiddleware');

router.use(protect);

// GET /api/progress/subjects/:subjectId
router.get('/subjects/:subjectId', requirePermission('quiz:review'), progressController.getStudentProgress);

// POST /api/progress/subjects/:subjectId/lessons/:lessonId/complete
router.post('/subjects/:subjectId/lessons/:lessonId/complete', requirePermission('courses:learn'), progressController.markLessonComplete);

// POST /api/progress/subjects/:subjectId/lessons/:lessonId/quiz
router.post('/subjects/:subjectId/lessons/:lessonId/quiz', requirePermission('quiz:take'), progressController.submitQuiz);

module.exports = router;
