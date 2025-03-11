const Order = require('../../models/Order');
const Customer = require('../../models/Customer');
const Product = require('../../models/Product');
const { UserInputError, ApolloError } = require('apollo-server-express');

const orderResolvers = {
  Query: {
    order: async (_, { id }, { loaders }) => {
      return loaders.orderLoader.load(id);
    },
    
    orders: async (_, { filter = {}, pagination = {} }) => {
      const { status, startDate, endDate } = filter;
      const { page = 1, limit = 10 } = pagination;
      const skip = (page - 1) * limit;
      
      // Build filter object
      const queryFilter = {};
      
      if (status) queryFilter.status = status;
      
      if (startDate || endDate) {
        queryFilter.orderDate = {};
        if (startDate) queryFilter.orderDate.$gte = new Date(startDate);
        if (endDate) queryFilter.orderDate.$lte = new Date(endDate);
      }
      
      const orders = await Order.find(queryFilter)
        .sort({ orderDate: -1 })
        .skip(skip)
        .limit(limit + 1); // get one extra to check if there are more
      
      const hasMore = orders.length > limit;
      if (hasMore) orders.pop(); // remove the extra item
      
      const totalCount = await Order.countDocuments(queryFilter);
      
      return {
        orders,
        totalCount,
        hasMore
      };
    },
    
    customerOrders: async (_, { customerId, pagination = {} }) => {
      const { page = 1, limit = 10 } = pagination;
      const skip = (page - 1) * limit;
      
      // Check if customer exists
      const customerExists = await Customer.exists({ _id: customerId });
      if (!customerExists) {
        throw new UserInputError('Customer not found');
      }
      
      const orders = await Order.find({ customerId })
        .sort({ orderDate: -1 })
        .skip(skip)
        .limit(limit + 1); // get one extra to check if there are more
      
      const hasMore = orders.length > limit;
      if (hasMore) orders.pop(); // remove the extra item
      
      const totalCount = await Order.countDocuments({ customerId });
      
      return {
        orders,
        totalCount,
        hasMore
      };
    }
  },
  
  Mutation: {
    createOrder: async (_, { customerId, items, shippingAddress }) => {
      // Validate customer exists
      const customerExists = await Customer.exists({ _id: customerId });
      if (!customerExists) {
        throw new UserInputError('Customer not found');
      }
      
      // Calculate total and verify products exist and have inventory
      let totalAmount = 0;
      const orderItems = [];
      
      for (const item of items) {
        const product = await Product.findById(item.productId);
        
        if (!product) {
          throw new UserInputError(`Product with ID ${item.productId} not found`);
        }
        
        if (product.inventory < item.quantity) {
          throw new UserInputError(`Not enough inventory for product ${product.name}`);
        }
        
        // Add to order items with current price
        orderItems.push({
          productId: product._id,
          quantity: item.quantity,
          price: product.price
        });
        
        totalAmount += product.price * item.quantity;
        
        // Update inventory
        await Product.findByIdAndUpdate(
          product._id, 
          { $inc: { inventory: -item.quantity } }
        );
      }
      
      // Create order
      return Order.create({
        customerId,
        items: orderItems,
        shippingAddress,
        totalAmount,
        orderDate: new Date(),
        status: 'pending'
      });
    },
    
    updateOrderStatus: async (_, { id, status }) => {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      
      if (!validStatuses.includes(status)) {
        throw new UserInputError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }
      
      const order = await Order.findById(id);
      
      if (!order) {
        throw new UserInputError('Order not found');
      }
      
      // Handle inventory changes if cancelling
      if (status === 'cancelled' && order.status !== 'cancelled') {
        // Return items to inventory
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { inventory: item.quantity } }
          );
        }
      }
      
      order.status = status;
      await order.save();
      
      return order;
    },
    
    updateOrderShipping: async (_, { id, shippingAddress }) => {
      const order = await Order.findById(id);
      
      if (!order) {
        throw new UserInputError('Order not found');
      }
      
      if (order.status === 'delivered' || order.status === 'cancelled') {
        throw new UserInputError('Cannot update shipping address for delivered or cancelled orders');
      }
      
      order.shippingAddress = shippingAddress;
      await order.save();
      
      return order;
    },
    
    cancelOrder: async (_, { id }) => {
      const order = await Order.findById(id);
      
      if (!order) {
        throw new UserInputError('Order not found');
      }
      
      if (order.status === 'delivered') {
        throw new UserInputError('Cannot cancel a delivered order');
      }
      
      if (order.status !== 'cancelled') {
        // Return items to inventory
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { inventory: item.quantity } }
          );
        }
        
        order.status = 'cancelled';
        await order.save();
      }
      
      return order;
    }
  },
  
  Order: {
    id: (order) => order._id.toString(),
    
    customer: async (order, _, { loaders }) => {
      return loaders.customerLoader.load(order.customerId);
    },
    
    items: async (order, _, { loaders }) => {
      return Promise.all(order.items.map(async (item) => {
        const product = await loaders.productLoader.load(item.productId);
        
        return {
          id: item._id,
          product,
          quantity: item.quantity,
          price: item.price
        };
      }));
    },
    
    tracking: async (order, _, { services }) => {
      // If order is not shipped, return null
      if (!['shipped', 'delivered'].includes(order.status)) {
        return null;
      }
      
      // Assuming shippingService is passed in context
      if (!services.shippingService) {
        throw new ApolloError('Shipping service unavailable', 'SERVICE_UNAVAILABLE');
      }
      
      try {
        return await services.shippingService.getTrackingInfo(order._id);
      } catch (error) {
        console.error('Error fetching tracking info:', error);
        return null;
      }
    }
  }
};

module.exports = orderResolvers;