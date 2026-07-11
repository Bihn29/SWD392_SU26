const studentService = require('../services/studentService');

exports.getStudentHome = async (req, res, next) => {
  try { res.status(200).json({ success: true, data: await studentService.getStudentHome(req.user._id) }); }
  catch (error) { next(error); }
};

exports.enrollCourse = async (req, res, next) => {
  try {
    const data = await studentService.enrollCourse(req.user._id, req.params.courseId);
    res.status(201).json({ success: true, message: 'Đăng ký khóa học thành công, đang chờ duyệt', data });
  } catch (error) { next(error); }
};

exports.checkEnrollment = async (req, res, next) => {
  try { res.status(200).json({ success: true, data: await studentService.checkEnrollment(req.user._id, req.params.courseId) }); }
  catch (error) { next(error); }
};

exports.getCourseLessons = async (req, res, next) => {
  try { res.status(200).json({ success: true, data: await studentService.getCourseLessons(req.user._id, req.params.courseId) }); }
  catch (error) { next(error); }
};

exports.getQuizQuestions = async (req, res, next) => {
  try {
    const data = await studentService.getQuizQuestions(req.user._id, req.params.courseId, req.params.lessonId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getStudentQuizzes = async (req, res, next) => {
  try { res.status(200).json({ success: true, data: await studentService.getStudentQuizzes(req.user._id) }); }
  catch (error) { next(error); }
};
