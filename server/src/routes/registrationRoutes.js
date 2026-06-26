const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middlewares/authMiddleware');
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
router.get('/', registrationController.getStudentsBySubject);

module.exports = router;
