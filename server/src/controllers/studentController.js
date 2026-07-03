const Subject = require('../models/Subject');
const Registration = require('../models/Registration');
const Lesson = require('../models/Lesson');
const { getPublicSubjects } = require('../services/subjectService');

exports.getStudentHome = async (req, res, next) => {
  try {
    const studentId = req.user._id;

    // 1. Lấy thống kê
    // Số khóa học đã đăng ký
    const totalEnrolled = await Registration.countDocuments({ student: studentId });
    // Số khóa học đang học (Approved)
    const totalLearning = await Registration.countDocuments({ student: studentId, status: 'Approved' });
    // Số khóa học hoàn thành (tạm thời để 0)
    const totalCompleted = 0;

    // 2. Tiếp tục học (Danh sách khóa đang học)
    const enrolledRegistrations = await Registration.find({ student: studentId, status: 'Approved' })
      .populate({
        path: 'subject',
        select: 'name thumbnail category owner',
        populate: { path: 'owner', select: 'name' }
      })
      .lean();

    const continueLearning = enrolledRegistrations
      .filter(reg => reg.subject) // Lọc bỏ nếu môn học đã bị xóa
      .map(reg => reg.subject);

    // 3. Khóa học nổi bật (Featured courses - 6 khóa học mới nhất Published)
    const featuredSubjects = await Subject.find({ status: 'Published' })
      .populate('owner', 'name')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    // Tính số lượng bài học và học viên cho khóa nổi bật
    const featuredWithCounts = await Promise.all(featuredSubjects.map(async (subject) => {
      const studentCount = await Registration.countDocuments({ subject: subject._id, status: 'Approved' });
      const lessonCount = await Lesson.countDocuments({ subject: subject._id });
      return { ...subject, studentCount, lessonCount };
    }));

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalEnrolled,
          totalLearning,
          totalCompleted
        },
        continueLearning,
        featuredCourses: featuredWithCounts
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.enrollCourse = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { courseId } = req.params;

    // Kiểm tra khóa học có tồn tại và đang Published không
    const subject = await Subject.findOne({ _id: courseId, status: 'Published' });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Khóa học không tồn tại hoặc chưa được xuất bản.' });
    }

    // Kiểm tra xem đã đăng ký chưa
    const existingRegistration = await Registration.findOne({ student: studentId, subject: courseId });
    if (existingRegistration) {
      return res.status(400).json({ success: false, message: 'Bạn đã đăng ký khóa học này rồi.' });
    }

    // Tạo Registration mới (Auto-Approve theo yêu cầu)
    const registration = await Registration.create({
      student: studentId,
      subject: courseId,
      status: 'Approved',
      approvedAt: Date.now()
    });

    res.status(201).json({
      success: true,
      message: 'Đăng ký khóa học thành công',
      data: registration
    });
  } catch (error) {
    next(error);
  }
};

exports.checkEnrollment = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const { courseId } = req.params;

    const registration = await Registration.findOne({ student: studentId, subject: courseId }).lean();
    
    res.status(200).json({
      success: true,
      data: {
        isEnrolled: !!registration,
        registration: registration || null
      }
    });
  } catch (error) {
    next(error);
  }
};
