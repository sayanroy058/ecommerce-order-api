# ![E-commerce](https://img.icons8.com/ios-filled/50/000000/shopping-cart.png) E-commerce Order Management API

A **RESTful** and **GraphQL** API for an **e-commerce order management system**.

---

## 🚀 Features

✅ Customer management  
✅ Product catalog  
✅ Order processing  
✅ REST and GraphQL API support  
✅ MongoDB database  

---

## 📌 Requirements

- ![Node.js](https://img.icons8.com/color/48/000000/nodejs.png) **Node.js** 14+
- ![MongoDB](https://img.icons8.com/external-tal-revivo-filled-tal-revivo/24/000000/external-mongodb-a-cross-platform-document-oriented-database-program-logo-filled-tal-revivo.png) **MongoDB** 4.4+
- 🐳 **Docker** (optional)

---

## ⚙️ Installation

### 📄 Environment Variables (.env)

Create a `.env` file in the root directory and configure the following:
```sh
MONGO_URI=mongodb+srv://jayanth:fT4t1QcuGAG0NAPj@cluster0.k57vc.mongodb.net/ecommerce-api?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
JWT_SECRET=89072b77e5162146f0f1640c76522fb3818b13ef08a25d5054280b0663e61500ab31411ab779756d20fbb09025d2e1b51bd3960aa4e291d9339d6937aa109743
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
```
You can customize these values as needed.

### 🖥 Local Development

1. Clone the repository:
    ```sh
    git clone git@github.com:jayanthkrishnakalavapudi/Backend-Development-API.git
    cd ecommerce-order-api
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Set up environment variables:
    Create a `.env` file with the following:
    ```sh
    MONGO_URI=mongodb://localhost:27017/ecommerce
    PORT=5000
    ```

4. Start the server:
    ```sh
    node server.js
    ```

### 🐳 Using Docker

1. Clone the repository
2. Run:
    ```sh
    docker-compose up
    ```

---

## 📖 API Documentation

API documentation is available at `/api-docs` when the server is running.

---

## 🌐 REST API Endpoints

🔹 `GET /api/customers/{customerId}/orders` - Get all orders for a customer  
🔹 `GET /api/orders/{orderId}` - Get order details  
🔹 `POST /api/orders` - Create a new order  
🔹 `PUT /api/orders/{orderId}` - Update an order  
🔹 `DELETE /api/orders/{orderId}` - Cancel an order  

### 📦 Phase 2 Enhancements

🔹 `GET /api/orders/{orderId}/tracking` - Get shipping status and tracking information  
🔹 `GET /api/customers/{customerId}/recommendations` - Get product recommendations based on order history  

### 🏗 Service Layer (Phase 2)

📦 **Order Service** - Manages order processing  
👤 **Customer Service** - Handles customer operations  
🛍 **Product Service** - Manages product catalog  
🚚 **Shipping Service** - Integrates with shipping providers  
🎯 **Recommendation Service** - Provides product recommendations  

---

## ⚡ GraphQL Integration (Phase 3)

This project includes **GraphQL** support for querying and mutating order, customer, and product data.

### 📜 GraphQL Schema and Resolvers
- 📂 **Schema** located in `graphql/schema/`
- 📂 **Resolvers** in `graphql/resolvers/`
- 📂 **Dataloaders** in `graphql/dataloaders/`

### 🚀 Running GraphQL Server
Start the server normally:
```sh
node server.js
```
Then access **Apollo GraphQL Studio** at:
```
http://localhost:5000/graphql
```

### ✨ Sample Queries

🔹 Fetch an order by ID:
```graphql
query {
  order(id: "123") {
    id
    customer {
      name
      email
    }
    products {
      name
      price
    }
    status
  }
}
```

🔹 Create a new order:
```graphql
mutation {
  createOrder(input: { customerId: "123", products: ["456", "789"] }) {
    id
    status
  }
}
```

---

## ⚡ Caching

🕒 **Shipping status information** (TTL: 1 hour)  
📌 **Product recommendations** (TTL: 24 hours)  

---

## ⚠️ Error Handling

❌ Invalid requests  
❌ Database errors  
❌ External service failures  
❌ Authentication/authorization issues  

---

## ☁️ Deployment on Vercel

This project can be deployed using **Vercel** for serverless execution.

## 📜 Database Seeding

To seed the database with initial data, use the following commands:

🔹 Import sample data:
```sh
npm run seed:import
```
🔹 Delete all data:
```sh
npm run seed:delete
```

### 🚀 Steps to Deploy

1. Install Vercel CLI globally:
    ```sh
    npm install -g vercel
    ```
2. Login to Vercel:
    ```sh
    vercel login
    ```
3. Navigate to the project directory and run:
    ```sh
    vercel
    ```
4. Follow the on-screen prompts to configure the deployment.
5. Once deployed, Vercel will provide a live URL to access your API.

---

