const express = require('express');
const {
  getOrder,
  createOrder,
  updateOrder,
  cancelOrder
} = require('../controllers/orderController');
const { getOrderTracking } = require('../controllers/trackingController');

const router = express.Router({ mergeParams: true });

router.route('/')
  .post(createOrder);

router.route('/:id')
  .get(getOrder)
  .put(updateOrder)
  .delete(cancelOrder);

router.route('/:id/tracking')
  .get(getOrderTracking);

module.exports = router;