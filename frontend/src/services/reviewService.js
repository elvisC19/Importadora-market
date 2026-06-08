import api from './api';

const reviewService = {
  /**
   * Creates a product review (requires authentication).
   * @param {number} productId - The product ID to review.
   * @param {{ rating: number, comment?: string }} reviewData - Rating (1-5) and optional comment.
   * @returns {Promise<Object>} The newly created review.
   */
  createReview: async (productId, reviewData) => {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  },

  /**
   * Lists all reviews for a product (public endpoint).
   * @param {number} productId - The product ID.
   * @returns {Promise<Array<Object>>} List of reviews.
   */
  getProductReviews: async (productId) => {
    const response = await api.get(`/products/${productId}/reviews`);
    return response.data;
  },
};

export default reviewService;
