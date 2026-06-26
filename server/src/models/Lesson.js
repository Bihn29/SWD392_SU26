const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Vui lòng nhập tên bài học'],
    trim: true
  },
  type: {
    type: String,
    enum: ['Video', 'HTML', 'Quiz'],
    required: true
  },
  order: {
    type: Number,
    required: true,
    default: 1
  },
  videoUrl: {
    type: String,
    trim: true
  },
  htmlContent: {
    type: String
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lesson', lessonSchema);
