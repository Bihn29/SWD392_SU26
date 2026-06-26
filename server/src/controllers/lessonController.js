const Lesson = require('../models/Lesson');

exports.getLessonsBySubject = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const lessons = await Lesson.find({ subject: subjectId })
      .sort({ order: 1 })
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    res.status(200).json({ success: true, data: lessons });
  } catch (error) {
    next(error);
  }
};

exports.getLessonById = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
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
    const lesson = await Lesson.create(data);
    res.status(201).json({ success: true, data: lesson, message: 'Lesson created successfully' });
  } catch (error) {
    next(error);
  }
};

exports.updateLesson = async (req, res, next) => {
  try {
    const data = { ...req.body, updatedBy: req.user._id };
    const lesson = await Lesson.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    res.status(200).json({ success: true, data: lesson, message: 'Lesson updated successfully' });
  } catch (error) {
    next(error);
  }
};

exports.deleteLesson = async (req, res, next) => {
  try {
    // Soft delete
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { status: 'Inactive', updatedBy: req.user._id },
      { new: true }
    );
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    res.status(200).json({ success: true, message: 'Lesson deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

exports.activateLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      { status: 'Active', updatedBy: req.user._id },
      { new: true }
    );
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    res.status(200).json({ success: true, message: 'Lesson activated successfully' });
  } catch (error) {
    next(error);
  }
};
