const Product = require('../models/Product');
const cache = require('../utils/cache');

class ProductService {
  /**
   * Get product by ID
   * @param {string} productId - The product ID
   * @returns {Promise<Object>} - Product details
   */
  async getProductById(productId) {
    // Check cache first
    const cacheKey = `product_${productId}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const product = await Product.findById(productId);
    
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Cache product data for 1 hour
    cache.set(cacheKey, product, 3600);
    
    return product;
  }
  
  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} - Created product
   */
  async createProduct(productData) {
    const { name, description, price, category, imageUrl, inventory } = productData;
    
    const product = await Product.create({
      name,
      description,
      price,
      category,
      imageUrl,
      inventory: inventory || 0
    });
    
    return product;
  }
  
  /**
   * Update a product
   * @param {string} productId - The product ID
   * @param {Object} updateData - The data to update
   * @returns {Promise<Object>} - Updated product
   */
  async updateProduct(productId, updateData) {
    // Find the product first
    const product = await Product.findById(productId);
    
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    // Clear cache for this product
    cache.del(`product_${productId}`);
    
    return updatedProduct;
  }
  
  /**
   * Delete a product
   * @param {string} productId - The product ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteProduct(productId) {
    // Check if product exists
    const product = await Product.findById(productId);
    
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    
    // Delete the product
    await Product.findByIdAndDelete(productId);
    
    // Clear cache for this product
    cache.del(`product_${productId}`);
    
    return true;
  }
  
  /**
   * Get products with pagination
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {string} category - Optional category filter
   * @returns {Promise<Object>} - Products with pagination info
   */
  async getProducts(page = 1, limit = 10, category = null) {
    const startIndex = (page - 1) * limit;
    
    // Build query
    const query = {};
    if (category) query.category = category;
    
    // Check cache for common queries
    const cacheKey = `products_${page}_${limit}_${category || 'all'}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }
    
    const products = await Product.find(query)
      .sort({ name: 1 })
      .limit(limit)
      .skip(startIndex);
    
    const total = await Product.countDocuments(query);
    
    const result = {
      count: products.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: products
    };
    
    // Cache for 30 minutes (1800 seconds)
    cache.set(cacheKey, result, 1800);
    
    return result;
  }
  
  /**
   * Search products by name or description
   * @param {string} query - Search query
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<Object>} - Search results with pagination
   */
  async searchProducts(query, page = 1, limit = 10) {
    if (!query || query.length < 2) {
      const error = new Error('Search query must be at least 2 characters');
      error.statusCode = 400;
      throw error;
    }
    
    const startIndex = (page - 1) * limit;
    
    const searchRegex = new RegExp(query, 'i');
    
    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex }
      ]
    })
      .sort({ name: 1 })
      .limit(limit)
      .skip(startIndex);
    
    const total = await Product.countDocuments({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex }
      ]
    });
    
    return {
      count: products.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: products
    };
  }
  
  /**
   * Check if product has sufficient inventory
   * @param {string} productId - The product ID
   * @param {number} quantity - The requested quantity
   * @returns {Promise<boolean>} - True if sufficient inventory exists
   */
  async checkInventory(productId, quantity) {
    const product = await Product.findById(productId);
    
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    
    return product.inventory >= quantity;
  }
  
  /**
   * Update product inventory
   * @param {string} productId - The product ID
   * @param {number} change - The amount to change inventory (positive or negative)
   * @returns {Promise<Object>} - Updated product
   */
  async updateInventory(productId, change) {
    const product = await Product.findById(productId);
    
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    
    if (product.inventory + change < 0) {
      const error = new Error('Insufficient inventory');
      error.statusCode = 400;
      throw error;
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $inc: { inventory: change } },
      { new: true }
    );
    
    // Clear cache for this product
    cache.del(`product_${productId}`);
    
    return updatedProduct;
  }
}

module.exports = new ProductService();