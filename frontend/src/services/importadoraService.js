import api from './api'

const importadoraService = {
  getMyOrders: async (status = null) => {
    const params = {}
    if (status) params.status = status
    const response = await api.get('/importadora/orders', { params })
    return response.data
  },

  getMyStats: async () => {
    const response = await api.get('/importadora/orders/stats')
    return response.data
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/importadora/orders/${orderId}/status`, { status })
    return response.data
  }
}

export default importadoraService
