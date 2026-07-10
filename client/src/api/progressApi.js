import axiosInstance from './axiosInstance';

const API_URL = '/progress';

export const getStudentProgress = (subjectId) => 
  axiosInstance.get(`${API_URL}/subjects/${subjectId}`);

export const markLessonComplete = (subjectId, lessonId) => 
  axiosInstance.post(`${API_URL}/subjects/${subjectId}/lessons/${lessonId}/complete`);

export const submitQuiz = (subjectId, lessonId, answers) => 
  axiosInstance.post(`${API_URL}/subjects/${subjectId}/lessons/${lessonId}/quiz`, { answers });
