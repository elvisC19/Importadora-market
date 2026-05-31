import api from './api';

const orderService = {
  /**
   * Places a new order from the customer's cart.
   * @param {Object} orderData - The order details.
   * @param {string} orderData.shipping_address - Destination shipping address.
   * @param {string} orderData.phone - Contact telephone number.
   * @param {string} [orderData.notes] - Optional notes for the order.
   * @param {Array<{product_id: number, quantity: number}>} orderData.items - The list of ordered items.
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
   * @param {string} [status] - Optional status filter.
   * @returns {Promise<Array<Object>>} List of orders.
   */
  getAdminOrders: async (skip = 0, limit = 100, status = null, dateFrom = null, dateTo = null) => {
    const params = { skip, limit };
    if (status) params.status = status;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    const response = await api.get('/orders', { params });
    return response.data;
  },

  /**
   * Retrieves a single order by ID.
   * @param {number|string} orderId - ID of the order.
   * @returns {Promise<Object>} The order object.
   */
  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * Updates an order's fulfillment or delivery status (admin access only).
   * @param {number|string} orderId - ID of the order to update.
   * @param {'pending'|'confirmed'|'processing'|'shipped'|'delivered'|'cancelled'} status - Target order status.
   * @returns {Promise<Object>} The updated order object.
   */
  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  },
};

export default orderService;
