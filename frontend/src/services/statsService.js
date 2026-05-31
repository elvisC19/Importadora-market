import api from './api';

const statsService = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/stats/dashboard');
    return response.data;
  },

  getOrdersChart: async (days = 7) => {
    const response = await api.get('/admin/stats/orders-chart', { params: { days } });
    return response.data;
  },

  exportOrdersCsv: async (startDate = '', endDate = '') => {
    const response = await api.get('/admin/orders/export', {
      params: { start_date: startDate, end_date: endDate },
      responseType: 'blob', // Necesario para descargar archivos en formato binario
    });
    return response.data;
  },
};

export default statsService;
