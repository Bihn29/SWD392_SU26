const User = require('../models/User');

exports.getUsers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }

    // Manager role restriction: cannot view Admin records
    if (req.user && req.user.role === 'Manager') {
      if (filter.role === 'Admin') {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập vai trò này.' });
      }
      if (!filter.role) {
        filter.role = { $ne: 'Admin' };
      }
    }

    const users = await User.find(filter).select('-password').sort('-createdAt');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Manager role restriction: cannot view Admin records
    if (req.user && req.user.role === 'Manager' && user.role === 'Admin') {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập thông tin quản trị viên.' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, isActive } = req.body;
    
    // Manager role restriction: can only create Teacher or Student
    if (req.user && req.user.role === 'Manager') {
      const allowedRoles = ['Teacher', 'Student'];
      const targetRole = role || 'Student';
      if (!allowedRoles.includes(targetRole)) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền tạo tài khoản với vai trò này.' });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const passwordText = password || 'password123';

    const user = await User.create({
      name,
      email,
      password: passwordText,
      role: role || 'Student',
      isActive: isActive !== undefined ? isActive : true
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({ success: true, data: userObj });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { name, role, isActive } = req.body;
    
    // Check if user exists
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Manager role restriction: cannot edit Admins or other Managers, and cannot change roles to Admin/Manager
    if (req.user && req.user.role === 'Manager') {
      if (user.role === 'Admin' || user.role === 'Manager') {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền sửa thông tin quản trị viên hoặc quản lý khác.' });
      }
      if (role && (role === 'Admin' || role === 'Manager')) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền thay đổi sang vai trò này.' });
      }
    }

    // Only update allowed fields
    if (name) user.name = name;
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({ success: true, data: userObj });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
