const dashboardService = require('../services/dashboardService');

exports.getOverview = async (req, res, next) => {
  try {
    const stats = await dashboardService.getOverview(req.user);
    res.status(200).json({ success: true, message: 'Lấy dữ liệu tổng quan thành công', data: { stats } });
  } catch (error) {
    next(error);
  }
};

exports.getDetails = async (req, res, next) => {
  try {
    const items = await dashboardService.getDetails(req.query.type, req.user);
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

exports.getTeacherDashboard = async (req, res, next) => {
  try {
    const data = await dashboardService.getTeacherDashboard(req.user._id);
    res.status(200).json({ success: true, message: 'Lấy dữ liệu tổng quan thành công', data });
  } catch (error) {
    next(error);
  }
};
