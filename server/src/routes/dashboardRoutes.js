const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

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

// Role check middleware
const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập.' });
  }
  next();
};

// Protect all dashboard routes for Admin and Manager
router.use(authorizeRoles('Admin', 'Manager'));

// GET /api/admin/dashboard/overview
router.get('/overview', dashboardController.getOverview);

// GET /api/admin/dashboard/details?type=xxx
router.get('/details', dashboardController.getDetails);

module.exports = router;
