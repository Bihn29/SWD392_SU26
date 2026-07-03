const mongoose = require('mongoose');

const ROLE_STATUSES = ['Active', 'Inactive'];

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
      maxlength: [100, 'Role name must not exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Role code is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description must not exceed 500 characters'],
      default: '',
    },
    permissions: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: ROLE_STATUSES,
        message: 'Status must be Active or Inactive',
      },
      default: 'Active',
    },
    isSystemRole: {
      type: Boolean,
      default: false,
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

// Indexes
roleSchema.index({ status: 1 });

module.exports = mongoose.model('Role', roleSchema);
module.exports.ROLE_STATUSES = ROLE_STATUSES;
