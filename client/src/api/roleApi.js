import axiosInstance from './axiosInstance';

export const roleApi = {
  getRoles: async (params) => {
    const response = await axiosInstance.get('/admin/roles', { params });
    return response.data;
  },

  getRoleById: async (id) => {
    const response = await axiosInstance.get(`/admin/roles/${id}`);
    return response.data;
  },

  createRole: async (data) => {
    const response = await axiosInstance.post('/admin/roles', data);
    return response.data;
  },

  updateRole: async (id, data) => {
    const response = await axiosInstance.put(`/admin/roles/${id}`, data);
    return response.data;
  },

  deactivateRole: async (id) => {
    const response = await axiosInstance.delete(`/admin/roles/${id}`);
    return response.data;
  },

  activateRole: async (id) => {
    const response = await axiosInstance.patch(`/admin/roles/${id}/activate`);
    return response.data;
  },
};
