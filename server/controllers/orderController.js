const Order = require('../models/order');
const User = require('../models/user');

// ---------------- Place Order ----------------
exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user._id; // from auth middleware
    const { restaurantId, deliveryAddress } = req.body;

    if (!restaurantId || !deliveryAddress) {
      return res.status(400).json({ message: 'Restaurant and delivery address are required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ message: 'No items to place order' });
    }

    // Map cart to order items
    const items = user.cart.map((c) => ({
      dishId: c.dishId,
      name: c.name,
      quantity: c.quantity,
      price: c.price,
    }));

    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const finalAmount = totalAmount; // apply discount logic here if needed

    const order = new Order({
      userId,
      restaurantId,
      items,
      totalAmount,
      finalAmount,
      status: 'placed',
      deliveryAddress,
    });

    await order.save();

    // Clear user cart after placing order
    user.cart = [];
    await user.save();

    res.status(200).json({ message: 'Order placed successfully', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to place order', error: err.message });
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
