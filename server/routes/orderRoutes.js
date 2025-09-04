const express = require('express');
const router = express.Router();
const { placeOrder, cancelOrder } = require('../controllers/orderController');
const { authMiddleware, customerMiddleware } = require('../middleware/auth');

// Place Order
router.post(
  '/place',
  authMiddleware,
  customerMiddleware,
  placeOrder
);

// Cancel Order
router.put(
  '/cancel/:orderId',
  authMiddleware,
  customerMiddleware,
  cancelOrder
);

module.exports = router;
