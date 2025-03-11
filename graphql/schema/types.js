const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type Address {
    street: String
    city: String
    state: String
    zipCode: String
    country: String
  }

  type Customer {
    id: ID!
    name: String!
    email: String!
    address: Address
    phone: String
    orders: [Order]
    recommendations: [Product]
    createdAt: String
    updatedAt: String
  }

  type Product {
    id: ID!
    name: String!
    description: String!
    price: Float!
    category: String!
    inventory: Int!
    imageUrl: String
    createdAt: String
    updatedAt: String
  }

  type OrderItem {
    id: ID
    product: Product!
    quantity: Int!
    price: Float!
  }

  type Order {
    id: ID!
    customer: Customer!
    orderDate: String!
    status: String!
    items: [OrderItem!]!
    shippingAddress: Address
    totalAmount: Float!
    tracking: ShippingInfo
    createdAt: String
    updatedAt: String
  }

  type ShippingInfo {
    trackingId: String
    carrier: String
    status: String
    estimatedDelivery: String
    history: [ShippingEvent]
  }

  type ShippingEvent {
    date: String
    status: String
    location: String
    description: String
  }

  type Recommendation {
    product: Product!
    score: Float
    reason: String
  }

  type PaginatedCustomers {
    customers: [Customer!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  type PaginatedProducts {
    products: [Product!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  type PaginatedOrders {
    orders: [Order!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  input AddressInput {
    street: String
    city: String
    state: String
    zipCode: String
    country: String
  }

  input OrderItemInput {
    productId: ID!
    quantity: Int!
  }

  input ProductFilterInput {
    category: String
    minPrice: Float
    maxPrice: Float
    search: String
  }

  input OrderFilterInput {
    status: String
    startDate: String
    endDate: String
  }

  input PaginationInput {
    page: Int
    limit: Int
    cursor: String
  }
`;

module.exports = typeDefs;