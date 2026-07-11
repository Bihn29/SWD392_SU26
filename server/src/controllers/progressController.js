const progressService = require('../services/progressService');

exports.markLessonComplete = async (req, res, next) => {
  try {
    const progress = await progressService.markLessonComplete(req.params.subjectId, req.params.lessonId, req.user._id);
    res.status(200).json({ success: true, message: 'Đã hoàn thành bài học', data: progress });
  } catch (error) {
    next(error);
  }
};

exports.submitQuiz = async (req, res, next) => {
  try {
    const result = await progressService.submitQuiz(
      req.params.subjectId,
      req.params.lessonId,
      req.user._id,
      req.body.answers || {},
    );
    res.status(200).json({
      success: true,
      message: 'Nộp bài thành công',
      data: { score: result.score, correct: result.correct, total: result.total },
    });
  } catch (error) {
    next(error);
  }
};

exports.getStudentProgress = async (req, res, next) => {
  try {
    const progress = await progressService.getStudentProgress(req.params.subjectId, req.user._id);
    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};
