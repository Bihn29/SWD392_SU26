const Role = require('../models/Role');

const getRoles = async ({ page = 1, limit = 10, search, status, sortBy = 'createdAt', order = 'desc' }) => {
  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } },
    ];
  }

  const sortOrder = order === 'asc' ? 1 : -1;
  const allowedSortFields = ['createdAt', 'updatedAt', 'name', 'code', 'status'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

  const skip = (Number(page) - 1) * Number(limit);
  const limitNum = Number(limit);

  const [items, totalItems] = await Promise.all([
    Role.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Role.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page: Number(page),
      limit: limitNum,
      totalItems,
      totalPages: Math.ceil(totalItems / limitNum),
    },
  };
};

const getRoleById = async (id) => {
  return Role.findById(id)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .lean();
};

const createRole = async (data, userId) => {
  const existingRole = await Role.findOne({ code: data.code });
  if (existingRole) {
    const err = new Error('Mã vai trò đã tồn tại');
    err.statusCode = 400;
    throw err;
  }

  const role = await Role.create({
    ...data,
    createdBy: userId,
    updatedBy: userId,
  });

  return Role.findById(role._id)
    .populate('createdBy', 'name email')
    .lean();
};

const updateRole = async (id, data, userId) => {
  const role = await Role.findById(id);
  if (!role) return null;

  if (data.code && data.code !== role.code) {
    if (role.isSystemRole) {
      const err = new Error('Không thể thay đổi mã của vai trò hệ thống');
      err.statusCode = 400;
      throw err;
    }
    const existingRole = await Role.findOne({ code: data.code });
    if (existingRole) {
      const err = new Error('Mã vai trò đã tồn tại');
      err.statusCode = 400;
      throw err;
    }
  }

  if (role.code === 'Admin' && data.permissions && data.permissions.length === 0) {
    const err = new Error('Không thể xóa tất cả quyền của vai trò Admin');
    err.statusCode = 400;
    throw err;
  }

  Object.assign(role, data);
  role.updatedBy = userId;
  await role.save();

  return Role.findById(role._id)
    .populate('updatedBy', 'name email')
    .lean();
};

const deactivateRole = async (id, userId) => {
  const role = await Role.findById(id);
  if (!role) return null;

  if (role.code === 'Admin') {
    const activeAdminsCount = await Role.countDocuments({ code: 'Admin', status: 'Active' });
    if (activeAdminsCount <= 1) {
      const err = new Error('Không thể ngừng hoạt động vai trò Admin duy nhất');
      err.statusCode = 400;
      throw err;
    }
  }

  role.status = 'Inactive';
  role.updatedBy = userId;
  await role.save();
  return role;
};

const activateRole = async (id, userId) => {
  const role = await Role.findById(id);
  if (!role) return null;

  role.status = 'Active';
  role.updatedBy = userId;
  await role.save();
  return role;
};

module.exports = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deactivateRole,
  activateRole,
};
