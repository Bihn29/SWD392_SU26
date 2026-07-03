const mongoose = require('mongoose');

const qaSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Nội dung không được để trống'],
    trim: true,
    maxlength: 2000
  },
  parentQa: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QA',
    default: null // null means it's a top-level question. non-null means it's a reply.
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Active', 'Hidden'],
    default: 'Active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('QA', qaSchema);
