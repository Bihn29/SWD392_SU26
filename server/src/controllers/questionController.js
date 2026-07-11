const questionService = require('../services/questionService');

exports.getQuestionsByLesson = async (req, res, next) => {
  try {
    const data = await questionService.getQuestionsByLesson(req.params.lessonId, req.params.subjectId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.createQuestion = async (req, res, next) => {
  try {
    const data = await questionService.createQuestion(req.params.lessonId, req.params.subjectId, req.body, req.user._id);
    res.status(201).json({ success: true, message: 'Thêm câu hỏi thành công', data });
  } catch (error) { next(error); }
};

exports.updateQuestion = async (req, res, next) => {
  try {
    const data = await questionService.updateQuestion(req.params.id, req.params.lessonId, req.params.subjectId, req.body, req.user._id);
    res.status(200).json({ success: true, message: 'Cập nhật thành công', data });
  } catch (error) { next(error); }
};

exports.deleteQuestion = async (req, res, next) => {
  try {
    const data = await questionService.deleteQuestion(req.params.id, req.params.lessonId, req.params.subjectId);
    res.status(200).json({ success: true, message: 'Xóa câu hỏi thành công', data });
  } catch (error) { next(error); }
};
