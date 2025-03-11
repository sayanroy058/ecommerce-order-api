const recommendationService = require('../services/recommendationService');

/**
 * @swagger
 * tags:
 *   name: Recommendations
 *   description: Product recommendation endpoints
 */

/**
 * @swagger
 * /api/customers/{customerId}/recommendations:
 *   get:
 *     summary: Get product recommendations for a customer
 *     tags: [Recommendations]
 *     description: Retrieves a list of personalized product recommendations for a given customer.
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the customer
 *     responses:
 *       200:
 *         description: A list of recommended products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "605c72b5f1a2b934b8b38e19"
 *                       name:
 *                         type: string
 *                         example: "Wireless Earbuds"
 *                       category:
 *                         type: string
 *                         example: "Electronics"
 *                       price:
 *                         type: number
 *                         example: 79.99
 *       500:
 *         description: Internal server error
 */
exports.getCustomerRecommendations = async (req, res, next) => {
  try {
    const customerId = req.params.customerId;
    const recommendations = await recommendationService.getCustomerRecommendations(customerId);
    
    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};
