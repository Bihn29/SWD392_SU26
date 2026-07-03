const QA = require('../models/QA');
const Subject = require('../models/Subject');
const Lesson = require('../models/Lesson');

// Lấy danh sách Q&A của một khóa học (Dành cho Giảng viên/Admin)
exports.getQAsBySubject = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    
    // Chỉ lấy các câu hỏi gốc (parentQa = null)
    const qas = await QA.find({ subject: subjectId, parentQa: null, status: 'Active' })
      .populate('user', 'name email avatar role')
      .populate('lesson', 'title order')
      .sort({ createdAt: -1 })
      .lean();

    // Lấy tất cả câu trả lời cho các câu hỏi trên
    const qaIds = qas.map(qa => qa._id);
    const replies = await QA.find({ parentQa: { $in: qaIds }, status: 'Active' })
      .populate('user', 'name email avatar role')
      .sort({ createdAt: 1 })
      .lean();

    // Ghép câu trả lời vào câu hỏi
    const qasWithReplies = qas.map(qa => {
      qa.replies = replies.filter(reply => reply.parentQa.toString() === qa._id.toString());
      return qa;
    });

    res.status(200).json({ success: true, data: qasWithReplies });
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách Q&A của một bài học (Dành cho Học viên)
exports.getQAsByLesson = async (req, res, next) => {
  try {
    const { lessonId } = req.params;
    
    const qas = await QA.find({ lesson: lessonId, parentQa: null, status: 'Active' })
      .populate('user', 'name avatar role')
      .sort({ createdAt: -1 })
      .lean();

    const qaIds = qas.map(qa => qa._id);
    const replies = await QA.find({ parentQa: { $in: qaIds }, status: 'Active' })
      .populate('user', 'name avatar role')
      .sort({ createdAt: 1 })
      .lean();

    const qasWithReplies = qas.map(qa => {
      qa.replies = replies.filter(reply => reply.parentQa.toString() === qa._id.toString());
      return qa;
    });

    res.status(200).json({ success: true, data: qasWithReplies });
  } catch (error) {
    next(error);
  }
};

// Thêm mới câu hỏi hoặc trả lời
exports.createQA = async (req, res, next) => {
  try {
    const { subjectId, lessonId } = req.params;
    const { content, parentQa } = req.body;

    const qa = await QA.create({
      subject: subjectId,
      lesson: lessonId,
      user: req.user._id,
      content,
      parentQa: parentQa || null
    });

    // Populate user info before returning
    const populatedQa = await QA.findById(qa._id).populate('user', 'name avatar role').lean();

    res.status(201).json({ success: true, message: 'Gửi thành công', data: populatedQa });
  } catch (error) {
    next(error);
  }
};

// Đánh dấu đã giải quyết (Resolved)
exports.markResolved = async (req, res, next) => {
  try {
    const { id } = req.params;
    const qa = await QA.findByIdAndUpdate(id, { isResolved: true }, { new: true });
    if (!qa) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy QA' });
    }
    res.status(200).json({ success: true, message: 'Đã đánh dấu giải quyết', data: qa });
  } catch (error) {
    next(error);
  }
};

// Xóa (Ẩn) QA
exports.deleteQA = async (req, res, next) => {
  try {
    const { id } = req.params;
    const qa = await QA.findByIdAndUpdate(id, { status: 'Hidden' });
    if (!qa) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy QA' });
    }
    res.status(200).json({ success: true, message: 'Xóa thành công' });
  } catch (error) {
    next(error);
  }
};
