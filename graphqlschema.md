# 📜 GraphQL Schema Documentation

This document describes the **GraphQL schema** for the E-commerce Order Management API.

---

## 🔹 Schema Structure

### **Order Type**
```graphql
type Order {
  id: ID!
  customer: Customer!
  products: [Product!]!
  status: String!
  createdAt: String!
}
```

### **Customer Type**
```graphql
type Customer {
  id: ID!
  name: String!
  email: String!
  orders: [Order!]
}
```

### **Product Type**
```graphql
type Product {
  id: ID!
  name: String!
  price: Float!
  stock: Int!
}
```

### **Query Type**
```graphql
type Query {
  orders: [Order]
  order(id: ID!): Order
  customers: [Customer]
  customer(id: ID!): Customer
  products: [Product]
  product(id: ID!): Product
}
```

### **Mutation Type**
```graphql
type Mutation {
  createOrder(customerId: ID!, products: [ID!]!): Order!
  updateOrder(id: ID!, status: String!): Order!
  deleteOrder(id: ID!): Boolean!
}
```

---

## 📌 Resolvers

### **Order Resolvers**
```javascript
const orderResolvers = {
  Query: {
    orders: async () => await Order.find(),
    order: async (_, { id }) => await Order.findById(id)
  },
  Mutation: {
    createOrder: async (_, { customerId, products }) => {
      const newOrder = new Order({ customerId, products, status: "Pending" });
      return await newOrder.save();
    },
    updateOrder: async (_, { id, status }) => {
      return await Order.findByIdAndUpdate(id, { status }, { new: true });
    },
    deleteOrder: async (_, { id }) => {
      await Order.findByIdAndDelete(id);
      return true;
    }
  }
};
```

---

## 🔹 GraphQL Playground
Once the server is running, you can access **Apollo GraphQL Studio** at:
```
http://localhost:5000/graphql
```

Test queries and mutations directly using the GraphQL playground.

---

