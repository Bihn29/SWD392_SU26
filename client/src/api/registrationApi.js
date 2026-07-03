import axiosInstance from './axiosInstance';

export const getStudentsBySubject = (subjectId) =>
  axiosInstance.get(`/admin/subjects/${subjectId}/students`);

export const getStudentDetailedProgress = (subjectId, studentId) =>
  axiosInstance.get(`/admin/subjects/${subjectId}/students/${studentId}/progress`);
