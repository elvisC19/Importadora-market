import api from './api';

const productService = {
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getFeatured: async (skip = 0, limit = 10) => {
    const response = await api.get('/products/featured', { params: { skip, limit } });
    return response.data;
  },

  getOffers: async (skip = 0, limit = 20) => {
    const response = await api.get('/products/offers', { params: { skip, limit } });
    return response.data;
  },

  getNewArrivals: async (skip = 0, limit = 20) => {
    const response = await api.get('/products/new-arrivals', { params: { skip, limit } });
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  submitProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
};

export default productService;
