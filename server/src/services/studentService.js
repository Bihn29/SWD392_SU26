const Subject = require('../models/Subject');
const Registration = require('../models/Registration');
const Lesson = require('../models/Lesson');
const Question = require('../models/Question');
const Progress = require('../models/Progress');
const registrationService = require('./registrationService');

const error = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });
const ensureApproved = async (studentId, subjectId) => {
  const registration = await Registration.findOne({ student: studentId, subject: subjectId, status: 'Approved' });
  if (!registration) throw error('Bạn chưa đăng ký khóa học hoặc chưa được duyệt.', 403);
};

const getStudentHome = async (studentId) => {
  const [totalEnrolled, totalLearning, enrolledRegistrations, featuredSubjects] = await Promise.all([
    Registration.countDocuments({ student: studentId }),
    Registration.countDocuments({ student: studentId, status: 'Approved' }),
    Registration.find({ student: studentId, status: 'Approved' })
      .populate({ path: 'subject', select: 'name thumbnail category owner', populate: { path: 'owner', select: 'name' } }).lean(),
    Subject.find({ status: 'Published' }).populate('owner', 'name').sort({ createdAt: -1 }).limit(6).lean(),
  ]);

  const featuredCourses = await Promise.all(featuredSubjects.map(async (subject) => {
    const [studentCount, lessonCount] = await Promise.all([
      Registration.countDocuments({ subject: subject._id, status: 'Approved' }),
      Lesson.countDocuments({ subject: subject._id }),
    ]);
    return { ...subject, studentCount, lessonCount };
  }));

  return {
    stats: { totalEnrolled, totalLearning, totalCompleted: 0 },
    continueLearning: enrolledRegistrations.filter((registration) => registration.subject).map((registration) => registration.subject),
    featuredCourses,
  };
};

const enrollCourse = (studentId, courseId) => registrationService.enrollCourse(studentId, courseId);

const checkEnrollment = async (studentId, courseId) => {
  const registration = await Registration.findOne({ student: studentId, subject: courseId }).lean();
  return {
    isEnrolled: registration?.status === 'Approved',
    isPending: registration?.status === 'Pending',
    registration: registration || null,
  };
};

const getCourseLessons = async (studentId, courseId) => {
  await ensureApproved(studentId, courseId);
  return Lesson.find({ subject: courseId, status: 'Active' }).sort({ order: 1 }).lean();
};

const getQuizQuestions = async (studentId, courseId, lessonId) => {
  await ensureApproved(studentId, courseId);
  const lesson = await Lesson.findOne({ _id: lessonId, subject: courseId, status: 'Active', type: 'Quiz' });
  if (!lesson) throw error('Không tìm thấy bài Quiz.', 404);
  const questions = await Question.find({ lesson: lessonId }).lean();
  return questions.map((question) => ({
    ...question,
    options: question.options?.map((option) => ({ _id: option._id, text: option.text })),
  }));
};

const getStudentQuizzes = async (studentId) => {
  const registrations = await Registration.find({ student: studentId, status: 'Approved' }).lean();
  const subjectIds = registrations.map((registration) => registration.subject);
  const [quizLessons, progresses] = await Promise.all([
    Lesson.find({ subject: { $in: subjectIds }, status: 'Active', type: 'Quiz' }).populate('subject', 'name').lean(),
    Progress.find({ student: studentId }).lean(),
  ]);
  const progressMap = Object.fromEntries(progresses.map((progress) => [progress.lesson.toString(), progress]));
  return quizLessons.filter((quiz) => quiz.subject).map((quiz) => ({
    _id: quiz._id,
    title: quiz.title,
    subjectId: quiz.subject._id,
    subjectName: quiz.subject.name,
    isCompleted: progressMap[quiz._id.toString()]?.isCompleted || false,
    score: progressMap[quiz._id.toString()]?.score,
  }));
};

module.exports = { getStudentHome, enrollCourse, checkEnrollment, getCourseLessons, getQuizQuestions, getStudentQuizzes };
