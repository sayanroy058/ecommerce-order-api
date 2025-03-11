const Customer = require('../../models/Customer');
const { UserInputError } = require('apollo-server-express');

const customerResolvers = {
  Query: {
    customer: async (_, { id }, { loaders }) => {
      return loaders.customerLoader.load(id);
    },
    
    customers: async (_, { pagination = {} }) => {
      const { page = 1, limit = 10 } = pagination;
      const skip = (page - 1) * limit;
      
      const customers = await Customer.find()
        .skip(skip)
        .limit(limit + 1); // get one extra to check if there are more
      
      const hasMore = customers.length > limit;
      if (hasMore) customers.pop(); // remove the extra item
      
      const totalCount = await Customer.countDocuments();
      
      return {
        customers,
        totalCount,
        hasMore
      };
    }
  },
  
  Mutation: {
    createCustomer: async (_, args) => {
      // Check if email already exists
      const existingCustomer = await Customer.findOne({ email: args.email });
      if (existingCustomer) {
        throw new UserInputError('Email already in use');
      }
      
      return Customer.create(args);
    },
    
    updateCustomer: async (_, { id, ...updates }) => {
      const customer = await Customer.findByIdAndUpdate(
        id,
        updates,
        { new: true, runValidators: true }
      );
      
      if (!customer) {
        throw new UserInputError('Customer not found');
      }
      
      return customer;
    },
    
    deleteCustomer: async (_, { id }) => {
      const customer = await Customer.findById(id);
      
      if (!customer) {
        throw new UserInputError('Customer not found');
      }
      
      await customer.remove();
      return true;
    }
  },
  
  Customer: {
    id: (customer) => customer._id.toString(),
    
    orders: async (customer, _, { loaders }) => {
      return loaders.customerOrdersLoader.load(customer._id);
    },
    
    recommendations: async (customer, _, { services }) => {
      // Assuming recommendationService is passed in context
      if (!services.recommendationService) {
        return [];
      }
      
      try {
        return await services.recommendationService.getRecommendations(customer._id);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        return [];
      }
    }
  }
};

module.exports = customerResolvers;