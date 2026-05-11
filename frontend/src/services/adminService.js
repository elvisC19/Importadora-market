import api from './api';

const adminService = {
  getUsers: async (skip = 0, limit = 20, filters = {}) => {
    const response = await api.get('/admin/users', {
      params: { skip, limit, ...filters },
    });
    return response.data;
  },


  toggleUserRole: async (userId) => {
    const response = await api.patch(`/admin/users/${userId}/role`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
};


export default adminService;
