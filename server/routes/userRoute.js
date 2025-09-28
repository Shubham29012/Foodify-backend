// routes/customerRoutes.js  (the file you pasted at the bottom)
const express = require('express');
const router = express.Router();

const {
  registerCustomer,
  verifyCustomerOTP,
  loginCustomer,
  verifyCustomerLoginOTP,
  getAllUserDetails,
  addFavouritesRestaurant,
  addFavouritesDish,
  removeFavouriteRestaurant,
  removeFavouriteDish,
  getFavouriteRestaurants,
  getFavouriteDishes,
  isRestaurantFavourite,
  isDishFavourite,
  addToCart,
  getItemsFromCart,
  updateCartQuantity,
  removeCartItem,
  clearCart,

  // NEW:
  requestPasswordReset,
  verifyPasswordResetOTP,
  resetPasswordWithToken,
  changePassword,
} = require('../controllers/userController'); // ensure this matches your file name

const { placeOrder, cancelOrder } = require('../controllers/orderController');
const { authMiddleware, customerMiddleware } = require('../middleware/auth');
const {
  registerLimiter,
  otpSendLimiter,
  verifyOtpLimiter,
} = require('../middleware/rateLimiter');

const { requireTurnstile } = require('../middleware/turnstile');

// ------------------- Auth/User Routes -------------------
router.post('/register', registerLimiter, otpSendLimiter, registerCustomer);

// Verify registration OTP
router.post('/verify-otp', verifyOtpLimiter, verifyCustomerOTP);

// Login (validates password if present) + sends OTP
// 🔒 Protect with Turnstile to mitigate bot/DDOS login traffic
router.post('/login', requireTurnstile, otpSendLimiter, loginCustomer);

// Verify login OTP
router.post('/verify-login-otp', verifyOtpLimiter, verifyCustomerLoginOTP);

router.get('/getcustomerdetails', authMiddleware, customerMiddleware, getAllUserDetails);

// ------------------- Forgot Password (Turnstile-protected where users can spam) -------------------
// Step 1: request OTP (protected by Turnstile)
router.post('/forgot-password/request', requireTurnstile, otpSendLimiter, requestPasswordReset);
// Step 2: verify OTP -> returns short-lived resetToken
router.post('/forgot-password/verify', verifyOtpLimiter, verifyPasswordResetOTP);
// Step 3: set new password with resetToken
router.post('/forgot-password/reset', resetPasswordWithToken);

// Logged-in change password
router.post('/change-password', authMiddleware, customerMiddleware, changePassword);

// ------------------- Favourites Routes -------------------
router.post('/favourites/restaurant', authMiddleware, customerMiddleware, addFavouritesRestaurant);
router.delete('/favourites/restaurant', authMiddleware, customerMiddleware, removeFavouriteRestaurant);
router.get('/favourites/restaurants', authMiddleware, customerMiddleware, getFavouriteRestaurants);
router.post('/favourites/restaurant/check', authMiddleware, customerMiddleware, isRestaurantFavourite);

// Dishes
router.post('/favourites/dish', authMiddleware, customerMiddleware, addFavouritesDish);
router.delete('/favourites/dish', authMiddleware, customerMiddleware, removeFavouriteDish);
router.get('/favourites/dishes', authMiddleware, customerMiddleware, getFavouriteDishes);
router.post('/favourites/dish/check', authMiddleware, customerMiddleware, isDishFavourite);

// ------------------- Cart Routes -------------------
router.post('/cart/add', authMiddleware, customerMiddleware, addToCart);
router.get('/cart', authMiddleware, customerMiddleware, getItemsFromCart);
router.put('/cart/update', authMiddleware, customerMiddleware, updateCartQuantity);
router.delete('/cart/remove', authMiddleware, customerMiddleware, removeCartItem);
router.delete('/cart/clear', authMiddleware, customerMiddleware, clearCart);

// ------------------- Order Routes -------------------
router.post('/orders/place', authMiddleware, customerMiddleware, placeOrder);
router.post('/orders/:orderId/cancel', authMiddleware, customerMiddleware, cancelOrder);

module.exports = router;
