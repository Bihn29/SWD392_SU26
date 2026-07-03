import axiosInstance from './axiosInstance';

const API_URL = '/admin/users';

export const getUsers = async (params) => {
  const response = await axiosInstance.get(API_URL, { params });
  return response;
};
