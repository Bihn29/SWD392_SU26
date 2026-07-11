import axiosInstance from './axiosInstance';

/**
 * Get paginated, filtered list of subjects.
 * @param {Object} params - page, limit, search, category, status, owner, featured, sortBy, order
 */
export const getSubjects = (params = {}) =>
  axiosInstance.get('/subjects', { params });

/**
 * Get a single subject by ID.
 * @param {string} id
 */
export const getSubjectById = (id) =>
  axiosInstance.get(`/subjects/${id}`);

/**
 * Create a new subject (Admin only).
 * @param {Object} data
 */
export const createSubject = (data) =>
  axiosInstance.post('/subjects', data);

/**
 * Update a subject (Admin or Teacher).
 * @param {string} id
 * @param {Object} data
 */
export const updateSubject = (id, data) =>
  axiosInstance.put(`/subjects/${id}`, data);

/**
 * Soft delete a subject (Admin only).
 * @param {string} id
 */
export const deleteSubject = (id) =>
  axiosInstance.delete(`/subjects/${id}`);

/**
 * Publish a subject (Admin only).
 * @param {string} id
 */
export const publishSubject = (id) =>
  axiosInstance.patch(`/subjects/${id}/publish`);

/**
 * Unpublish a subject (Admin only).
 * @param {string} id
 */
export const unpublishSubject = (id) =>
  axiosInstance.patch(`/subjects/${id}/unpublish`);

/**
 * Get public published subjects (no auth).
 * @param {Object} params
 */
export const getPublicSubjects = (params = {}) =>
  axiosInstance.get('/subjects/public', { params });

/**
 * Get a single public published subject by ID.
 * @param {string} id
 */
export const getPublicSubjectById = (id) =>
  axiosInstance.get(`/subjects/public/${id}`);
