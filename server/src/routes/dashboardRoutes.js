const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');
const { requirePermission } = require('../middlewares/roleMiddleware');

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

router.use(requirePermission('dashboard:view'));

// GET /api/admin/dashboard/overview
router.get('/overview', dashboardController.getOverview);

// GET /api/admin/dashboard/details?type=xxx
router.get('/details', dashboardController.getDetails);

module.exports = router;
