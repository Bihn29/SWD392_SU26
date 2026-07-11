const Subject = require('../models/Subject');
const User = require('../models/User');

const ensureTeacherOwner = async (ownerId) => {
  if (!ownerId) return;
  const owner = await User.findOne({ _id: ownerId, role: 'Teacher', isActive: true }).select('_id');
  if (!owner) {
    const error = new Error('Owner phải là tài khoản Teacher đang hoạt động.');
    error.statusCode = 400;
    throw error;
  }
};

/**
 * Get paginated, filtered, and searchable subjects list.
 */
const getSubjects = async ({
  page = 1,
  limit = 10,
  search,
  category,
  status,
  owner,
  featured,
  startDate,
  endDate,
  sortBy = 'createdAt',
  order = 'desc',
  excludeInactive = false,
}) => {
  const filter = {};

  // BR-SUB-012: Exclude inactive unless admin explicitly filters
  if (excludeInactive) {
    filter.status = { $ne: 'Inactive' };
  }

  if (status) {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) {
    filter.category = { $regex: category, $options: 'i' };
  }

  if (owner) {
    filter.owner = owner;
  }

  if (featured !== undefined) {
    filter.featured = featured === 'true' || featured === true;
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  const sortOrder = order === 'asc' ? 1 : -1;
  const allowedSortFields = ['createdAt', 'updatedAt', 'name', 'status'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

  const skip = (Number(page) - 1) * Number(limit);
  const limitNum = Number(limit);

  const [items, totalItems] = await Promise.all([
    Subject.find(filter)
      .populate('owner', 'name email role')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Subject.countDocuments(filter),
  ]);

  const Registration = require('../models/Registration');

  const itemsWithCounts = await Promise.all(items.map(async (item) => {
    const studentCount = await Registration.countDocuments({ subject: item._id, status: 'Approved' });
    return { ...item, studentCount };
  }));

  return {
    items: itemsWithCounts,
    pagination: {
      page: Number(page),
      limit: limitNum,
      totalItems,
      totalPages: Math.ceil(totalItems / limitNum),
    },
  };
};

/**
 * Get a single subject by ID.
 */
const getSubjectById = async (id) => {
  const subject = await Subject.findById(id)
    .populate('owner', 'name email role')
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .lean();
  return subject;
};

/**
 * Create a new subject (Admin only – BR-SUB-005).
 */
const createSubject = async (data, userId) => {
  await ensureTeacherOwner(data.owner);
  const subject = await Subject.create({
    ...data,
    createdBy: userId,
    updatedBy: userId,
  });

  return Subject.findById(subject._id)
    .populate('owner', 'name email role')
    .populate('createdBy', 'name email')
    .lean();
};

/**
 * Update a subject.
 * - Admin can update all fields (BR-SUB-006).
 * - Teacher can only update assigned subjects (BR-SUB-007).
 * - Teacher cannot change owner or publish/unpublish (BR-SUB-008).
 */
const updateSubject = async (id, data, user) => {
  const subject = await Subject.findById(id);
  if (!subject) return null;

  if (data.owner) await ensureTeacherOwner(data.owner);

  if (!['Admin', 'Manager'].includes(user.role)) {
    // Teacher-like roles can only update assigned subjects
    if (subject.owner.toString() !== user._id.toString()) {
      const err = new Error('You can only update subjects assigned to you.');
      err.statusCode = 403;
      throw err;
    }

    // BR-SUB-008: Teacher-like roles cannot publish/unpublish
    if (data.status === 'Published' || data.status === 'Unpublished') {
      const err = new Error('Teachers cannot publish or unpublish subjects.');
      err.statusCode = 403;
      throw err;
    }

    // Teacher-like roles cannot change owner
    delete data.owner;
  }

  Object.assign(subject, data);
  subject.updatedBy = user._id;
  await subject.save();

  return Subject.findById(subject._id)
    .populate('owner', 'name email role')
    .populate('updatedBy', 'name email')
    .lean();
};

/**
 * Soft delete: set status to Inactive (BR-SUB-009, BR-SUB-010).
 */
const softDeleteSubject = async (id, userId) => {
  const subject = await Subject.findById(id);
  if (!subject) return null;

  subject.status = 'Inactive';
  subject.updatedBy = userId;
  await subject.save();
  return subject;
};

/**
 * Publish a subject (Admin only – BR-SUB-008).
 */
const publishSubject = async (id, userId) => {
  const subject = await Subject.findById(id);
  if (!subject) return null;

  subject.status = 'Published';
  subject.updatedBy = userId;
  await subject.save();

  return Subject.findById(subject._id)
    .populate('owner', 'name email role')
    .lean();
};

/**
 * Unpublish a subject (Admin only – BR-SUB-008).
 */
const unpublishSubject = async (id, userId) => {
  const subject = await Subject.findById(id);
  if (!subject) return null;

  subject.status = 'Unpublished';
  subject.updatedBy = userId;
  await subject.save();

  return Subject.findById(subject._id)
    .populate('owner', 'name email role')
    .lean();
};

/**
 * Get published subjects for public access (BR-SUB-011).
 */
const getPublicSubjects = async ({ page = 1, limit = 10, search, category }) => {
  return getSubjects({ page, limit, search, category, status: 'Published' });
};

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  softDeleteSubject,
  publishSubject,
  unpublishSubject,
  getPublicSubjects,
};
