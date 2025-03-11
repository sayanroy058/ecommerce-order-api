const DataLoader = require('dataloader');
const Customer = require('../../models/Customer');

async function batchCustomers(ids) {
  // Find customers where _id is in the provided list
  const customers = await Customer.find({ _id: { $in: ids } });

  // Map results to ensure order matches input keys
  return ids.map(id => customers.find(customer => customer._id.toString() === id.toString()) || null);
}

const customerLoader = new DataLoader(batchCustomers);

module.exports = customerLoader;
