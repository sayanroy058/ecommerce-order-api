const { gql } = require('apollo-server-express');

const mutationTypeDefs = gql`
  type Mutation {
    # Customer Mutations
    createCustomer(name: String!, email: String!, phone: String, address: AddressInput): Customer
    updateCustomer(id: ID!, name: String, email: String, phone: String, address: AddressInput): Customer
    deleteCustomer(id: ID!): Boolean
    
    # Product Mutations
    createProduct(
      name: String!, 
      description: String!, 
      price: Float!, 
      category: String!, 
      inventory: Int!, 
      imageUrl: String
    ): Product
    updateProduct(
      id: ID!, 
      name: String, 
      description: String, 
      price: Float, 
      category: String, 
      inventory: Int, 
      imageUrl: String
    ): Product
    deleteProduct(id: ID!): Boolean
    
    # Order Mutations
    createOrder(
      customerId: ID!, 
      items: [OrderItemInput!]!, 
      shippingAddress: AddressInput
    ): Order
    updateOrderStatus(id: ID!, status: String!): Order
    updateOrderShipping(id: ID!, shippingAddress: AddressInput!): Order
    cancelOrder(id: ID!): Order
  }
`;

module.exports = mutationTypeDefs;