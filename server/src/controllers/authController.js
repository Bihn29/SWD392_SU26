const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @desc  Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã tồn tại',
      });
    }

    // Mặc định tạo tài khoản có quyền Student
    // Và tên dùng fullName
    const user = await User.create({ 
      name: fullName || 'User', 
      email, 
      password, 
      role: 'Student',
      phone
    });
    
    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công. Vui lòng đăng nhập.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Login user
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản đã bị khóa',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng',
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        _id: user._id,
        fullName: user.name,
        email: user.email,
        role: {
          code: user.role,
          name: user.role === 'Admin' ? 'Quản trị viên' : user.role === 'Manager' ? 'Quản lý' : user.role === 'Teacher' ? 'Giảng viên' : 'Học viên'
        },
        status: user.isActive ? 'Active' : 'Inactive',
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Get current logged-in user profile
 * @route GET /api/auth/me
 * @access Private
 */
const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully.',
    data: req.user,
  });
};

module.exports = { register, login, getMe };
