const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middlewares/authMiddleware');
const { requirePermission } = require('../middlewares/roleMiddleware');
const questionController = require('../controllers/questionController');

router.use(protect);

// GET /api/teacher/courses/:subjectId/lessons/:lessonId/questions
router.get('/', requirePermission('questions:view'), questionController.getQuestionsByLesson);
router.post('/', requirePermission('questions:create'), questionController.createQuestion);

// PUT /api/teacher/courses/:subjectId/lessons/:lessonId/questions/:id
router.put('/:id', requirePermission('questions:update'), questionController.updateQuestion);
router.delete('/:id', requirePermission('questions:delete'), questionController.deleteQuestion);

module.exports = router;
