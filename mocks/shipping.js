/**
 * Mock Shipping Service API
 */
class MockShippingService {
    /**
     * Get tracking information for an order
     * @param {string} trackingNumber - The tracking number
     * @returns {Promise<Object>} - Tracking information
     */
    async getTrackingInfo(trackingNumber) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Generate a random status
      const statuses = [
        'SHIPPING_LABEL_CREATED',
        'PACKAGE_RECEIVED',
        'IN_TRANSIT',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'DELAYED'
      ];
      
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Generate a random delivery date (between today and 7 days from now)
      const today = new Date();
      const deliveryDate = new Date(today);
      deliveryDate.setDate(today.getDate() + Math.floor(Math.random() * 7) + 1);
      
      // Generate random locations
      const locations = [
        { city: 'New York', state: 'NY', timestamp: new Date(today - 1000 * 60 * 60 * 24 * 2) },
        { city: 'Columbus', state: 'OH', timestamp: new Date(today - 1000 * 60 * 60 * 24) },
        { city: 'Chicago', state: 'IL', timestamp: new Date() }
      ];
      
      return {
        trackingNumber,
        carrier: 'MockEx',
        status: randomStatus,
        estimatedDelivery: deliveryDate,
        locations,
        lastUpdated: new Date()
      };
    }
    
    /**
     * Generate a tracking number for a new shipment
     * @returns {string} - Generated tracking number
     */
    generateTrackingNumber() {
      // Generate a random alphanumeric tracking number
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let trackingNumber = '';
      
      for (let i = 0; i < 12; i++) {
        trackingNumber += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      return trackingNumber;
    }
    
    /**
     * Calculate shipping costs based on weight and destination
     * @param {Object} params - Shipping parameters
     * @returns {Object} - Shipping cost information
     */
    calculateShipping({ weight, originZip, destinationZip }) {
      // Simple algorithm: base cost + weight cost + distance factor
      const baseCost = 5.99;
      const weightCost = weight * 0.5;
      
      // Simulate distance calculation based on zip code
      const zipDifference = Math.abs(parseInt(originZip) - parseInt(destinationZip));
      const distanceFactor = Math.min(zipDifference / 10000, 5); // Cap at $5
      
      const totalCost = parseFloat((baseCost + weightCost + distanceFactor).toFixed(2));
      
      return {
        carrier: 'MockEx',
        services: [
          { type: 'STANDARD', cost: totalCost, estimatedDays: '3-5' },
          { type: 'EXPRESS', cost: totalCost * 1.5, estimatedDays: '2-3' },
          { type: 'PRIORITY', cost: totalCost * 2, estimatedDays: '1-2' }
        ]
      };
    }
  }
  
  module.exports = new MockShippingService();