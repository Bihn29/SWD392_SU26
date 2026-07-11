const Subject = require('../models/Subject');

/**
 * Middleware: Verify if the current user is the owner of the subject.
 * Admin bypasses this check.
 */
const checkCourseOwner = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    // Admin always has access to all courses
    if (req.user.role === 'Admin') {
      return next();
    }

    // Teachers need to own the course
    if (req.user.role === 'Teacher') {
      const subjectId = req.params.subjectId || req.params.id; // Support both params based on route
      if (!subjectId) {
        return res.status(400).json({ success: false, message: 'Subject ID is required' });
      }

      const subject = await Subject.findById(subjectId);
      if (!subject) {
        return res.status(404).json({ success: false, message: 'Subject not found' });
      }

      if (subject.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to access or modify this subject' });
      }

      return next();
    }

    return res.status(403).json({ success: false, message: 'Forbidden' });
  } catch (error) {
    next(error);
  }
};

module.exports = { checkCourseOwner };
