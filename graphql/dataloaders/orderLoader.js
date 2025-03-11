const DataLoader = require('dataloader');
const Order = require('../../models/Order');

// Batch function to load orders by IDs
const batchOrders = async (ids) => {
  const orders = await Order.find({ _id: { $in: ids } });
  
  // Map the orders to match the order of the input IDs
  return ids.map(id => 
    orders.find(order => order._id.toString() === id.toString()) || null
  );
};

// Batch function to load orders by customer ID
const batchOrdersByCustomer = async (customerIds) => {
  const orders = await Order.find({ customerId: { $in: customerIds } });
  
  // Group orders by customer ID
  return customerIds.map(customerId => 
    orders.filter(order => order.customerId.toString() === customerId.toString())
  );
};

// Create and export the data loaders
const createOrderLoader = () => new DataLoader(batchOrders);
const createCustomerOrdersLoader = () => new DataLoader(batchOrdersByCustomer);

module.exports = {
  createOrderLoader,
  createCustomerOrdersLoader
};