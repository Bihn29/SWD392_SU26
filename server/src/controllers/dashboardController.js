const User = require('../models/User');
const Subject = require('../models/Subject');
const Lesson = require('../models/Lesson');
const Registration = require('../models/Registration');

exports.getOverview = async (req, res) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      totalManagers,
      totalTeachers,
      totalStudents,
      totalSubjects,
      publishedSubjects,
      draftSubjects,
      totalLessons,
      totalEnrolledStudents
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'Admin' }),
      User.countDocuments({ role: 'Manager' }),
      User.countDocuments({ role: 'Teacher' }),
      User.countDocuments({ role: 'Student' }),
      Subject.countDocuments(),
      Subject.countDocuments({ status: 'Published' }),
      Subject.countDocuments({ status: 'Draft' }),
      Lesson.countDocuments(),
      Registration.countDocuments({ registrationStatus: 'Approved' })
    ]);

    res.status(200).json({
      success: true,
      message: 'Lấy dữ liệu tổng quan thành công',
      data: {
        stats: {
          totalUsers,
          totalAdmins,
          totalManagers,
          totalTeachers,
          totalStudents,
          totalSubjects,
          publishedSubjects,
          draftSubjects,
          totalLessons,
          totalEnrolledStudents
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server khi tải overview' });
  }
};

exports.getDetails = async (req, res) => {
  try {
    const { type } = req.query;
    let items = [];

    switch (type) {
      case 'users':
        items = await User.find().select('-password').sort({ createdAt: -1 }).lean();
        break;
      case 'admins':
        items = await User.find({ role: 'Admin' }).select('-password').sort({ createdAt: -1 }).lean();
        break;
      case 'managers':
        items = await User.find({ role: 'Manager' }).select('-password').sort({ createdAt: -1 }).lean();
        break;
      case 'teachers':
        items = await User.find({ role: 'Teacher' }).select('-password').sort({ createdAt: -1 }).lean();
        break;
      case 'students':
        items = await User.find({ role: 'Student' }).select('-password').sort({ createdAt: -1 }).lean();
        break;
      case 'subjects':
        items = await Subject.find().populate('owner', 'name').sort({ createdAt: -1 }).lean();
        break;
      case 'publishedSubjects':
        items = await Subject.find({ status: 'Published' }).populate('owner', 'name').sort({ createdAt: -1 }).lean();
        break;
      case 'draftSubjects':
        items = await Subject.find({ status: 'Draft' }).populate('owner', 'name').sort({ createdAt: -1 }).lean();
        break;
      case 'lessons':
        items = await Lesson.find().populate('subject', 'name').sort({ createdAt: -1 }).lean();
        break;
      case 'enrolledStudents':
        items = await Registration.find({ registrationStatus: 'Approved' })
          .populate('student', 'name email')
          .populate('subject', 'name')
          .sort({ createdAt: -1 }).lean();
        break;
      default:
        return res.status(400).json({ success: false, message: 'Loại dữ liệu không hợp lệ' });
    }

    res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server khi tải chi tiết' });
  }
};
