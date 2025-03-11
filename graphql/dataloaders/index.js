const createCustomerLoader = require('./customerLoader');
const createProductLoader = require('./productLoader');
const { createOrderLoader, createCustomerOrdersLoader } = require('./orderLoader');

const createLoaders = () => ({
  customerLoader: createCustomerLoader(),
  productLoader: createProductLoader(),
  orderLoader: createOrderLoader(),
  customerOrdersLoader: createCustomerOrdersLoader()
});

module.exports = createLoaders;