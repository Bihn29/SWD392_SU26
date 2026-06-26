import axiosInstance from './axiosInstance';

export const getLessonsBySubject = (subjectId) =>
  axiosInstance.get(`/admin/subjects/${subjectId}/lessons`);

export const createLesson = (subjectId, data) =>
  axiosInstance.post(`/admin/subjects/${subjectId}/lessons`, data);

export const updateLesson = (lessonId, data) =>
  axiosInstance.put(`/admin/lessons/${lessonId}`, data);

export const deleteLesson = (lessonId) =>
  axiosInstance.delete(`/admin/lessons/${lessonId}`);

export const activateLesson = (lessonId) =>
  axiosInstance.patch(`/admin/lessons/${lessonId}/activate`);
