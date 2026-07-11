const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middlewares/authMiddleware');
const { requirePermission } = require('../middlewares/roleMiddleware');
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
router.get('/', requirePermission('lessons:view'), lessonController.getLessonsBySubject);
router.post('/', requirePermission('lessons:create'), lessonController.createLesson);

// Routes for individual lessons: /api/admin/lessons/:id
router.get('/:id', requirePermission('lessons:view'), lessonController.getLessonById);
router.put('/:id', requirePermission('lessons:update'), lessonController.updateLesson);
router.delete('/:id', requirePermission('lessons:delete'), lessonController.deleteLesson);
router.patch('/:id/activate', requirePermission('lessons:update'), lessonController.activateLesson);

// Mount question routes for quizzes
router.use('/:lessonId/questions', require('./questionRoutes'));

module.exports = router;
