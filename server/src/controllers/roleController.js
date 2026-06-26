const roleService = require('../services/roleService');

const getRoles = async (req, res, next) => {
  try {
    const { page, limit, search, status, sortBy, order } = req.query;
    const result = await roleService.getRoles({ page, limit, search, status, sortBy, order });

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách vai trò thành công',
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getRoleById = async (req, res, next) => {
  try {
    const role = await roleService.getRoleById(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy vai trò' });
    }

    return res.status(200).json({
      success: true,
      message: 'Lấy thông tin vai trò thành công',
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

const createRole = async (req, res, next) => {
  try {
    const role = await roleService.createRole(req.body, req.user._id);
    return res.status(201).json({
      success: true,
      message: 'Tạo vai trò thành công',
      data: role,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const updateRole = async (req, res, next) => {
  try {
    const role = await roleService.updateRole(req.params.id, req.body, req.user._id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy vai trò' });
    }
    return res.status(200).json({
      success: true,
      message: 'Cập nhật vai trò thành công',
      data: role,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const deactivateRole = async (req, res, next) => {
  try {
    const role = await roleService.deactivateRole(req.params.id, req.user._id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy vai trò' });
    }
    return res.status(200).json({
      success: true,
      message: 'Ngừng hoạt động vai trò thành công',
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const activateRole = async (req, res, next) => {
  try {
    const role = await roleService.activateRole(req.params.id, req.user._id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy vai trò' });
    }
    return res.status(200).json({
      success: true,
      message: 'Kích hoạt vai trò thành công',
      data: role,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deactivateRole,
  activateRole,
};
