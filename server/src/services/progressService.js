const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const Question = require('../models/Question');
const Registration = require('../models/Registration');

const error = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });

const ensureApproved = async (subjectId, studentId) => {
  const registration = await Registration.findOne({ subject: subjectId, student: studentId, status: 'Approved' });
  if (!registration) throw error('Bạn chưa được duyệt tham gia khóa học này.', 403);
};

const ensureLesson = async (subjectId, lessonId, type) => {
  const filter = { _id: lessonId, subject: subjectId, status: 'Active' };
  if (type) filter.type = type;
  const lesson = await Lesson.findOne(filter);
  if (!lesson) throw error('Không tìm thấy bài học hợp lệ.', 404);
  return lesson;
};

const markLessonComplete = async (subjectId, lessonId, studentId) => {
  await ensureApproved(subjectId, studentId);
  const lesson = await ensureLesson(subjectId, lessonId, undefined);
  if (lesson.type === 'Quiz') throw error('Quiz phải được hoàn thành bằng thao tác nộp bài.');

  let progress = await Progress.findOne({ student: studentId, lesson: lessonId });
  if (!progress) {
    progress = await Progress.create({
      student: studentId,
      subject: subjectId,
      lesson: lessonId,
      isCompleted: true,
      completedAt: new Date(),
    });
  } else if (!progress.isCompleted) {
    progress.isCompleted = true;
    progress.completedAt = new Date();
    await progress.save();
  }
  return progress;
};

const submitQuiz = async (subjectId, lessonId, studentId, answers = {}) => {
  await ensureApproved(subjectId, studentId);
  await ensureLesson(subjectId, lessonId, 'Quiz');

  const questions = await Question.find({ lesson: lessonId }).lean();
  if (questions.length === 0) throw error('Bài quiz chưa có câu hỏi');

  const correctAnswersCount = questions.reduce((correct, question) => {
    const answer = answers[question._id.toString()];
    const selectedOption = answer !== undefined && answer !== null ? question.options[answer] : null;
    return correct + (selectedOption?.isCorrect ? 1 : 0);
  }, 0);
  const score = Math.round((correctAnswersCount / questions.length) * 100);

  let progress = await Progress.findOne({ student: studentId, lesson: lessonId });
  if (!progress) {
    progress = await Progress.create({
      student: studentId,
      subject: subjectId,
      lesson: lessonId,
      isCompleted: true,
      score,
      completedAt: new Date(),
    });
  } else {
    if (progress.score === null || progress.score === undefined || score >= progress.score) progress.score = score;
    progress.isCompleted = true;
    progress.completedAt = new Date();
    await progress.save();
  }

  return { score, correct: correctAnswersCount, total: questions.length, progress };
};

const getStudentProgress = (subjectId, studentId) => Progress.find({ student: studentId, subject: subjectId }).lean();

module.exports = {
  markLessonComplete,
  submitQuiz,
  getStudentProgress,
};
