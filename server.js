const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { loadFilesSync } = require('@graphql-tools/load-files');
const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge');
const path = require('path');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const DataLoader = require('dataloader');

// ✅ Import DataLoaders
const customerLoader = require('./graphql/dataloaders/customerLoader');
const orderLoader = require('./graphql/dataloaders/orderLoader');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// ✅ Add CORS Middleware
app.use(cors());

// Middleware for logging HTTP requests
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Body parser
app.use(express.json());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  bufferCommands: false,
  serverSelectionTimeoutMS: 10000,
})
  .then(() => logger.info('✅ MongoDB connected'))
  .catch(err => {
    logger.error('❌ MongoDB connection error:', err);
    process.exit(1); // Exit process if DB connection fails
  });

// Import routes
const customerRoutes = require('./routes/customers');
const orderRoutes = require('./routes/orders');
const productRoutes = require('./routes/products');

// Use routes
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);

// ✅ Swagger API Documentation Setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce API',
      version: '1.0.0',
      description: 'API documentation for the e-commerce platform',
    },
    servers: [
      {
        url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5000',
        description: process.env.VERCEL_URL ? 'Production Server' : 'Development Server',
      },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

const swaggerSpecs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// ===== GRAPHQL SETUP =====
async function startApolloServer() {
  try {
    // Load GraphQL schema and resolvers
    const typesArray = loadFilesSync(path.join(__dirname, 'graphql/schema'));
    const resolversArray = loadFilesSync(path.join(__dirname, 'graphql/resolvers'));

    console.log("🔍 Loaded TypeDefs:", typesArray);
    console.log("🔍 Loaded Resolvers:", resolversArray);

    const typeDefs = mergeTypeDefs(typesArray);
    const resolvers = mergeResolvers(resolversArray);

    console.log("✅ Merged TypeDefs and Resolvers");

    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });

    // ✅ Create Apollo Server with Context for Loaders
    const server = new ApolloServer({
      schema,
      context: ({ req }) => {
        const token = req.headers.authorization || '';
        
        return {
          token,
          loaders: {
            customerLoader,
            customerOrdersLoader: new DataLoader(keys => orderLoader.batchOrders(keys)),
          },
        };
      },
      formatError: (error) => {
        logger.error('GraphQL Error:', error);
        return {
          message: error.message,
          path: error.path,
          ...(process.env.NODE_ENV === 'development' && { extensions: error.extensions }),
        };
      },
    });

    await server.start();
    server.applyMiddleware({ app, path: '/graphql' });

    logger.info(`🚀 GraphQL Server running at http://localhost:${process.env.PORT || 5000}${server.graphqlPath}`);
  } catch (error) {
    logger.error('Failed to start Apollo Server:', error);
  }
}

// ✅ Start both Apollo and REST server after all middleware is loaded
async function startServer() {
  await startApolloServer();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    logger.info(`✅ REST & GraphQL Server running on port ${PORT}`);
  });
}
startServer();

// Default route
app.get('/', (req, res) => {
  logger.info('Root route accessed');
  res.send('E-commerce Order API is running with GraphQL support...');
});

// Error handling middleware
app.use(errorHandler);
