const { gql } = require('apollo-server-express');

const queryTypeDefs = gql`
  type Query {
    # Customer Queries
    customer(id: ID!): Customer
    customers(pagination: PaginationInput): PaginatedCustomers
    
    # Product Queries
    product(id: ID!): Product
    products(filter: ProductFilterInput, pagination: PaginationInput): PaginatedProducts
    
    # Order Queries
    order(id: ID!): Order
    orders(filter: OrderFilterInput, pagination: PaginationInput): PaginatedOrders
    customerOrders(customerId: ID!, pagination: PaginationInput): PaginatedOrders
    
    # Shipping Queries
    orderTracking(orderId: ID!): ShippingInfo
    
    # Recommendation Queries
    customerRecommendations(customerId: ID!, limit: Int): [Recommendation]
  }
`;

module.exports = queryTypeDefs;