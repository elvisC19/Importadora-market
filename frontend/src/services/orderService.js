import api from './api';

const orderService = {
  /**
   * Places a new order from the customer's cart.
   * @param {Object} orderData - The order details.
   * @param {string} orderData.tipo_venta - Sale type ('retail' or 'wholesale').
   * @param {string} orderData.shipping_address - Destination shipping address.
   * @param {string} orderData.phone - Contact telephone number (matching Bolivian formats: ^[67]\d{7}$).
   * @param {Array<{product_id: number, cantidad: number}>} orderData.items - The list of ordered items.
   * @returns {Promise<Object>} The response data representing the newly created order.
   */
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  /**
   * Retrieves the authenticating customer's order history.
   * @returns {Promise<Array<Object>>} List of customer orders.
   */
  getCustomerOrders: async () => {
    const response = await api.get('/orders/me');
    return response.data;
  },

  /**
   * Retrieves the global list of orders (admin dashboard view).
   * @param {number} [skip=0] - Offset query parameter for pagination.
   * @param {number} [limit=100] - Limit query parameter for pagination.
   * @returns {Promise<Array<Object>>} List of orders.
   */
  getAdminOrders: async (skip = 0, limit = 100) => {
    const response = await api.get('/orders', { params: { skip, limit } });
    return response.data;
  },

  /**
   * Updates an order's fulfillment or delivery status (admin access only).
   * @param {number|string} orderId - ID of the order to update.
   * @param {'pendiente'|'confirmado'|'entregado'|'cancelado'} status - Target order status.
   * @returns {Promise<Object>} The updated order object.
   */
  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  },
};

export default orderService;
