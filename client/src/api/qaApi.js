import axiosInstance from './axiosInstance';

const API_URL = '/qa';

export const getQAsBySubject = async (subjectId) => {
  const response = await axiosInstance.get(`${API_URL}/subjects/${subjectId}`);
  return response;
};

export const getQAsByLesson = async (lessonId) => {
  const response = await axiosInstance.get(`${API_URL}/lessons/${lessonId}`);
  return response;
};

export const createQA = async (subjectId, lessonId, data) => {
  const response = await axiosInstance.post(`${API_URL}/subjects/${subjectId}/lessons/${lessonId}`, data);
  return response;
};

export const resolveQA = async (id) => {
  const response = await axiosInstance.patch(`${API_URL}/${id}/resolve`);
  return response;
};

export const deleteQA = async (id) => {
  const response = await axiosInstance.delete(`${API_URL}/${id}`);
  return response;
};
