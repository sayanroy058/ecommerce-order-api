const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Import models
const Customer = require("./models/Customer");
const Product = require("./models/Product");
const Order = require("./models/Order");
const User = require("./models/User");

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://jayanth:fT4t1QcuGAG0NAPj@cluster0.k57vc.mongodb.net/ecommerce-api?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("✅ MongoDB connected..."))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Function to read and parse JSON files
const loadJSON = (filename) => {
  const filePath = path.join(__dirname, "data", filename);
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
};

// Import data function
const importData = async () => {
  try {
    console.log("⏳ Importing data...");

    // Read JSON files
    const customers = loadJSON("customers.json");
    const products = loadJSON("products.json");
    const orders = loadJSON("orders.json");
    const users = loadJSON("users.json");

    // Insert into MongoDB
    await Customer.insertMany(customers);
    await Product.insertMany(products);
    await Order.insertMany(orders);
    await User.insertMany(users);

    console.log("✅ Data successfully imported!");
    process.exit();
  } catch (error) {
    console.error("❌ Error importing data:", error);
    process.exit(1);
  }
};

// Delete all existing data
const deleteData = async () => {
  try {
    console.log("⏳ Deleting all existing data...");

    await Customer.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await User.deleteMany();

    console.log("✅ All existing data deleted!");
    process.exit();
  } catch (error) {
    console.error("❌ Error deleting data:", error);
    process.exit(1);
  }
};

// Command-line execution
if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
} else {
  console.log("ℹ️ Use '--import' to load data or '--delete' to remove data.");
  process.exit();
}
