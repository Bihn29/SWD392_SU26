const express = require('express');
const router = express.Router();

const {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deactivateRole,
  activateRole,
} = require('../controllers/roleController');

const { protect } = require('../middlewares/authMiddleware');
const { requireRole, requirePermission } = require('../middlewares/roleMiddleware');
const {
  validateCreateRole,
  validateUpdateRole,
  validateRoleId,
  validateRoleQuery,
} = require('../validations/roleValidation');

// ─── DEV BYPASS ──────────────────────────────────────────────────────────────
const DEV_BYPASS = false; // Same as subjectRoutes

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

const authMiddleware = DEV_BYPASS ? devMockAuth : protect;
const roleMiddleware = DEV_BYPASS ? devMockRole : requireRole;
// ─────────────────────────────────────────────────────────────────────────────

// Protected routes - only Admin
router.use(authMiddleware);
router.use(roleMiddleware('Admin'));
router.use(requirePermission('roles:manage'));

router.get('/', validateRoleQuery, getRoles);
router.get('/:id', validateRoleId, getRoleById);
router.post('/', validateCreateRole, createRole);
router.put('/:id', validateRoleId, validateUpdateRole, updateRole);
router.delete('/:id', validateRoleId, deactivateRole);
router.patch('/:id/activate', validateRoleId, activateRole);

module.exports = router;
