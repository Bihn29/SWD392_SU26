const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
    default: 'Pending'
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectedReason: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Chống đăng ký trùng lặp: Mỗi student chỉ có 1 registration per subject
registrationSchema.index({ student: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
