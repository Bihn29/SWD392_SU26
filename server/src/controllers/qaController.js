const qaService = require('../services/qaService');

exports.getQAsBySubject = async (req, res, next) => {
  try {
    const data = await qaService.getQAsBySubject(req.params.subjectId, req.user);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getQAsByLesson = async (req, res, next) => {
  try {
    const data = await qaService.getQAsByLesson(req.params.lessonId, req.user);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.createQA = async (req, res, next) => {
  try {
    const data = await qaService.createQA({ ...req.params, ...req.body, user: req.user });
    res.status(201).json({ success: true, message: 'Gửi thành công', data });
  } catch (error) { next(error); }
};

exports.markResolved = async (req, res, next) => {
  try {
    const data = await qaService.changeQAState(req.params.id, req.user, { isResolved: true });
    res.status(200).json({ success: true, message: 'Đã đánh dấu giải quyết', data });
  } catch (error) { next(error); }
};

exports.deleteQA = async (req, res, next) => {
  try {
    const data = await qaService.changeQAState(req.params.id, req.user, { status: 'Hidden' });
    res.status(200).json({ success: true, message: 'Xóa thành công', data });
  } catch (error) { next(error); }
};
