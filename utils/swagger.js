const swaggerJsDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce Order Management API',
      version: '1.0.0',
      description: 'A RESTful API for e-commerce order management',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        Customer: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            _id: { type: 'string', description: 'Auto-generated MongoDB ID' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                zipCode: { type: 'string' },
                country: { type: 'string' }
              }
            },
            phone: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          required: ['name', 'description', 'price', 'category'],
          properties: {
            _id: { type: 'string', description: 'Auto-generated MongoDB ID' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number', format: 'float' },
            category: { type: 'string' },
            inventory: { type: 'integer', default: 0 },
            imageUrl: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Order: {
          type: 'object',
          required: ['customerId', 'items'],
          properties: {
            _id: { type: 'string', description: 'Auto-generated MongoDB ID' },
            customerId: { type: 'string', description: 'Reference to Customer ID' },
            orderDate: { type: 'string', format: 'date-time' },
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
              default: 'pending'
            },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string', description: 'Reference to Product ID' },
                  quantity: { type: 'integer', minimum: 1 },
                  price: { type: 'number', format: 'float' }
                }
              }
            },
            shippingAddress: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                zipCode: { type: 'string' },
                country: { type: 'string' }
              }
            },
            totalAmount: { type: 'number', format: 'float' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    },
    tags: [
      { name: 'Customers', description: 'Customer management endpoints' },
      { name: 'Products', description: 'Product catalog endpoints' },
      { name: 'Orders', description: 'Order processing endpoints' },
      { name: 'Authentication', description: 'User authentication endpoints' },
      { name: 'Recommendations', description: 'Product recommendation endpoints' },
      { name: 'Tracking', description: 'Order tracking endpoints' }
    ]
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsDoc(options);

module.exports = specs;
