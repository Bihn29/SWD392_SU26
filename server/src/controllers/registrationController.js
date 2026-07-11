const registrationService = require('../services/registrationService');

exports.getStudentsBySubject = async (req, res, next) => {
  try {
    const result = await registrationService.getStudentsBySubject(req.params.subjectId, req.query.status);
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách học viên thành công',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

exports.approveRegistration = async (req, res, next) => {
  try {
    const registration = await registrationService.approveRegistration(
      req.params.subjectId,
      req.params.registrationId,
      req.user._id,
    );
    res.status(200).json({ success: true, message: 'Đã duyệt học viên thành công.', data: registration });
  } catch (error) {
    next(error);
  }
};

exports.rejectRegistration = async (req, res, next) => {
  try {
    const registration = await registrationService.rejectRegistration(
      req.params.subjectId,
      req.params.registrationId,
      req.body.rejectedReason,
      req.user._id,
    );
    res.status(200).json({ success: true, message: 'Đã từ chối học viên thành công.', data: registration });
  } catch (error) {
    next(error);
  }
};

exports.getStudentDetailedProgress = async (req, res, next) => {
  try {
    const data = await registrationService.getStudentDetailedProgress(req.params.subjectId, req.params.studentId);
    res.status(200).json({ success: true, message: 'Lấy chi tiết điểm thành công', data });
  } catch (error) {
    next(error);
  }
};
