const express = require('express');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const { protect } = require('../middlewares/authMiddleware');
const { requirePermission } = require('../middlewares/roleMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(requirePermission('users:view'), getUsers)
  .post(requirePermission('users:update'), createUser);

router.route('/:id')
  .get(requirePermission('users:view'), getUserById)
  .put(requirePermission('users:update'), updateUser)
  .delete(requirePermission('users:update'), deleteUser);

module.exports = router;
