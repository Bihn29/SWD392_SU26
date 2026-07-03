const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const progressController = require('../controllers/progressController');

router.use(protect);

// GET /api/progress/subjects/:subjectId
router.get('/subjects/:subjectId', progressController.getStudentProgress);

// POST /api/progress/subjects/:subjectId/lessons/:lessonId/complete
router.post('/subjects/:subjectId/lessons/:lessonId/complete', progressController.markLessonComplete);

// POST /api/progress/subjects/:subjectId/lessons/:lessonId/quiz
router.post('/subjects/:subjectId/lessons/:lessonId/quiz', progressController.submitQuiz);

module.exports = router;
