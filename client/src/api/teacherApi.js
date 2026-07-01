import axiosInstance from './axiosInstance';

const API_URL = '/teacher'; // baseURL in axiosInstance is already '/api'

// Dashboard
export const getTeacherDashboard = async () => {
  const response = await axiosInstance.get(`${API_URL}/dashboard`);
  return response;
};

// Courses (Subjects)
export const getTeacherCourses = async (params) => {
  const response = await axiosInstance.get(`${API_URL}/courses`, { params });
  return response;
};

export const getTeacherCourseById = async (id) => {
  const response = await axiosInstance.get(`${API_URL}/courses/${id}`);
  return response;
};

export const createTeacherCourse = async (data) => {
  const response = await axiosInstance.post(`${API_URL}/courses`, data);
  return response;
};

export const updateTeacherCourse = async (id, data) => {
  const response = await axiosInstance.put(`${API_URL}/courses/${id}`, data);
  return response;
};

export const deleteTeacherCourse = async (id) => {
  const response = await axiosInstance.delete(`${API_URL}/courses/${id}`);
  return response;
};

// Lessons
export const getTeacherLessons = async (subjectId) => {
  const response = await axiosInstance.get(`${API_URL}/courses/${subjectId}/lessons`);
  return response;
};

export const createTeacherLesson = async (subjectId, data) => {
  const response = await axiosInstance.post(`${API_URL}/courses/${subjectId}/lessons`, data);
  return response;
};

export const updateTeacherLesson = async (subjectId, lessonId, data) => {
  const response = await axiosInstance.put(`${API_URL}/courses/${subjectId}/lessons/${lessonId}`, data);
  return response;
};

export const deleteTeacherLesson = async (subjectId, lessonId) => {
  const response = await axiosInstance.delete(`${API_URL}/courses/${subjectId}/lessons/${lessonId}`);
  return response;
};

export const activateTeacherLesson = async (subjectId, lessonId, data) => {
  const response = await axiosInstance.patch(`${API_URL}/courses/${subjectId}/lessons/${lessonId}/activate`, data);
  return response;
};

// Students
export const getTeacherCourseStudents = async (subjectId) => {
  const response = await axiosInstance.get(`${API_URL}/courses/${subjectId}/students`);
  return response;
};
