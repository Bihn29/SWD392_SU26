const User = require('../models/User');
const Role = require('../models/Role');
const { DEFAULT_ROLE_PERMISSIONS } = require('../constants/permissions');

const businessError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureRoleIsAssignable = async (roleCode) => {
  const code = roleCode || 'Student';
  const role = await Role.findOne({ code }).lean();

  if (role && role.status !== 'Active') {
    throw businessError('Không thể gán vai trò đang bị vô hiệu hóa.', 400);
  }

  if (!role && !DEFAULT_ROLE_PERMISSIONS[code]) {
    throw businessError('Vai trò không tồn tại hoặc chưa được kích hoạt.', 400);
  }

  return code;
};

const ensureNotLastAdmin = async (target, changes = {}) => {
  const removesAdmin = target.role === 'Admin' &&
    (changes.role === undefined || changes.role === 'Admin') &&
    changes.isActive === false;
  const changesAwayFromAdmin = target.role === 'Admin' && changes.role && changes.role !== 'Admin';

  if (removesAdmin || changesAwayFromAdmin) {
    const activeAdmins = await User.countDocuments({ role: 'Admin', isActive: true });
    if (activeAdmins <= 1 && target.isActive) {
      throw businessError('Không thể vô hiệu hóa hoặc thay đổi Admin active cuối cùng.', 400);
    }
  }
};

const assertManagerBoundary = (actor, target, targetRole) => {
  if (actor.role !== 'Admin' && target && target.role === 'Admin') {
    throw businessError('Chỉ Admin mới có quyền tác động đến Admin.', 403);
  }

  if (actor.role !== 'Admin' && target && target.role === 'Manager') {
    throw businessError('Chỉ Admin mới có quyền tác động đến Manager.', 403);
  }

  if (actor.role === 'Manager' && target && target.role === 'Manager') {
    throw businessError('Manager không có quyền tác động đến Manager khác.', 403);
  }

  if (actor.role === 'Manager' && targetRole && !['Teacher', 'Student'].includes(targetRole)) {
    throw businessError('Manager chỉ được tạo hoặc gán role Teacher/Student.', 403);
  }

  if (actor.role !== 'Admin' && targetRole && ['Admin', 'Manager'].includes(targetRole)) {
    throw businessError('Chỉ Admin mới có quyền gán role Admin hoặc Manager.', 403);
  }
};

const getUsers = async (filter = {}, actor) => {
  const query = { ...filter };
  if (actor.role !== 'Admin') {
    if (query.role === 'Admin' || (actor.role === 'Manager' && query.role === 'Manager')) {
      throw businessError('Bạn không có quyền xem role quản trị.', 403);
    }
    query.role = query.role || (actor.role === 'Manager' ? { $nin: ['Admin', 'Manager'] } : { $ne: 'Admin' });
  }

  return User.find(query).select('-password').sort('-createdAt').lean();
};

const getUserById = async (id, actor) => {
  const user = await User.findById(id).select('-password').lean();
  if (!user) return null;
  if (actor.role !== 'Admin' && user.role === 'Admin') {
    throw businessError('Bạn không có quyền xem thông tin Admin.', 403);
  }
  assertManagerBoundary(actor, user);
  return user;
};

const createUser = async (data, actor) => {
  const role = await ensureRoleIsAssignable(data.role || 'Student');
  assertManagerBoundary(actor, null, role);

  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) throw businessError('Email đã tồn tại.', 400);

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    role,
    isActive: data.isActive !== undefined ? data.isActive : true,
  });

  const result = user.toObject();
  delete result.password;
  return result;
};

const updateUser = async (id, data, actor) => {
  const user = await User.findById(id);
  if (!user) return null;

  const role = data.role ? await ensureRoleIsAssignable(data.role) : undefined;
  assertManagerBoundary(actor, user, role);
  if (actor._id.toString() === user._id.toString() && data.isActive === false) {
    throw businessError('Không thể tự khóa tài khoản của chính mình.', 400);
  }
  await ensureNotLastAdmin(user, { role, isActive: data.isActive });

  if (data.name !== undefined) user.name = data.name;
  if (role !== undefined) user.role = role;
  if (data.isActive !== undefined) user.isActive = data.isActive;
  await user.save();

  const result = user.toObject();
  delete result.password;
  return result;
};

const deactivateUser = async (id, actor) => {
  const user = await User.findById(id);
  if (!user) return null;
  if (actor._id.toString() === user._id.toString()) {
    throw businessError('Không thể xóa hoặc vô hiệu hóa tài khoản của chính mình.', 400);
  }
  if (actor.role !== 'Admin' && user.role === 'Manager') {
    throw businessError('Chỉ Admin mới có quyền vô hiệu hóa Manager.', 403);
  }
  assertManagerBoundary(actor, user);
  await ensureNotLastAdmin(user, { isActive: false });

  user.isActive = false;
  await user.save();
  return { _id: user._id, isActive: user.isActive };
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  ensureRoleIsAssignable,
};
