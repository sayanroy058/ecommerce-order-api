const customerResolvers = require('./customerResolvers');
const productResolvers = require('./productResolvers');
const orderResolvers = require('./orderResolvers');
const shippingResolvers = require('./shippingResolvers');
const recommendationResolvers = require('./recommendationResolvers');

// Merge resolvers
const resolvers = {
  Query: {
    ...customerResolvers.Query,
    ...productResolvers.Query,
    ...orderResolvers.Query,
    ...shippingResolvers.Query,
    ...recommendationResolvers.Query
  },
  Mutation: {
    ...customerResolvers.Mutation,
    ...productResolvers.Mutation,
    ...orderResolvers.Mutation
  },
  Customer: customerResolvers.Customer,
  Product: productResolvers.Product,
  Order: orderResolvers.Order
};

module.exports = resolvers;