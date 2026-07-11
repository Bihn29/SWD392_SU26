const QA = require('../models/QA');
const Subject = require('../models/Subject');
const Lesson = require('../models/Lesson');
const Registration = require('../models/Registration');

const error = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });

const isOwnerOrAdmin = (subject, user) => ['Admin', 'Manager'].includes(user.role) ||
  (user.role === 'Teacher' && subject.owner.toString() === user._id.toString());

const ensureLessonInSubject = async (subjectId, lessonId) => {
  const lesson = await Lesson.findOne({ _id: lessonId, subject: subjectId, status: 'Active' }).lean();
  if (!lesson) throw error('Bài học không tồn tại trong khóa học này.', 404);
  const subject = await Subject.findById(subjectId).lean();
  if (!subject) throw error('Khóa học không tồn tại.', 404);
  return { lesson, subject };
};

const getQAsBySubject = async (subjectId, user) => {
  const subject = await Subject.findById(subjectId).lean();
  if (!subject) throw error('Khóa học không tồn tại.', 404);
  if (!isOwnerOrAdmin(subject, user)) throw error('Bạn không có quyền xem Q&A của khóa học này.', 403);

  const qas = await QA.find({ subject: subjectId, parentQa: null, status: 'Active' })
    .populate('user', 'name email avatar role').populate('lesson', 'title order')
    .sort({ createdAt: -1 }).lean();
  const qaIds = qas.map((qa) => qa._id);
  const replies = await QA.find({ parentQa: { $in: qaIds }, status: 'Active' })
    .populate('user', 'name email avatar role').sort({ createdAt: 1 }).lean();
  return qas.map((qa) => ({ ...qa, replies: replies.filter((reply) => reply.parentQa.toString() === qa._id.toString()) }));
};

const getQAsByLesson = async (lessonId, user) => {
  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson) throw error('Bài học không tồn tại.', 404);
  const subject = await Subject.findById(lesson.subject).lean();
  if (!subject) throw error('Khóa học không tồn tại.', 404);
  if (!isOwnerOrAdmin(subject, user)) {
    const registration = await Registration.findOne({ subject: subject._id, student: user._id, status: 'Approved' });
    if (!registration) throw error('Bạn chưa được duyệt tham gia khóa học này.', 403);
  }

  const qas = await QA.find({ lesson: lessonId, parentQa: null, status: 'Active' })
    .populate('user', 'name avatar role').sort({ createdAt: -1 }).lean();
  const qaIds = qas.map((qa) => qa._id);
  const replies = await QA.find({ parentQa: { $in: qaIds }, status: 'Active' })
    .populate('user', 'name avatar role').sort({ createdAt: 1 }).lean();
  return qas.map((qa) => ({ ...qa, replies: replies.filter((reply) => reply.parentQa.toString() === qa._id.toString()) }));
};

const createQA = async ({ subjectId, lessonId, content, parentQa, user }) => {
  const { subject } = await ensureLessonInSubject(subjectId, lessonId);
  if (!isOwnerOrAdmin(subject, user)) {
    const registration = await Registration.findOne({ subject: subjectId, student: user._id, status: 'Approved' });
    if (!registration) throw error('Bạn chưa được duyệt tham gia khóa học này.', 403);
  }

  if (parentQa) {
    const parent = await QA.findOne({ _id: parentQa, subject: subjectId, lesson: lessonId, status: 'Active' });
    if (!parent) throw error('Câu hỏi gốc không hợp lệ.', 400);
  }

  const qa = await QA.create({ subject: subjectId, lesson: lessonId, user: user._id, content, parentQa: parentQa || null });
  return QA.findById(qa._id).populate('user', 'name avatar role').lean();
};

const changeQAState = async (id, user, update) => {
  const qa = await QA.findById(id);
  if (!qa) throw error('Không tìm thấy QA.', 404);
  const subject = await Subject.findById(qa.subject).lean();
  if (!subject || !isOwnerOrAdmin(subject, user)) throw error('Bạn không có quyền quản lý QA này.', 403);
  return QA.findByIdAndUpdate(id, update, { new: true }).lean();
};

module.exports = { getQAsBySubject, getQAsByLesson, createQA, changeQAState };
