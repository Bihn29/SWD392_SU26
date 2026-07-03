const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middlewares/authMiddleware');
const questionController = require('../controllers/questionController');

router.use(protect);

// GET /api/teacher/courses/:subjectId/lessons/:lessonId/questions
router.get('/', questionController.getQuestionsByLesson);
router.post('/', questionController.createQuestion);

// PUT /api/teacher/courses/:subjectId/lessons/:lessonId/questions/:id
router.put('/:id', questionController.updateQuestion);
router.delete('/:id', questionController.deleteQuestion);

module.exports = router;
