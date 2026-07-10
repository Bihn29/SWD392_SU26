const Lesson = require('../models/Lesson');

exports.getLessonsBySubjectId = async (subjectId) => {
  return await Lesson.find({ subject: subjectId })
    .sort({ order: 1 })
    .populate('createdBy', 'name')
    .populate('updatedBy', 'name');
};

exports.getLessonById = async (id) => {
  return await Lesson.findById(id);
};

exports.createLesson = async (data) => {
  return await Lesson.create(data);
};

exports.updateLesson = async (id, data) => {
  return await Lesson.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

exports.softDeleteLesson = async (id, userId) => {
  return await Lesson.findByIdAndUpdate(
    id,
    { status: 'Inactive', updatedBy: userId },
    { new: true }
  );
};

exports.activateLesson = async (id, userId) => {
  return await Lesson.findByIdAndUpdate(
    id,
    { status: 'Active', updatedBy: userId },
    { new: true }
  );
};
