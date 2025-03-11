const mockRecommendationService = require('../mocks/recommendations');
const Order = require('../models/Order');
const cache = require('../utils/cache');

class RecommendationService {
  /**
   * Get product recommendations for a customer
   * @param {string} customerId - The customer ID
   * @returns {Promise<Array>} - Array of recommended products
   */
  async getCustomerRecommendations(customerId) {
    // Check cache first (cache for 1 hour)
    const cacheKey = `recommendations_${customerId}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    try {
      // Get customer's previous purchases
      const customerOrders = await Order.find({ 
        customerId,
        status: { $ne: 'cancelled' } 
      });
      
      // Extract product IDs from orders
      const previousProducts = new Set();
      customerOrders.forEach(order => {
        order.items.forEach(item => {
          previousProducts.add(item.productId.toString());
        });
      });
      
      // Get recommendations from service
      const recommendations = await mockRecommendationService.getRecommendations(
        customerId,
        Array.from(previousProducts)
      );
      
      // Cache for 1 hour (3600 seconds)
      cache.set(cacheKey, recommendations, 3600);
      
      return recommendations;
    } catch (error) {
      console.error('Error fetching product recommendations:', error);
      throw new Error('Unable to retrieve product recommendations at this time');
    }
  }
}

module.exports = new RecommendationService();