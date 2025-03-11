const mockShippingService = require('../mocks/shipping');
const cache = require('../utils/cache');

class ShippingService {
  /**
   * Get tracking information for a tracking number
   * @param {string} trackingNumber - The tracking number
   * @returns {Promise<Object>} - Tracking information
   */
  async getTrackingInfo(trackingNumber) {
    // Check cache first (cache for 15 minutes)
    const cacheKey = `tracking_${trackingNumber}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    try {
      // Get from mock service (would be a real API in production)
      const trackingInfo = await mockShippingService.getTrackingInfo(trackingNumber);
      
      // Cache for 15 minutes (900 seconds)
      cache.set(cacheKey, trackingInfo, 900);
      
      return trackingInfo;
    } catch (error) {
      console.error('Error fetching tracking information:', error);
      throw new Error('Unable to retrieve tracking information at this time');
    }
  }
  
  /**
   * Generate a tracking number for a new shipment
   * @returns {string} - Generated tracking number
   */
  generateTrackingNumber() {
    return mockShippingService.generateTrackingNumber();
  }
  
  /**
   * Calculate shipping costs
   * @param {Object} params - Shipping parameters
   * @returns {Promise<Object>} - Shipping cost information
   */
  async calculateShipping(params) {
    try {
      return mockShippingService.calculateShipping(params);
    } catch (error) {
      console.error('Error calculating shipping costs:', error);
      throw new Error('Unable to calculate shipping costs at this time');
    }
  }
}

module.exports = new ShippingService();