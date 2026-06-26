const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middlewares/authMiddleware');
const lessonController = require('../controllers/lessonController');

// ─── DEV BYPASS: inject mock Admin – set to false to re-enable real auth ───────
const DEV_BYPASS = false;

const devMockAuth = (req, _res, next) => {
  req.user = {
    _id: '000000000000000000000001',
    name: 'Dev Admin',
    email: 'admin@dev.com',
    role: 'Admin',
    isActive: true,
  };
  next();
};

const authMiddleware = DEV_BYPASS ? devMockAuth : protect;
// ─────────────────────────────────────────────────────────────────────────────

router.use(authMiddleware);

// Routes for lessons under a subject: /api/admin/subjects/:subjectId/lessons
router.get('/', lessonController.getLessonsBySubject);
router.post('/', lessonController.createLesson);

// Routes for individual lessons: /api/admin/lessons/:id
router.get('/:id', lessonController.getLessonById);
router.put('/:id', lessonController.updateLesson);
router.delete('/:id', lessonController.deleteLesson);
router.patch('/:id/activate', lessonController.activateLesson);

module.exports = router;
