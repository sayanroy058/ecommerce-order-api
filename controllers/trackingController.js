const orderService = require('../services/orderService');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints
 */

/**
 * @swagger
 * /api/orders/{id}/tracking:
 *   get:
 *     summary: Get tracking information for a specific order
 *     tags: [Orders]
 *     description: Retrieves the tracking status and updates for a given order.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the order
 *     responses:
 *       200:
 *         description: Successfully retrieved tracking details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                       example: "605c72b5f1a2b934b8b38e19"
 *                     status:
 *                       type: string
 *                       example: "In Transit"
 *                     estimatedDelivery:
 *                       type: string
 *                       format: date
 *                       example: "2025-03-15"
 *                     trackingHistory:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-03-10T14:30:00Z"
 *                           location:
 *                             type: string
 *                             example: "New York, NY"
 *                           status:
 *                             type: string
 *                             example: "Shipped"
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Order not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
exports.getOrderTracking = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const trackingInfo = await orderService.getOrderTracking(orderId);
    
    res.status(200).json({
      success: true,
      data: trackingInfo
    });
  } catch (error) {
    next(error);
  }
};
