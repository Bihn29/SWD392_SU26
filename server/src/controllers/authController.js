const authService = require('../services/authService');

const register = async (req, res, next) => {
  try {
    await authService.register(req.body);
    res.status(201).json({ success: true, message: 'Đăng ký tài khoản thành công. Vui lòng đăng nhập.' });
  } catch (error) { next(error); }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json({ success: true, message: 'Đăng nhập thành công', ...result });
  } catch (error) { next(error); }
};

const getMe = async (req, res) => {
  const data = req.user.toObject ? req.user.toObject() : { ...req.user };
  data.permissions = req.userPermissions || [];
  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully.',
    data,
  });
};

module.exports = { register, login, getMe };
