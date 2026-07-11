const mongoose = require('mongoose');

const SUBJECT_STATUSES = ['Draft', 'Published', 'Unpublished', 'Inactive'];

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'], // BR-SUB-001
      trim: true,
      maxlength: [150, 'Subject name must not exceed 150 characters'], // BR-SUB-002
    },
    category: {
      type: String,
      required: [true, 'Category is required'], // BR-SUB-003
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner (Teacher) is required'], // BR-SUB-004
    },
    thumbnail: {
      type: String,
      default: '',
    },
    introVideo: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      maxlength: [5000, 'Description must not exceed 5000 characters'],
      default: '',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: {
        values: SUBJECT_STATUSES,
        message: 'Status must be one of: Draft, Published, Unpublished, Inactive',
      },
      default: 'Draft',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Indexes for efficient querying
subjectSchema.index({ name: 'text' });
subjectSchema.index({ status: 1 });
subjectSchema.index({ category: 1 });
subjectSchema.index({ owner: 1 });
subjectSchema.index({ featured: 1 });
subjectSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Subject', subjectSchema);
module.exports.SUBJECT_STATUSES = SUBJECT_STATUSES;
