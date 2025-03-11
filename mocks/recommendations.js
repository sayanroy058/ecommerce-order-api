/**
 * Mock Product Recommendation Service API
 */
class MockRecommendationService {
    /**
     * Get product recommendations based on customer purchase history
     * @param {string} customerId - Customer ID to get recommendations for
     * @param {Array} previousProducts - Array of product IDs the customer has purchased
     * @returns {Promise<Array>} - Array of recommended product IDs with scores
     */
    async getRecommendations(customerId, previousProducts = []) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock product catalog (in a real system, these would be in the database)
      const mockCatalog = [
        { id: '5f8e39e2e74cd95031a9da1a', name: 'Smartphone X', category: 'electronics' },
        { id: '5f8e39e2e74cd95031a9da1b', name: 'Laptop Pro', category: 'electronics' },
        { id: '5f8e39e2e74cd95031a9da1c', name: 'Wireless Headphones', category: 'electronics' },
        { id: '5f8e39e2e74cd95031a9da1d', name: 'Smart Watch', category: 'electronics' },
        { id: '5f8e39e2e74cd95031a9da1e', name: 'Coffee Maker', category: 'home' },
        { id: '5f8e39e2e74cd95031a9da1f', name: 'Blender', category: 'home' },
        { id: '5f8e39e2e74cd95031a9da20', name: 'Running Shoes', category: 'sports' },
        { id: '5f8e39e2e74cd95031a9da21', name: 'Yoga Mat', category: 'sports' },
        { id: '5f8e39e2e74cd95031a9da22', name: 'T-shirt', category: 'clothing' },
        { id: '5f8e39e2e74cd95031a9da23', name: 'Jeans', category: 'clothing' }
      ];
      
      // Filter out products the customer already purchased
      const availableProducts = mockCatalog.filter(
        product => !previousProducts.includes(product.id)
      );
      
      // Simple recommendation algorithm:
      // 1. Get random 3-5 products from available products
      // 2. Assign random confidence scores
      const numRecommendations = Math.floor(Math.random() * 3) + 3; // 3-5 recommendations
      const recommendations = [];
      
      // Shuffle available products
      const shuffled = [...availableProducts].sort(() => 0.5 - Math.random());
      
      // Take a slice of the shuffled array and assign scores
      const selected = shuffled.slice(0, numRecommendations);
      
      selected.forEach(product => {
        recommendations.push({
          productId: product.id,
          name: product.name,
          category: product.category,
          confidenceScore: parseFloat((Math.random() * 0.5 + 0.5).toFixed(2)),  // Score between 0.5 and 1.0
          reason: this._getRandomReason(product.category)
        });
      });
      
      // Sort by confidence score descending
      return recommendations.sort((a, b) => b.confidenceScore - a.confidenceScore);
    }
    
    /**
     * Generate a random recommendation reason
     * @private
     * @param {string} category - Product category
     * @returns {string} - Recommendation reason
     */
    _getRandomReason(category) {
      const reasons = [
        'Customers who purchased similar items also bought this',
        'Based on your browsing history',
        'Popular in your area',
        `Top seller in ${category}`,
        'Frequently bought together with your previous purchases',
        'New arrivals you might like'
      ];
      
      return reasons[Math.floor(Math.random() * reasons.length)];
    }
  }
  
  module.exports = new MockRecommendationService();