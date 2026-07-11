const express = require('express');
const router = express.Router();

const {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  publishSubject,
  unpublishSubject,
  getPublicSubjects,
  getPublicSubjectById,
} = require('../controllers/subjectController');

const { protect } = require('../middlewares/authMiddleware');
const { requirePermission } = require('../middlewares/roleMiddleware');
const {
  validateCreateSubject,
  validateUpdateSubject,
  validateSubjectId,
  validateSubjectQuery,
} = require('../validations/subjectValidation');

// ─── Public routes (no auth) ─────────────────────────────────────────────────
// GET /api/subjects/public  → Published subjects only (BR-SUB-011)
router.get('/public', validateSubjectQuery, getPublicSubjects);
router.get('/public/:id', validateSubjectId, getPublicSubjectById);

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

const authMiddleware   = DEV_BYPASS ? devMockAuth    : protect;
// ─────────────────────────────────────────────────────────────────────────────

// ─── Protected routes ────────────────────────────────────────────────────────
// All routes below require authentication
router.use(authMiddleware);

// GET /api/subjects
router.get('/', requirePermission('subjects:view'), validateSubjectQuery, getAllSubjects);

// GET /api/subjects/:id
router.get('/:id', requirePermission('subjects:view'), validateSubjectId, getSubjectById);

// POST /api/subjects (permission: subjects:create)
router.post('/', requirePermission('subjects:create'), validateCreateSubject, createSubject);

// PUT /api/subjects/:id  (Admin + Teacher – BR-SUB-006, BR-SUB-007)
router.put('/:id', requirePermission('subjects:update'), validateSubjectId, validateUpdateSubject, updateSubject);

// DELETE /api/subjects/:id (permission: subjects:update)
router.delete('/:id', requirePermission('subjects:update'), validateSubjectId, deleteSubject);

// PATCH /api/subjects/:id/publish (permission: subjects:publish)
router.patch('/:id/publish', requirePermission('subjects:publish'), validateSubjectId, publishSubject);

// PATCH /api/subjects/:id/unpublish (permission: subjects:publish)
router.patch('/:id/unpublish', requirePermission('subjects:publish'), validateSubjectId, unpublishSubject);

module.exports = router;
