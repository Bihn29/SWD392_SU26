import axiosInstance from './axiosInstance';

const API_URL = '/student'; // baseURL is /api

// Home/Dashboard
export const getStudentDashboard = async () => {
  const response = await axiosInstance.get(`${API_URL}/home`);
  return response;
};

// Enrollment
export const enrollCourse = async (courseId) => {
  const response = await axiosInstance.post(`${API_URL}/enroll/${courseId}`);
  return response;
};

export const checkEnrollment = async (courseId) => {
  const response = await axiosInstance.get(`${API_URL}/enrollment-status/${courseId}`);
  return response;
};

// Lessons & Quiz
export const getCourseLessons = async (courseId) => {
  const response = await axiosInstance.get(`${API_URL}/courses/${courseId}/lessons`);
  return response;
};

export const getQuizQuestions = async (courseId, lessonId) => {
  const response = await axiosInstance.get(`${API_URL}/courses/${courseId}/lessons/${lessonId}/questions`);
  return response;
};

export const getStudentQuizzes = async () => {
  const response = await axiosInstance.get(`${API_URL}/quizzes`);
  return response;
};
