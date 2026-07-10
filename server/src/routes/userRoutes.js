const express = require('express');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const { protect } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(requireRole('Admin', 'Manager'), getUsers)
  .post(requireRole('Admin', 'Manager'), createUser);

router.route('/:id')
  .get(requireRole('Admin', 'Manager'), getUserById)
  .put(requireRole('Admin', 'Manager'), updateUser)
  .delete(requireRole('Admin'), deleteUser);

module.exports = router;
