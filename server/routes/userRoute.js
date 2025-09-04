const express = require('express');
const router = express.Router();

const { 
  registerUser, 
  verifyOTP, 
  loginUser, 
  verifyLoginOTP, 
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
  getItemsFromCart,   // ✅ fixed name
  updateCartQuantity,
  removeCartItem,
  clearCart
} = require('../controllers/userController');

const { placeOrder, cancelOrder } = require('../controllers/orderController');
const { authMiddleware, customerMiddleware } = require('../middleware/auth');

// ------------------- Auth/User Routes -------------------
router.post('/register', registerUser);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginUser);
router.post('/verify-login-otp', verifyLoginOTP);
router.get('/getcustomerdetails', authMiddleware, customerMiddleware, getAllUserDetails);

// ------------------- Favourites Routes -------------------
// Restaurants
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
router.get('/cart', authMiddleware, customerMiddleware, getItemsFromCart); // ✅ corrected
router.put('/cart/update', authMiddleware, customerMiddleware, updateCartQuantity);
router.delete('/cart/remove', authMiddleware, customerMiddleware, removeCartItem);
router.delete('/cart/clear', authMiddleware, customerMiddleware, clearCart);

// ------------------- Order Routes -------------------
router.post('/orders/place', authMiddleware, customerMiddleware, placeOrder);
router.post('/orders/:orderId/cancel', authMiddleware, customerMiddleware, cancelOrder);

module.exports = router;
