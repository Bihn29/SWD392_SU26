const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const { DEFAULT_ROLE_PERMISSIONS } = require('../constants/permissions');

const error = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });

const generateToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
});

const register = async ({ fullName, email, password, phone }) => {
  if (await User.findOne({ email })) throw error('Email đã tồn tại.');
  await User.create({ name: fullName || 'User', email, password, role: 'Student', phone });
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) throw error('Email hoặc mật khẩu không đúng', 401);
  if (!user.isActive) throw error('Tài khoản đã bị khóa', 401);

  if (!user.password.startsWith('$2')) {
    user.password = password;
    await user.save();
  }

  const role = await Role.findOne({ code: user.role }).lean();
  if (role && role.status !== 'Active') throw error('Vai trò của tài khoản hiện đang bị vô hiệu hóa', 401);

  return {
    token: generateToken(user._id),
    user: {
      _id: user._id,
      fullName: user.name,
      email: user.email,
      role: {
        code: user.role,
        name: role?.name || (user.role === 'Admin' ? 'Quản trị viên' : user.role === 'Manager' ? 'Quản lý' : user.role === 'Teacher' ? 'Giảng viên' : 'Học viên'),
        permissions: role?.permissions || DEFAULT_ROLE_PERMISSIONS[user.role] || [],
      },
      status: user.isActive ? 'Active' : 'Inactive',
    },
  };
};

module.exports = { register, login };
