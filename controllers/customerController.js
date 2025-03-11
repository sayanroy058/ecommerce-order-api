const CustomerService = require('../services/customerService');

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer management endpoints
 */

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Customers]
 *     description: Retrieves a paginated list of customers
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of customers per page
 *     responses:
 *       200:
 *         description: List of customers
 */
exports.getCustomers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    
    const result = await CustomerService.getAllCustomers({ page, limit });

    res.status(200).json({
      success: true,
      count: result.data.length,
      pagination: result.pagination,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Get a single customer by ID
 *     tags: [Customers]
 *     description: Fetches a customer using their unique ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer ID
 *     responses:
 *       200:
 *         description: Customer data retrieved successfully
 *       404:
 *         description: Customer not found
 */
exports.getCustomer = async (req, res, next) => {
  try {
    const customer = await CustomerService.getCustomerById(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
 *     description: Adds a new customer to the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               phone:
 *                 type: string
 *                 example: "+123456789"
 *     responses:
 *       201:
 *         description: Customer created successfully
 *       400:
 *         description: Invalid input data
 */
exports.createCustomer = async (req, res, next) => {
  try {
    const customer = await CustomerService.createCustomer(req.body);

    res.status(201).json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Update an existing customer
 *     tags: [Customers]
 *     description: Modifies an existing customer record
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe Updated
 *               email:
 *                 type: string
 *                 format: email
 *                 example: updatedemail@example.com
 *               phone:
 *                 type: string
 *                 example: "+987654321"
 *     responses:
 *       200:
 *         description: Customer updated successfully
 *       404:
 *         description: Customer not found
 */
exports.updateCustomer = async (req, res, next) => {
  try {
    const customer = await CustomerService.updateCustomer(req.params.id, req.body);

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Delete a customer
 *     tags: [Customers]
 *     description: Removes a customer from the database
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer ID
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *       404:
 *         description: Customer not found
 */
exports.deleteCustomer = async (req, res, next) => {
  try {
    const result = await CustomerService.deleteCustomer(req.params.id);

    if (!result) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/customers/{id}/recommendations:
 *   get:
 *     summary: Get product recommendations for a customer
 *     tags: [Customers]
 *     description: Fetches product recommendations based on a customer's purchase history
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The customer ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of recommended products to retrieve
 *     responses:
 *       200:
 *         description: List of recommended products
 *       404:
 *         description: Customer not found
 *       503:
 *         description: Recommendation service unavailable
 */
exports.getCustomerRecommendations = async (req, res, next) => {
  try {
    const customerId = req.params.id;
    const limit = parseInt(req.query.limit, 10) || 5;
    
    // First check if customer exists
    const customerExists = await CustomerService.customerExists(customerId);
    if (!customerExists) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    
    const recommendations = await CustomerService.getRecommendationsForCustomer(customerId, limit);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    // Handle third-party service failures
    if (error.isThirdPartyError) {
      return res.status(503).json({
        success: false,
        error: 'Recommendation service temporarily unavailable',
        message: error.message
      });
    }
    next(error);
  }
};
