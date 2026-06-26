import axiosInstance from './axiosInstance';

export const getStudentsBySubject = (subjectId) =>
  axiosInstance.get(`/admin/subjects/${subjectId}/students`);
