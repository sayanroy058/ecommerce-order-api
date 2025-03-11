const Order = require('../../models/Order');
const { UserInputError, ApolloError } = require('apollo-server-express');

const shippingResolvers = {
  Query: {
    orderTracking: async (_, { orderId }, { services }) => {
      const order = await Order.findById(orderId);
      
      if (!order) {
        throw new UserInputError('Order not found');
      }
      
      // If order is not shipped, return null
      if (!['shipped', 'delivered'].includes(order.status)) {
        return null;
      }
      
      // Assuming shippingService is passed in context
      if (!services.shippingService) {
        throw new ApolloError('Shipping service unavailable', 'SERVICE_UNAVAILABLE');
      }
      
      try {
        return await services.shippingService.getTrackingInfo(orderId);
      } catch (error) {
        console.error('Error fetching tracking info:', error);
        throw new ApolloError('Error fetching tracking information', 'SHIPPING_SERVICE_ERROR');
      }
    }
  }
};

module.exports = shippingResolvers;