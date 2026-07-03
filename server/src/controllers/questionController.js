const Question = require('../models/Question');
const Lesson = require('../models/Lesson');

exports.getQuestionsByLesson = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    const questions = await Question.find({ lesson: lessonId }).sort({ order: 1 });
    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    next(error);
  }
};

exports.createQuestion = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Bài học không tồn tại' });
    }
    
    if (lesson.type !== 'Quiz') {
      return res.status(400).json({ success: false, message: 'Chỉ có thể thêm câu hỏi vào bài học loại Quiz' });
    }

    const question = await Question.create({
      ...req.body,
      lesson: lessonId,
      createdBy: req.user._id,
      updatedBy: req.user._id
    });
    
    res.status(201).json({ success: true, message: 'Thêm câu hỏi thành công', data: question });
  } catch (error) {
    next(error);
  }
};

exports.updateQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const question = await Question.findByIdAndUpdate(
      id,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );
    
    if (!question) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
    }
    
    res.status(200).json({ success: true, message: 'Cập nhật thành công', data: question });
  } catch (error) {
    next(error);
  }
};

exports.deleteQuestion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const question = await Question.findByIdAndDelete(id);
    
    if (!question) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
    }
    
    res.status(200).json({ success: true, message: 'Xóa câu hỏi thành công' });
  } catch (error) {
    next(error);
  }
};
