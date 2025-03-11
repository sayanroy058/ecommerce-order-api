const ProductService = require('../services/productService');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     description: Retrieves a paginated list of products, optionally filtered by category
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
 *         description: Number of products per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter products by category
 *     responses:
 *       200:
 *         description: A list of products
 */
exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { category } = req.query;
    
    const result = await ProductService.getAllProducts({ page, limit, category });

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
 * /api/products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     description: Fetches the details of a specific product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product details retrieved successfully
 *       404:
 *         description: Product not found
 */
exports.getProduct = async (req, res, next) => {
  try {
    const product = await ProductService.getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     description: Adds a new product to the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, category]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Wireless Headphones"
 *               price:
 *                 type: number
 *                 example: 99.99
 *               category:
 *                 type: string
 *                 example: "Electronics"
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid input data
 */
exports.createProduct = async (req, res, next) => {
  try {
    const product = await ProductService.createProduct(req.body);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update an existing product
 *     tags: [Products]
 *     description: Modifies an existing product's details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Headphones"
 *               price:
 *                 type: number
 *                 example: 79.99
 *               category:
 *                 type: string
 *                 example: "Electronics"
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await ProductService.updateProduct(req.params.id, req.body);

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     description: Removes a product from the database
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const result = await ProductService.deleteProduct(req.params.id);

    if (!result) {
      return res.status(404).json({ success: false, error: 'Product not found' });
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
 * /api/products/recommendations:
 *   get:
 *     summary: Get product recommendations
 *     tags: [Products]
 *     description: Retrieves a list of recommended products based on category
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: The category to get recommendations from
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of recommendations to retrieve
 *     responses:
 *       200:
 *         description: A list of recommended products
 *       503:
 *         description: Recommendation service temporarily unavailable
 */
exports.getProductRecommendations = async (req, res, next) => {
  try {
    const { category, limit } = req.query;
    const recommendations = await ProductService.getRecommendations(category, limit);

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
