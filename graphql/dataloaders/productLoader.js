const DataLoader = require('dataloader');
const Product = require('../../models/Product');

// Batch function to load products by IDs
const batchProducts = async (ids) => {
  const products = await Product.find({ _id: { $in: ids } });
  
  // Map the products to match the order of the input IDs
  return ids.map(id => 
    products.find(product => product._id.toString() === id.toString()) || null
  );
};

// Create and export the data loader
const createProductLoader = () => new DataLoader(batchProducts);

module.exports = createProductLoader;