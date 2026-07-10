const lessonService = require('../services/lessonService');

exports.getLessonsBySubject = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const lessons = await lessonService.getLessonsBySubjectId(subjectId);
    res.status(200).json({ success: true, data: lessons });
  } catch (error) {
    next(error);
  }
};

exports.getLessonById = async (req, res, next) => {
  try {
    const lesson = await lessonService.getLessonById(req.params.id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    res.status(200).json({ success: true, data: lesson });
  } catch (error) {
    next(error);
  }
};

exports.createLesson = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const data = { ...req.body, subject: subjectId, createdBy: req.user._id, updatedBy: req.user._id };
    const lesson = await lessonService.createLesson(data);
    res.status(201).json({ success: true, data: lesson, message: 'Lesson created successfully' });
  } catch (error) {
    next(error);
  }
};

exports.updateLesson = async (req, res, next) => {
  try {
    const data = { ...req.body, updatedBy: req.user._id };
    const lesson = await lessonService.updateLesson(req.params.id, data);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    res.status(200).json({ success: true, data: lesson, message: 'Lesson updated successfully' });
  } catch (error) {
    next(error);
  }
};

exports.deleteLesson = async (req, res, next) => {
  try {
    // Soft delete
    const lesson = await lessonService.softDeleteLesson(req.params.id, req.user._id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    res.status(200).json({ success: true, message: 'Lesson deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

exports.activateLesson = async (req, res, next) => {
  try {
    const lesson = await lessonService.activateLesson(req.params.id, req.user._id);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    res.status(200).json({ success: true, message: 'Lesson activated successfully' });
  } catch (error) {
    next(error);
  }
};

