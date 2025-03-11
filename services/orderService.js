const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const shippingService = require('./shippingService');
const cache = require('../utils/cache');

class OrderService {
  /**
   * Get all orders for a customer with pagination
   * @param {string} customerId - The customer ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} - Orders with pagination info
   */
  async getCustomerOrders(customerId, page = 1, limit = 10) {
    // Validate customer exists
    const customerExists = await Customer.exists({ _id: customerId });
    if (!customerExists) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      throw error;
    }
    
    const startIndex = (page - 1) * limit;
    
    const orders = await Order.find({ customerId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);
    
    const total = await Order.countDocuments({ customerId });
    
    return {
      count: orders.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: orders
    };
  }
  
  /**
   * Get detailed order information by ID
   * @param {string} orderId - The order ID
   * @returns {Promise<Object>} - Order details
   */
  async getOrderDetails(orderId) {
    const order = await Order.findById(orderId)
      .populate('customerId', 'name email')
      .populate('items.productId', 'name price imageUrl');
    
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }
    
    return order;
  }
  
  /**
   * Create a new order
   * @param {Object} orderData - Order data including customerId, items, and shipping address
   * @returns {Promise<Object>} - Created order
   */
  async createOrder(orderData) {
    const { customerId, items, shippingAddress } = orderData;
    
    // Validate customer exists
    const customerExists = await Customer.exists({ _id: customerId });
    if (!customerExists) {
      const error = new Error('Customer not found');
      error.statusCode = 400;
      throw error;
    }
    
    // Calculate total and verify products exist and have inventory
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        const error = new Error(`Product with ID ${item.productId} not found`);
        error.statusCode = 400;
        throw error;
      }
      
      if (product.inventory < item.quantity) {
        const error = new Error(`Not enough inventory for product ${product.name}`);
        error.statusCode = 400;
        throw error;
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
    
    // Generate tracking number
    const trackingNumber = shippingService.generateTrackingNumber();
    
    // Create order
    const order = await Order.create({
      customerId,
      items: orderItems,
      shippingAddress,
      totalAmount,
      orderDate: new Date(),
      trackingNumber
    });
    
    return order;
  }
  
  /**
   * Update an existing order
   * @param {string} orderId - The order ID
   * @param {Object} updateData - The data to update
   * @returns {Promise<Object>} - Updated order
   */
  async updateOrder(orderId, updateData) {
    const { status, shippingAddress } = updateData;
    
    // Find the order first
    const order = await Order.findById(orderId);
    
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Disallow updating cancelled orders
    if (order.status === 'cancelled') {
      const error = new Error('Cannot update a cancelled order');
      error.statusCode = 400;
      throw error;
    }
    
    // Set fields to update
    const updateFields = {};
    
    if (status) updateFields.status = status;
    if (shippingAddress) updateFields.shippingAddress = shippingAddress;
    
    // Update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    
    // Clear cache for this order
    cache.del(`order_${orderId}`);
    cache.del(`order_tracking_${orderId}`);
    
    return updatedOrder;
  }
  
  /**
   * Cancel an order
   * @param {string} orderId - The order ID
   * @returns {Promise<Object>} - Cancelled order
   */
  async cancelOrder(orderId) {
    const order = await Order.findById(orderId);
    
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Prevent cancelling already delivered orders
    if (order.status === 'delivered') {
      const error = new Error('Cannot cancel a delivered order');
      error.statusCode = 400;
      throw error;
    }
    
    // Return inventory for cancelled order
    if (order.status !== 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { inventory: item.quantity } }
        );
      }
    }
    
    // Update to cancelled status
    order.status = 'cancelled';
    await order.save();
    
    // Clear cache for this order
    cache.del(`order_${orderId}`);
    cache.del(`order_tracking_${orderId}`);
    
    return order;
  }
  
  /**
   * Get tracking information for an order
   * @param {string} orderId - The order ID
   * @returns {Promise<Object>} - Tracking information
   */
  async getOrderTracking(orderId) {
    // Check cache first
    const cacheKey = `order_tracking_${orderId}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    // Get order
    const order = await Order.findById(orderId);
    
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }
    
    if (!order.trackingNumber) {
      const error = new Error('No tracking information available for this order');
      error.statusCode = 404;
      throw error;
    }
    
    try {
      // Get tracking info from shipping service
      const trackingInfo = await shippingService.getTrackingInfo(order.trackingNumber);
      
      // Add order details to tracking info
      const result = {
        order: {
          id: order._id,
          status: order.status,
          createdAt: order.createdAt
        },
        tracking: trackingInfo
      };
      
      // Cache the result for 1 hour
      cache.set(cacheKey, result, 3600);
      
      return result;
    } catch (error) {
      const err = new Error('Error retrieving tracking information');
      err.statusCode = 500;
      err.originalError = error;
      throw err;
    }
  }
}

module.exports = new OrderService();