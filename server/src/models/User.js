const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      default: 'Student',
    },
    avatar: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  // Keep a short-lived compatibility path for accounts created before hashing
  // was enabled. Successful legacy logins are upgraded by authService.
  if (!this.password || !this.password.startsWith('$2')) {
    return candidatePassword === this.password;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password || this.password.startsWith('$2')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Remove sensitive fields from JSON output if needed
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
