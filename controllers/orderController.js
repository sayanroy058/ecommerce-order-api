const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const logger = require('../utils/logger');
const orderService = require('../services/orderService');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */

/**
 * @swagger
 * /api/customers/{customerId}/orders:
 *   get:
 *     summary: Get all orders for a customer
 *     tags: [Orders]
 *     description: Retrieves a paginated list of orders for a specific customer
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the customer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of orders per page
 *     responses:
 *       200:
 *         description: A list of customer orders
 */
exports.getCustomerOrders = async (req, res, next) => {
  try {
    const customerId = req.params.customerId;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    
    const result = await orderService.getCustomerOrders(customerId, page, limit);
    
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get a single order by ID
 *     tags: [Orders]
 *     description: Fetches the details of a specific order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The order ID
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
 *       404:
 *         description: Order not found
 */
exports.getOrder = async (req, res, next) => {
  try {
    const order = await orderService.getOrderDetails(req.params.id);
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     description: Adds a new order to the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customerId, items]
 *             properties:
 *               customerId:
 *                 type: string
 *                 example: "60c72b2f9b1e8a5a7c7e4b5a"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       example: "60c72b3e9b1e8a5a7c7e4b5b"
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *               totalPrice:
 *                 type: number
 *                 example: 59.99
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid input data
 */
exports.createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.body);
    
    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Update an existing order
 *     tags: [Orders]
 *     description: Modifies an existing order's details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       example: "60c72b3e9b1e8a5a7c7e4b5b"
 *                     quantity:
 *                       type: integer
 *                       example: 3
 *               totalPrice:
 *                 type: number
 *                 example: 89.99
 *     responses:
 *       200:
 *         description: Order updated successfully
 *       404:
 *         description: Order not found
 */
exports.updateOrder = async (req, res, next) => {
  try {
    const updatedOrder = await orderService.updateOrder(req.params.id, req.body);
    
    res.status(200).json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Cancel an order
 *     tags: [Orders]
 *     description: Cancels an existing order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The order ID
 *     responses:
 *       200:
 *         description: Order canceled successfully
 *       404:
 *         description: Order not found
 */
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(req.params.id);
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};
