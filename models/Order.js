const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    items: [orderItemSchema],
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    trackingNumber: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for common query fields
orderSchema.index({ customerId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderDate: -1 });

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
