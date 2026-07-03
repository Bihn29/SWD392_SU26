const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const qaController = require('../controllers/qaController');

router.use(protect);

// GET /api/qa/subjects/:subjectId - For teacher to view all QAs in a subject
router.get('/subjects/:subjectId', qaController.getQAsBySubject);

// GET /api/qa/lessons/:lessonId - For students to view QAs in a specific lesson
router.get('/lessons/:lessonId', qaController.getQAsByLesson);

// POST /api/qa/subjects/:subjectId/lessons/:lessonId - Create new question or reply
router.post('/subjects/:subjectId/lessons/:lessonId', qaController.createQA);

// PATCH /api/qa/:id/resolve - Mark as resolved
router.patch('/:id/resolve', qaController.markResolved);

// DELETE /api/qa/:id - Hide QA
router.delete('/:id', qaController.deleteQA);

module.exports = router;
