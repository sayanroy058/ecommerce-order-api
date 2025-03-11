const Product = require('../../models/Product');
const { UserInputError } = require('apollo-server-express');

const productResolvers = {
  Query: {
    product: async (_, { id }, { loaders }) => {
      return loaders.productLoader.load(id);
    },
    
    products: async (_, { filter = {}, pagination = {} }) => {
      const { category, minPrice, maxPrice, search } = filter;
      const { page = 1, limit = 10 } = pagination;
      const skip = (page - 1) * limit;
      
      // Build filter object
      const queryFilter = {};
      
      if (category) queryFilter.category = category;
      
      if (minPrice !== undefined || maxPrice !== undefined) {
        queryFilter.price = {};
        if (minPrice !== undefined) queryFilter.price.$gte = minPrice;
        if (maxPrice !== undefined) queryFilter.price.$lte = maxPrice;
      }
      
      if (search) {
        queryFilter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      const products = await Product.find(queryFilter)
        .skip(skip)
        .limit(limit + 1); // get one extra to check if there are more
      
      const hasMore = products.length > limit;
      if (hasMore) products.pop(); // remove the extra item
      
      const totalCount = await Product.countDocuments(queryFilter);
      
      return {
        products,
        totalCount,
        hasMore
      };
    }
  },
  
  Mutation: {
    createProduct: async (_, args) => {
      return Product.create(args);
    },
    
    updateProduct: async (_, { id, ...updates }) => {
      const product = await Product.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      );
      
      if (!product) {
        throw new UserInputError('Product not found');
      }
      
      return product;
    },
    
    deleteProduct: async (_, { id }) => {
      const product = await Product.findById(id);
      
      if (!product) {
        throw new UserInputError('Product not found');
      }
      
      await product.remove();
      return true;
    }
  },
  
  Product: {
    id: (product) => product._id.toString()
  }
};

module.exports = productResolvers;