import axiosInstance from './axiosInstance';

export const getDashboardOverview = () =>
  axiosInstance.get('/admin/dashboard/overview');

export const getDashboardDetails = (type) =>
  axiosInstance.get(`/admin/dashboard/details?type=${type}`);
