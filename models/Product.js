const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  inventory: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  imageUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Create indexes for common query fields
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;