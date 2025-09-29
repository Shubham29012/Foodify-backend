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
} = require('../controllers/userController'); // keep this consistent with your file name

const { placeOrder, cancelOrder } = require('../controllers/orderController');
const { authMiddleware, customerMiddleware } = require('../middleware/auth');
const {
  registerLimiter,
  otpSendLimiter,
  verifyOtpLimiter,
} = require('../middleware/rateLimiter');

const { requireTurnstile } = require('../middleware/turnstile');

// ---- Joi validator + schemas ----
const { validate } = require('../middleware/validate');
const schemas = require('../validation/userSchemas');

// ------------------- Auth/User Routes -------------------
router.post(
  '/register',
  registerLimiter,
  otpSendLimiter,
  validate({ body: schemas.registerCustomerBody }),
  registerCustomer
);

router.post(
  '/verify-otp',
  verifyOtpLimiter,
  validate({ body: schemas.verifyCustomerOtpBody }),
  verifyCustomerOTP
);

// Login (validates password if present) + sends OTP
router.post(
  '/login',
  requireTurnstile,
  otpSendLimiter,
  validate({ body: schemas.loginCustomerBody }),
  loginCustomer
);

router.post(
  '/verify-login-otp',
  verifyOtpLimiter,
  validate({ body: schemas.verifyLoginOtpBody }),
  verifyCustomerLoginOTP
);

router.get(
  '/getcustomerdetails',
  authMiddleware,
  customerMiddleware,
  getAllUserDetails
);

// ------------------- Forgot Password -------------------
router.post(
  '/forgot-password/request',
  requireTurnstile,
  otpSendLimiter,
  validate({ body: schemas.requestPasswordResetBody }),
  requestPasswordReset
);

router.post(
  '/forgot-password/verify',
  verifyOtpLimiter,
  validate({ body: schemas.verifyPasswordResetOtpBody }),
  verifyPasswordResetOTP
);

router.post(
  '/forgot-password/reset',
  validate({ body: schemas.resetPasswordWithTokenBody }),
  resetPasswordWithToken
);

router.post(
  '/change-password',
  authMiddleware,
  customerMiddleware,
  validate({ body: schemas.changePasswordBody }),
  changePassword
);

// ------------------- Favourites Routes -------------------
router.post(
  '/favourites/restaurant',
  authMiddleware,
  customerMiddleware,
  validate({ body: schemas.addFavouriteRestaurantBody }),
  addFavouritesRestaurant
);

router.delete(
  '/favourites/restaurant',
  authMiddleware,
  customerMiddleware,
  validate({ body: schemas.removeFavouriteRestaurantBody }),
  removeFavouriteRestaurant
);

router.get(
  '/favourites/restaurants',
  authMiddleware,
  customerMiddleware,
  getFavouriteRestaurants
);

router.post(
  '/favourites/restaurant/check',
  authMiddleware,
  customerMiddleware,
  validate({ body: schemas.checkRestaurantFavouriteBody }),
  isRestaurantFavourite
);

// Dishes
router.post(
  '/favourites/dish',
  authMiddleware,
  customerMiddleware,
  validate({ body: schemas.addFavouriteDishBody }),
  addFavouritesDish
);

router.delete(
  '/favourites/dish',
  authMiddleware,
  customerMiddleware,
  validate({ body: schemas.removeFavouriteDishBody }),
  removeFavouriteDish
);

router.get(
  '/favourites/dishes',
  authMiddleware,
  customerMiddleware,
  getFavouriteDishes
);

router.post(
  '/favourites/dish/check',
  authMiddleware,
  customerMiddleware,
  validate({ body: schemas.checkDishFavouriteBody }),
  isDishFavourite
);

// ------------------- Cart Routes -------------------
router.post(
  '/cart/add',
  authMiddleware,
  customerMiddleware,
  validate({ body: schemas.addToCartBody }),
  addToCart
);

router.get(
  '/cart',
  authMiddleware,
  customerMiddleware,
  getItemsFromCart
);

router.put(
  '/cart/update',
  authMiddleware,
  customerMiddleware,
  validate({ body: schemas.updateCartQuantityBody }),
  updateCartQuantity
);

router.delete(
  '/cart/remove',
  authMiddleware,
  customerMiddleware,
  validate({ body: schemas.removeCartItemBody }),
  removeCartItem
);

router.delete(
  '/cart/clear',
  authMiddleware,
  customerMiddleware,
  clearCart
);

// ------------------- Order Routes -------------------
// If you define a body contract for placeOrder later, plug it here:
router.post(
  '/orders/place',
  authMiddleware,
  customerMiddleware,
  // validate({ body: schemas.placeOrderBody }),
  placeOrder
);

router.post(
  '/orders/:orderId/cancel',
  authMiddleware,
  customerMiddleware,
  validate({ params: schemas.cancelOrderParams }),
  cancelOrder
);

module.exports = router;
