const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middlewares/authMiddleware');
const { requirePermission } = require('../middlewares/roleMiddleware');
const registrationController = require('../controllers/registrationController');

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

// GET /api/admin/subjects/:subjectId/students
router.get('/', requirePermission('registrations:view'), registrationController.getStudentsBySubject);

// PATCH /api/admin/subjects/:subjectId/students/:registrationId/approve
router.patch('/:registrationId/approve', requirePermission('registrations:update'), registrationController.approveRegistration);

// PATCH /api/admin/subjects/:subjectId/students/:registrationId/reject
router.patch('/:registrationId/reject', requirePermission('registrations:update'), registrationController.rejectRegistration);

// GET /api/admin/subjects/:subjectId/students/:studentId/progress
router.get('/:studentId/progress', requirePermission('registrations:view'), registrationController.getStudentDetailedProgress);

module.exports = router;
