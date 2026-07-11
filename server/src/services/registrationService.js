const Registration = require('../models/Registration');
const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const Subject = require('../models/Subject');

const error = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });

const getStudentsBySubject = async (subjectId, status) => {
  const query = { subject: subjectId, status: status || { $in: ['Pending', 'Approved', 'Rejected'] } };
  const lessons = await Lesson.find({ subject: subjectId }).lean();
  const totalLessons = lessons.length;
  const totalQuizzes = lessons.filter((lesson) => lesson.type === 'Quiz').length;

  const registrations = await Registration.find(query)
    .populate('student', 'name email phone createdAt isActive')
    .sort({ registeredAt: -1 })
    .lean();

  const studentIds = registrations.filter((registration) => registration.student).map((registration) => registration.student._id);
  const allProgress = await Progress.find({ subject: subjectId, student: { $in: studentIds } }).lean();

  const data = registrations.filter((registration) => registration.student).map((registration) => {
    const studentProgress = allProgress.filter((progress) => progress.student.toString() === registration.student._id.toString());
    const completedLessons = studentProgress.filter((progress) => progress.isCompleted).length;
    const progressPercent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
    const quizProgress = studentProgress.filter((progress) => progress.score !== null && progress.score !== undefined);
    const averageScore = quizProgress.length > 0
      ? Math.round(quizProgress.reduce((sum, progress) => sum + progress.score, 0) / quizProgress.length)
      : null;

    return {
      _id: registration.student._id,
      registrationId: registration._id,
      fullName: registration.student.name,
      email: registration.student.email,
      phone: registration.student.phone || '—',
      registeredAt: registration.registeredAt,
      registrationStatus: registration.status,
      isActive: registration.student.isActive,
      rejectedReason: registration.rejectedReason,
      progressPercent,
      averageScore: totalQuizzes > 0 ? averageScore : null,
    };
  });

  return { data, total: data.length };
};

const enrollCourse = async (studentId, subjectId) => {
  const subject = await Subject.findOne({ _id: subjectId, status: 'Published' });
  if (!subject) throw error('Khóa học không tồn tại hoặc chưa được xuất bản.', 404);

  const existingRegistration = await Registration.findOne({ student: studentId, subject: subjectId });
  if (existingRegistration) throw error('Bạn đã đăng ký khóa học này rồi.');

  return Registration.create({
    student: studentId,
    subject: subjectId,
    status: 'Pending',
  });
};

const findRegistration = async (subjectId, registrationId) => {
  const registration = await Registration.findOne({ _id: registrationId, subject: subjectId });
  if (!registration) throw error('Không tìm thấy thông tin đăng ký.', 404);
  return registration;
};

const approveRegistration = async (subjectId, registrationId, userId) => {
  const registration = await findRegistration(subjectId, registrationId);
  if (registration.status === 'Approved') throw error('Học viên này đã được duyệt trước đó.');
  if (registration.status !== 'Pending') throw error('Chỉ có thể duyệt học viên đang chờ (Pending).');

  registration.status = 'Approved';
  registration.approvedBy = userId;
  registration.approvedAt = new Date();
  await registration.save();
  return registration;
};

const rejectRegistration = async (subjectId, registrationId, rejectedReason, userId) => {
  const registration = await findRegistration(subjectId, registrationId);
  if (registration.status === 'Rejected') throw error('Học viên này đã bị từ chối trước đó.');
  if (registration.status !== 'Pending') throw error('Chỉ có thể từ chối học viên đang chờ (Pending).');

  registration.status = 'Rejected';
  registration.rejectedReason = rejectedReason || 'Không có lý do';
  registration.rejectedBy = userId;
  registration.rejectedAt = new Date();
  await registration.save();
  return registration;
};

const getStudentDetailedProgress = async (subjectId, studentId) => {
  const [lessons, progressList] = await Promise.all([
    Lesson.find({ subject: subjectId }).sort({ order: 1 }).lean(),
    Progress.find({ subject: subjectId, student: studentId }).lean(),
  ]);

  return lessons.map((lesson) => {
    const progress = progressList.find((item) => item.lesson.toString() === lesson._id.toString());
    return {
      lessonId: lesson._id,
      title: lesson.title,
      type: lesson.type,
      order: lesson.order,
      isCompleted: progress ? progress.isCompleted : false,
      score: progress ? progress.score : null,
      completedAt: progress ? progress.completedAt : null,
    };
  });
};

module.exports = {
  enrollCourse,
  getStudentsBySubject,
  approveRegistration,
  rejectRegistration,
  getStudentDetailedProgress,
};
