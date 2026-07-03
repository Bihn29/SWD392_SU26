const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const Question = require('../models/Question');
const Registration = require('../models/Registration');

// Đánh dấu hoàn thành bài học (cho video/html)
exports.markLessonComplete = async (req, res, next) => {
  try {
    const { subjectId, lessonId } = req.params;
    const studentId = req.user._id;

    // Check if enrolled
    const registration = await Registration.findOne({ subject: subjectId, student: studentId, status: 'Approved' });
    if (!registration) {
      return res.status(403).json({ success: false, message: 'Bạn chưa đăng ký khóa học này' });
    }

    let progress = await Progress.findOne({ student: studentId, lesson: lessonId });
    if (!progress) {
      progress = await Progress.create({
        student: studentId,
        subject: subjectId,
        lesson: lessonId,
        isCompleted: true,
        completedAt: new Date()
      });
    } else if (!progress.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
      await progress.save();
    }

    res.status(200).json({ success: true, message: 'Đã hoàn thành bài học', data: progress });
  } catch (error) {
    next(error);
  }
};

// Nộp bài trắc nghiệm (chấm điểm tự động)
exports.submitQuiz = async (req, res, next) => {
  try {
    const { subjectId, lessonId } = req.params;
    const { answers } = req.body; // { questionId: selectedOptionId (or index) }
    const studentId = req.user._id;

    const registration = await Registration.findOne({ subject: subjectId, student: studentId, status: 'Approved' });
    if (!registration) {
      return res.status(403).json({ success: false, message: 'Bạn chưa đăng ký khóa học này' });
    }

    const questions = await Question.find({ lesson: lessonId });
    if (questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Bài quiz chưa có câu hỏi' });
    }

    let correctAnswersCount = 0;
    
    // Logic chấm điểm: compare selected option with the isCorrect option
    questions.forEach(q => {
      const studentAnswer = answers[q._id.toString()];
      if (studentAnswer !== undefined && studentAnswer !== null) {
        // assume studentAnswer is the index of the option they selected
        const selectedOption = q.options[studentAnswer];
        if (selectedOption && selectedOption.isCorrect) {
          correctAnswersCount += 1;
        }
      }
    });

    const score = Math.round((correctAnswersCount / questions.length) * 100);
    const isCompleted = true; // Quiz is completed upon submission

    let progress = await Progress.findOne({ student: studentId, lesson: lessonId });
    if (!progress) {
      progress = await Progress.create({
        student: studentId,
        subject: subjectId,
        lesson: lessonId,
        isCompleted,
        score,
        completedAt: new Date()
      });
    } else {
      // Keep highest score or always update? Let's always update for simplicity, or keep highest.
      // Usually, keep highest.
      if (progress.score === null || score >= progress.score) {
        progress.score = score;
      }
      progress.isCompleted = true;
      progress.completedAt = new Date();
      await progress.save();
    }

    res.status(200).json({ 
      success: true, 
      message: 'Nộp bài thành công', 
      data: { score, correct: correctAnswersCount, total: questions.length }
    });
  } catch (error) {
    next(error);
  }
};

// Lấy tiến độ của học viên trong 1 khóa học
exports.getStudentProgress = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const studentId = req.user._id;

    const progress = await Progress.find({ student: studentId, subject: subjectId }).lean();
    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};
