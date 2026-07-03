const subjectService = require('../services/subjectService');

/**
 * @desc  Get all subjects (with pagination, filter, search)
 * @route GET /api/subjects
 * @access Private
 */
const getAllSubjects = async (req, res, next) => {
  try {
    const { page, limit, search, category, status, owner, featured, startDate, endDate, sortBy, order } = req.query;

    // BR-SUB-012: Non-admins don't see Inactive subjects by default
    const excludeInactive = req.user.role !== 'Admin';

    const result = await subjectService.getSubjects({
      page,
      limit,
      search,
      category,
      status,
      owner,
      featured,
      startDate,
      endDate,
      sortBy,
      order,
      excludeInactive,
    });

    return res.status(200).json({
      success: true,
      message: 'Subjects retrieved successfully.',
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Get subject by ID
 * @route GET /api/subjects/:id
 * @access Private
 */
const getSubjectById = async (req, res, next) => {
  try {
    const subject = await subjectService.getSubjectById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    // Non-admin cannot view Inactive subjects (BR-SUB-012)
    if (subject.status === 'Inactive' && req.user.role !== 'Admin') {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Subject retrieved successfully.',
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Create subject
 * @route POST /api/subjects
 * @access Admin only (BR-SUB-005)
 */
const createSubject = async (req, res, next) => {
  try {
    const subject = await subjectService.createSubject(req.body, req.user._id);
    return res.status(201).json({
      success: true,
      message: 'Subject created successfully.',
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Update subject
 * @route PUT /api/subjects/:id
 * @access Admin, Expert
 */
const updateSubject = async (req, res, next) => {
  try {
    const subject = await subjectService.updateSubject(req.params.id, req.body, req.user);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }
    return res.status(200).json({
      success: true,
      message: 'Subject updated successfully.',
      data: subject,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * @desc  Soft delete subject (set Inactive)
 * @route DELETE /api/subjects/:id
 * @access Admin only (BR-SUB-005, BR-SUB-009, BR-SUB-010)
 */
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await subjectService.softDeleteSubject(req.params.id, req.user._id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }
    return res.status(200).json({
      success: true,
      message: 'Subject deactivated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Publish subject
 * @route PATCH /api/subjects/:id/publish
 * @access Admin only (BR-SUB-008)
 */
const publishSubject = async (req, res, next) => {
  try {
    const subject = await subjectService.publishSubject(req.params.id, req.user._id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }
    return res.status(200).json({
      success: true,
      message: 'Subject published successfully.',
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Unpublish subject
 * @route PATCH /api/subjects/:id/unpublish
 * @access Admin only (BR-SUB-008)
 */
const unpublishSubject = async (req, res, next) => {
  try {
    const subject = await subjectService.unpublishSubject(req.params.id, req.user._id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }
    return res.status(200).json({
      success: true,
      message: 'Subject unpublished successfully.',
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Get public published subjects
 * @route GET /api/public/subjects
 * @access Public (BR-SUB-011)
 */
const getPublicSubjects = async (req, res, next) => {
  try {
    const { page, limit, search, category } = req.query;
    const result = await subjectService.getPublicSubjects({ page, limit, search, category });
    return res.status(200).json({
      success: true,
      message: 'Subjects retrieved successfully.',
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc  Get single public published subject
 * @route GET /api/public/subjects/:id
 * @access Public (BR-SUB-011)
 */
const getPublicSubjectById = async (req, res, next) => {
  try {
    const subject = await subjectService.getSubjectById(req.params.id);
    if (!subject || subject.status !== 'Published') {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }
    return res.status(200).json({
      success: true,
      message: 'Subject retrieved successfully.',
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  publishSubject,
  unpublishSubject,
  getPublicSubjects,
  getPublicSubjectById,
};
