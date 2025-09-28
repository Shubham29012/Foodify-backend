// controllers/orderController.js
const Order = require('../models/order');
const User = require('../models/user');
const { notifyUser } = require('../lib/wsEmitter');

exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { restaurantId, deliveryAddress } = req.body;
    // ...validation and order creation as you already have...

    const order = await new Order({
      userId, restaurantId, items, totalAmount, finalAmount, status: 'placed', deliveryAddress,
    }).save();

    await User.updateOne({ _id: userId }, { $set: { cart: [] } });

    // Emit to user via Redis -> Socket service
    notifyUser(userId, 'order:placed', {
      orderId: order._id.toString(),
      title: 'Order placed 🎉',
      message: 'Your order has been placed successfully.',
      placedAt: order.createdAt,
      amount: finalAmount,
    });

    return res.status(200).json({ message: 'Order placed successfully', order });
  } catch (e) {
    return res.status(500).json({ message: 'Failed to place order', error: e.message });
  }
};

// ---------------- Cancel Order (within 60 sec) ----------------
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Order already cancelled' });
    }

    // Check time difference (in ms)
    const placedTime = new Date(order.createdAt).getTime();
    const currentTime = Date.now();
    const diffSeconds = (currentTime - placedTime) / 1000;

    if (diffSeconds <= 60) {
      order.status = 'cancelled';
      order.paymentStatus = 'refunded'; // refund
      await order.save();

      return res.json({
        message: 'Order cancelled successfully. Refund processed.',
        order,
      });
    } else {
      order.status = 'cancelled';
      order.paymentStatus = 'paid'; // no refund, payment stays
      await order.save();

      return res.json({
        message:
          'Order cancelled. No refund as 60 seconds have passed since placing.',
        order,
      });
    }
  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({ message: 'Failed to cancel order' });
  }
};
