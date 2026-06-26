const Registration = require('../models/Registration');

exports.getStudentsBySubject = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    // Lấy danh sách đăng ký đã duyệt của khóa học này
    const registrations = await Registration.find({ subject: subjectId, status: 'Approved' })
      .populate('student', 'name email phone createdAt isActive')
      .sort({ registeredAt: -1 });

    const data = registrations.map(reg => ({
      _id: reg.student._id,
      fullName: reg.student.name,
      email: reg.student.email,
      phone: reg.student.phone || '—',
      registeredAt: reg.registeredAt,
      registrationStatus: reg.status,
      isActive: reg.student.isActive
    }));

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách học viên thành công',
      data,
      total: data.length
    });
  } catch (error) {
    next(error);
  }
};
