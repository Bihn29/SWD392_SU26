const Registration = require('../models/Registration');
const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');

exports.getStudentsBySubject = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const { status } = req.query;

    let query = { subject: subjectId };
    
    // Nếu có query status, tiến hành filter, nếu không mặc định lấy Pending, Approved, Rejected
    if (status) {
      query.status = status;
    } else {
      query.status = { $in: ['Pending', 'Approved', 'Rejected'] };
    }

    // Fetch lessons for the subject to calculate percentage
    const lessons = await Lesson.find({ subject: subjectId });
    const totalLessons = lessons.length;
    const quizLessons = lessons.filter(l => l.type === 'Quiz');
    const totalQuizzes = quizLessons.length;

    const registrations = await Registration.find(query)
      .populate('student', 'name email phone createdAt isActive')
      .sort({ registeredAt: -1 });

    const studentIds = registrations.map(reg => reg.student._id);
    
    // Fetch all progress for these students in this subject
    const allProgress = await Progress.find({ subject: subjectId, student: { $in: studentIds } });

    const data = registrations.map(reg => {
      const studentProgress = allProgress.filter(p => p.student.toString() === reg.student._id.toString());
      
      const completedLessons = studentProgress.filter(p => p.isCompleted).length;
      const progressPercent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

      const quizProgress = studentProgress.filter(p => p.score !== null);
      let averageScore = 0;
      if (quizProgress.length > 0) {
        const totalScore = quizProgress.reduce((sum, p) => sum + p.score, 0);
        averageScore = Math.round(totalScore / totalQuizzes); // or / quizProgress.length if we only count taken quizzes. Usually / totalQuizzes. Let's do / quizProgress.length so if they take 1 quiz, they have a score. Let's do / totalQuizzes for true average. Let's just do / quizProgress.length for average of taken quizzes.
        averageScore = Math.round(totalScore / quizProgress.length);
      }

      return {
        _id: reg.student._id,
        registrationId: reg._id,
        fullName: reg.student.name,
        email: reg.student.email,
        phone: reg.student.phone || '—',
        registeredAt: reg.registeredAt,
        registrationStatus: reg.status,
        isActive: reg.student.isActive,
        rejectedReason: reg.rejectedReason,
        progressPercent,
        averageScore: quizProgress.length > 0 ? averageScore : null
      };
    });

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

exports.approveRegistration = async (req, res, next) => {
  try {
    const { subjectId, registrationId } = req.params;

    const registration = await Registration.findOne({ _id: registrationId, subject: subjectId });

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin đăng ký.' });
    }

    if (registration.status === 'Approved') {
      return res.status(400).json({ success: false, message: 'Học viên này đã được duyệt trước đó.' });
    }

    if (registration.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Chỉ có thể duyệt học viên đang chờ (Pending).' });
    }

    registration.status = 'Approved';
    registration.approvedBy = req.user._id;
    registration.approvedAt = Date.now();

    await registration.save();

    res.status(200).json({
      success: true,
      message: 'Đã duyệt học viên thành công.',
      data: registration
    });
  } catch (error) {
    next(error);
  }
};

exports.rejectRegistration = async (req, res, next) => {
  try {
    const { subjectId, registrationId } = req.params;
    const { rejectedReason } = req.body;

    const registration = await Registration.findOne({ _id: registrationId, subject: subjectId });

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin đăng ký.' });
    }

    if (registration.status === 'Rejected') {
      return res.status(400).json({ success: false, message: 'Học viên này đã bị từ chối trước đó.' });
    }

    if (registration.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Chỉ có thể từ chối học viên đang chờ (Pending).' });
    }

    registration.status = 'Rejected';
    registration.rejectedReason = rejectedReason || 'Không có lý do';
    registration.rejectedBy = req.user._id;
    registration.rejectedAt = Date.now();

    await registration.save();

    res.status(200).json({
      success: true,
      message: 'Đã từ chối học viên thành công.',
      data: registration
    });
  } catch (error) {
    next(error);
  }
};

exports.getStudentDetailedProgress = async (req, res, next) => {
  try {
    const { subjectId, studentId } = req.params;

    // Lấy toàn bộ bài học của khóa
    const lessons = await Lesson.find({ subject: subjectId }).sort({ order: 1 }).lean();
    
    // Lấy toàn bộ progress của sinh viên này
    const progressList = await Progress.find({ subject: subjectId, student: studentId }).lean();

    // Ghép dữ liệu
    const detailedProgress = lessons.map(lesson => {
      const p = progressList.find(prog => prog.lesson.toString() === lesson._id.toString());
      return {
        lessonId: lesson._id,
        title: lesson.title,
        type: lesson.type,
        order: lesson.order,
        isCompleted: p ? p.isCompleted : false,
        score: p ? p.score : null,
        completedAt: p ? p.completedAt : null
      };
    });

    res.status(200).json({
      success: true,
      message: 'Lấy chi tiết điểm thành công',
      data: detailedProgress
    });
  } catch (error) {
    next(error);
  }
};
