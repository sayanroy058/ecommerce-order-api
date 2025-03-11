# GraphQL Example Queries

This document contains example GraphQL queries for the e-commerce order management system. These examples demonstrate how to interact with the GraphQL API.

## Query Examples

### Fetch Customer with Orders

graphql
query GetCustomerWithOrders($customerId: ID!) {
  customer(id: $customerId) {
    id
    name
    email
    address {
      street
      city
      state
      zipCode
      country
    }
    orders {
      id
      orderDate
      status
      totalAmount
      items {
        quantity
        price
        product {
          name
          description
        }
      }
    }
  }
}
```

Variables:
```json
{
  "customerId": "60f1a5b5e6d3a82d8c3e9876"
}
```

### Fetch Product Details

```graphql
query GetProduct($productId: ID!) {
  product(id: $productId) {
    id
    name
    description
    price
    category
    inventory
    imageUrl
  }
}
```

Variables:
```json
{
  "productId": "60f1a5b5e6d3a82d8c3e9877"
}
```

### Fetch Order with Tracking Information

```graphql
query GetOrderWithTracking($orderId: ID!) {
  order(id: $orderId) {
    id
    orderDate
    status
    totalAmount
    customer {
      name
      email
    }
    items {
      quantity
      price
      product {
        name
        imageUrl
      }
    }
    tracking {
      status
      carrier
      trackingNumber
      estimatedDelivery
      lastUpdated
      location
      events {
        timestamp
        status
        location
        description
      }
    }
  }
}
```

Variables:
```json
{
  "orderId": "60f1a5b5e6d3a82d8c3e9878"
}
```

### Get Products with Pagination and Filtering

```graphql
query GetProducts($first: Int!, $after: String, $filter: ProductFilterInput) {
  products(first: $first, after: $after, filter: $filter) {
    edges {
      node {
        id
        name
        price
        category
        inventory
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
```

Variables:
```json
{
  "first": 10,
  "after": null,
  "filter": {
    "category": "Electronics",
    "minPrice": 50,
    "maxPrice": 500,
    "inStock": true
  }
}
```

### Get Customer Product Recommendations

```graphql
query GetCustomerRecommendations($customerId: ID!) {
  customerRecommendations(customerId: $customerId) {
    product {
      id
      name
      description
      price
      imageUrl
    }
    score
    reason
  }
}
```

Variables:
```json
{
  "customerId": "60f1a5b5e6d3a82d8c3e9876"
}
```

## Mutation Examples

### Create a New Customer

```graphql
mutation CreateCustomer($input: CustomerInput!) {
  createCustomer(input: $input) {
    id
    name
    email
    address {
      street
      city
      state
      zipCode
      country
    }
  }
}
```

Variables:
```json
{
  "input": {
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "address": {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "zipCode": "12345",
      "country": "USA"
    },
    "phone": "555-123-4567"
  }
}
```

### Create a New Product

```graphql
mutation CreateProduct($input: ProductInput!) {
  createProduct(input: $input) {
    id
    name
    description
    price
    category
    inventory
  }
}
```

Variables:
```json
{
  "input": {
    "name": "Wireless Headphones",
    "description": "Premium wireless headphones with noise cancellation",
    "price": 149.99,
    "category": "Electronics",
    "inventory": 50,
    "imageUrl": "https://example.com/images/headphones.jpg"
  }
}
```

### Create a New Order

```graphql
mutation CreateOrder($input: OrderInput!) {
  createOrder(input: $input) {
    id
    customerId
    orderDate
    status
    totalAmount
    items {
      productId
      quantity
      price
    }
  }
}
```

Variables:
```json
{
  "input": {
    "customerId": "60f1a5b5e6d3a82d8c3e9876",
    "items": [
      {
        "productId": "60f1a5b5e6d3a82d8c3e9877",
        "quantity": 2
      },
      {
        "productId": "60f1a5b5e6d3a82d8c3e9879",
        "quantity": 1
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "zipCode": "12345",
      "country": "USA"
    }
  }
}
```

### Update Order Status

```graphql
mutation UpdateOrder($id: ID!, $input: OrderUpdateInput!) {
  updateOrder(id: $id, input: $input) {
    id
    status
    updatedAt
  }
}
```

Variables:
```json
{
  "id": "60f1a5b5e6d3a82d8c3e9878",
  "input": {
    "status": "shipped"
  }
}
```

### Cancel an Order

```graphql
mutation CancelOrder($id: ID!) {
  cancelOrder(id: $id) {
    id
    status
    updatedAt
  }
}
```

Variables:
```json
{
  "id": "60f1a5b5e6d3a82d8c3e9878"
}
```