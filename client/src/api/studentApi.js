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
