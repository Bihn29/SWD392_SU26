const User = require('../models/User');
const Subject = require('../models/Subject');
const Lesson = require('../models/Lesson');
const Registration = require('../models/Registration');

const getOverview = async (actor) => {
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
    totalEnrolledStudents,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'Admin', isActive: true }),
    User.countDocuments({ role: 'Manager', isActive: true }),
    User.countDocuments({ role: 'Teacher', isActive: true }),
    User.countDocuments({ role: 'Student', isActive: true }),
    Subject.countDocuments(),
    Subject.countDocuments({ status: 'Published' }),
    Subject.countDocuments({ status: 'Draft' }),
    Lesson.countDocuments(),
    Registration.countDocuments({ status: 'Approved' }),
  ]);

  const stats = {
    totalUsers,
    totalAdmins,
    totalManagers,
    totalTeachers,
    totalStudents,
    totalSubjects,
    publishedSubjects,
    draftSubjects,
    totalLessons,
    totalEnrolledStudents,
  };

  if (actor.role !== 'Admin') {
    stats.totalAdmins = 0;
    stats.totalUsers = Math.max(0, totalUsers - totalAdmins);
  }
  return stats;
};

const getDetails = async (type, actor) => {
  if (actor.role !== 'Admin' && type === 'admins') {
    const error = new Error('Bạn không có quyền truy cập thông tin quản trị viên.');
    error.statusCode = 403;
    throw error;
  }

  switch (type) {
    case 'users':
      return User.find(actor.role === 'Admin' ? {} : { role: { $ne: 'Admin' } })
        .select('-password').sort({ createdAt: -1 }).lean();
    case 'admins':
      return User.find({ role: 'Admin' }).select('-password').sort({ createdAt: -1 }).lean();
    case 'managers':
      return User.find({ role: 'Manager' }).select('-password').sort({ createdAt: -1 }).lean();
    case 'teachers':
      return User.find({ role: 'Teacher' }).select('-password').sort({ createdAt: -1 }).lean();
    case 'students':
      return User.find({ role: 'Student' }).select('-password').sort({ createdAt: -1 }).lean();
    case 'subjects':
      return Subject.find().populate('owner', 'name').sort({ createdAt: -1 }).lean();
    case 'publishedSubjects':
      return Subject.find({ status: 'Published' }).populate('owner', 'name').sort({ createdAt: -1 }).lean();
    case 'draftSubjects':
      return Subject.find({ status: 'Draft' }).populate('owner', 'name').sort({ createdAt: -1 }).lean();
    case 'lessons':
      return Lesson.find().populate('subject', 'name').sort({ createdAt: -1 }).lean();
    case 'enrolledStudents':
      return Registration.find({ status: 'Approved' })
        .populate('student', 'name email')
        .populate('subject', 'name')
        .sort({ createdAt: -1 }).lean();
    default: {
      const error = new Error('Loại dữ liệu không hợp lệ');
      error.statusCode = 400;
      throw error;
    }
  }
};

const getTeacherDashboard = async (teacherId) => {
  const teacherSubjects = await Subject.find({ owner: teacherId }).select('_id').lean();
  const subjectIds = teacherSubjects.map((subject) => subject._id);
  const [totalSubjects, publishedSubjects, draftSubjects, totalLessons, totalEnrolledStudents, totalPendingStudents] = await Promise.all([
    Subject.countDocuments({ owner: teacherId }),
    Subject.countDocuments({ owner: teacherId, status: 'Published' }),
    Subject.countDocuments({ owner: teacherId, status: 'Draft' }),
    Lesson.countDocuments({ subject: { $in: subjectIds } }),
    Registration.countDocuments({ subject: { $in: subjectIds }, status: 'Approved' }),
    Registration.countDocuments({ subject: { $in: subjectIds }, status: 'Pending' }),
  ]);

  const latestSubjects = await Subject.find({ owner: teacherId }).sort({ createdAt: -1 }).limit(5).lean();
  const subjectsWithCounts = await Promise.all(latestSubjects.map(async (subject) => {
    const [studentCount, lessonCount] = await Promise.all([
      Registration.countDocuments({ subject: subject._id, status: 'Approved' }),
      Lesson.countDocuments({ subject: subject._id }),
    ]);
    return { ...subject, studentCount, lessonCount };
  }));

  return {
    stats: { totalSubjects, publishedSubjects, draftSubjects, totalLessons, totalEnrolledStudents, totalPendingStudents },
    latestSubjects: subjectsWithCounts,
  };
};

module.exports = { getOverview, getDetails, getTeacherDashboard };
