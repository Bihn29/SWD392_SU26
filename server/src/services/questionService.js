const Question = require('../models/Question');
const Lesson = require('../models/Lesson');

const error = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });

const ensureQuizLesson = async (lessonId, subjectId) => {
  const filter = { _id: lessonId, type: 'Quiz' };
  if (subjectId) filter.subject = subjectId;
  const lesson = await Lesson.findOne(filter).lean();
  if (!lesson) throw error('Bài học Quiz không tồn tại hoặc không thuộc khóa học.', 404);
  return lesson;
};

const getQuestionsByLesson = async (lessonId, subjectId) => {
  await ensureQuizLesson(lessonId, subjectId);
  return Question.find({ lesson: lessonId }).sort({ order: 1 }).lean();
};

const createQuestion = async (lessonId, subjectId, data, userId) => {
  await ensureQuizLesson(lessonId, subjectId);
  return Question.create({ ...data, lesson: lessonId, createdBy: userId, updatedBy: userId });
};

const updateQuestion = async (id, lessonId, subjectId, data, userId) => {
  await ensureQuizLesson(lessonId, subjectId);
  const question = await Question.findOneAndUpdate(
    { _id: id, lesson: lessonId },
    { ...data, lesson: lessonId, updatedBy: userId },
    { new: true, runValidators: true },
  );
  if (!question) throw error('Không tìm thấy câu hỏi.', 404);
  return question;
};

const deleteQuestion = async (id, lessonId, subjectId) => {
  await ensureQuizLesson(lessonId, subjectId);
  const question = await Question.findOneAndDelete({ _id: id, lesson: lessonId });
  if (!question) throw error('Không tìm thấy câu hỏi.', 404);
  return question;
};

module.exports = { getQuestionsByLesson, createQuestion, updateQuestion, deleteQuestion };
