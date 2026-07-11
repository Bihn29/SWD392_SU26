const Lesson = require('../models/Lesson');
const Subject = require('../models/Subject');

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
  const subject = await Subject.findById(data.subject).select('_id');
  if (!subject) {
    const error = new Error('Subject not found');
    error.statusCode = 404;
    throw error;
  }
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
