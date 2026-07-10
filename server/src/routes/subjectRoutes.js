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
const { requireRole } = require('../middlewares/roleMiddleware');
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

const devMockRole = () => (_req, _res, next) => next();

const authMiddleware   = DEV_BYPASS ? devMockAuth    : protect;
const roleMiddleware   = DEV_BYPASS ? devMockRole    : requireRole;
// ─────────────────────────────────────────────────────────────────────────────

// ─── Protected routes ────────────────────────────────────────────────────────
// All routes below require authentication
router.use(authMiddleware);

// GET /api/subjects
router.get('/', validateSubjectQuery, getAllSubjects);

// GET /api/subjects/:id
router.get('/:id', validateSubjectId, getSubjectById);

// POST /api/subjects  (Admin only – BR-SUB-005)
router.post('/', roleMiddleware('Admin', 'Manager'), validateCreateSubject, createSubject);

// PUT /api/subjects/:id  (Admin + Expert – BR-SUB-006, BR-SUB-007)
router.put('/:id', roleMiddleware('Admin', 'Expert', 'Manager'), validateSubjectId, validateUpdateSubject, updateSubject);

// DELETE /api/subjects/:id  (Admin only – BR-SUB-009, BR-SUB-010)
router.delete('/:id', roleMiddleware('Admin'), validateSubjectId, deleteSubject);

// PATCH /api/subjects/:id/publish  (Admin only – BR-SUB-008)
router.patch('/:id/publish', roleMiddleware('Admin', 'Manager'), validateSubjectId, publishSubject);

// PATCH /api/subjects/:id/unpublish  (Admin only – BR-SUB-008)
router.patch('/:id/unpublish', roleMiddleware('Admin', 'Manager'), validateSubjectId, unpublishSubject);

module.exports = router;
