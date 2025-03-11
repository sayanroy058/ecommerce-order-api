const Customer = require('../../models/Customer');
const { UserInputError, ApolloError } = require('apollo-server-express');

const recommendationResolvers = {
  Query: {
    customerRecommendations: async (_, { customerId, limit = 5 }, { services, loaders }) => {
      const customer = await loaders.customerLoader.load(customerId);
      
      if (!customer) {
        throw new UserInputError('Customer not found');
      }
      
      // Assuming recommendationService is passed in context
      if (!services.recommendationService) {
        throw new ApolloError('Recommendation service unavailable', 'SERVICE_UNAVAILABLE');
      }
      
      try {
        const recommendations = await services.recommendationService.getRecommendations(customerId, limit);
        
        return recommendations.map(async (rec) => {
          const product = await loaders.productLoader.load(rec.productId);
          
          return {
            product,
            score: rec.score,
            reason: rec.reason
          };
        });
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        throw new ApolloError('Error fetching recommendations', 'RECOMMENDATION_SERVICE_ERROR');
      }
    }
  }
};

module.exports = recommendationResolvers;