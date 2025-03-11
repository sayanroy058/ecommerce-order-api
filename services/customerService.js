const Customer = require('../models/Customer');
const Order = require('../models/Order');
const cache = require('../utils/cache');

class CustomerService {
  /**
   * Get customer by ID
   * @param {string} customerId - The customer ID
   * @returns {Promise<Object>} - Customer details
   */
  async getCustomerById(customerId) {
    // Check cache first
    const cacheKey = `customer_${customerId}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Cache customer data for 1 hour
    cache.set(cacheKey, customer, 3600);
    
    return customer;
  }
  
  /**
   * Create a new customer
   * @param {Object} customerData - Customer data
   * @returns {Promise<Object>} - Created customer
   */
  async createCustomer(customerData) {
    const { email, name, address, phone } = customerData;
    
    // Check if customer with same email already exists
    const existingCustomer = await Customer.findOne({ email });
    
    if (existingCustomer) {
      const error = new Error('Customer with this email already exists');
      error.statusCode = 400;
      throw error;
    }
    
    const customer = await Customer.create({
      email,
      name,
      address,
      phone
    });
    
    return customer;
  }
  
  /**
   * Update a customer
   * @param {string} customerId - The customer ID
   * @param {Object} updateData - The data to update
   * @returns {Promise<Object>} - Updated customer
   */
  async updateCustomer(customerId, updateData) {
    const { name, address, phone } = updateData;
    
    // Find the customer first
    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Set fields to update
    const updateFields = {};
    
    if (name) updateFields.name = name;
    if (address) updateFields.address = address;
    if (phone) updateFields.phone = phone;
    
    // Update the customer
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    
    // Clear cache for this customer
    cache.del(`customer_${customerId}`);
    
    return updatedCustomer;
  }
  
  /**
   * Delete a customer
   * @param {string} customerId - The customer ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteCustomer(customerId) {
    // Check if customer exists
    const customer = await Customer.findById(customerId);
    
    if (!customer) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Check if customer has orders
    const hasOrders = await Order.exists({ customerId });
    
    if (hasOrders) {
      const error = new Error('Cannot delete customer with existing orders');
      error.statusCode = 400;
      throw error;
    }
    
    // Delete the customer
    await Customer.findByIdAndDelete(customerId);
    
    // Clear cache for this customer
    cache.del(`customer_${customerId}`);
    
    return true;
  }
  
  /**
   * Get customers with pagination
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} - Customers with pagination info
   */
  async getCustomers(page = 1, limit = 10) {
    const startIndex = (page - 1) * limit;
    
    const customers = await Customer.find()
      .sort({ name: 1 })
      .limit(limit)
      .skip(startIndex);
    
    const total = await Customer.countDocuments();
    
    return {
      count: customers.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: customers
    };
  }
  
  /**
   * Search customers by name or email
   * @param {string} query - Search query
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} - Search results with pagination
   */
  async searchCustomers(query, page = 1, limit = 10) {
    if (!query || query.length < 2) {
      const error = new Error('Search query must be at least 2 characters');
      error.statusCode = 400;
      throw error;
    }
    
    const startIndex = (page - 1) * limit;
    
    const searchRegex = new RegExp(query, 'i');
    
    const customers = await Customer.find({
      $or: [
        { name: searchRegex },
        { email: searchRegex }
      ]
    })
      .sort({ name: 1 })
      .limit(limit)
      .skip(startIndex);
    
    const total = await Customer.countDocuments({
      $or: [
        { name: searchRegex },
        { email: searchRegex }
      ]
    });
    
    return {
      count: customers.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: customers
    };
  }
}

module.exports = new CustomerService();