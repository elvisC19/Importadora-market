import api from './api';

const adminProductService = {
  getPendingProducts: async (skip = 0, limit = 20) => {
    const response = await api.get('/admin/products/pending', { params: { skip, limit } });
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post('/admin/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/admin/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  },

  approveProduct: async (id) => {
    const response = await api.patch(`/admin/products/${id}/approve`);
    return response.data;
  },

  toggleVisibility: async (id) => {
    // This calls the visibility endpoint which toggles the featured status in backend
    const response = await api.patch(`/admin/products/${id}/visibility`);
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await api.post('/admin/categories', categoryData);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
  },
};

export default adminProductService;
