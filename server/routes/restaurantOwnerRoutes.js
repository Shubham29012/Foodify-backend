// // const express = require('express');
// // const router = express.Router();
// // const authController = require('../controllers/restaurantOwnerAuthController');
// // const restaurantController = require('../controllers/restaurantOwnerController');
// // const { fields } = require('../utils/cloudinary');
// // const { authMiddleware, ownerMiddleware } = require('../middleware/auth');

// // // Debug middleware
// // const debugRequest = (req, res, next) => {
// //   console.log('=== RESTAURANT OWNER ROUTE DEBUG ===');
// //   console.log('Method:', req.method);
// //   console.log('Path:', req.path);
// //   console.log('Body keys:', Object.keys(req.body || {}));
// //   console.log('Files:', req.files ? Object.keys(req.files) : 'No files');
// //   console.log('User:', req.user?.id || 'No user');
// //   console.log('====================================');
// //   next();
// // };

// // // Authentication routes (public)
// // router.post('/register', authController.registerRestaurantOwner);
// // router.post('/verify-otp', authController.verifyRestaurantOwnerOTP);
// // router.post('/login', authController.loginRestaurantOwner);
// // router.post('/verify-login-otp', authController.verifyRestaurantOwnerLoginOTP);

// // // Restaurant management routes (protected - owner only)

// // // Get all restaurants owned by current user
// // // GET /api/restaurant-owner/restaurants
// // router.get(
// //   '/restaurants',
// //   authMiddleware,
// //   ownerMiddleware,
// //   restaurantController.getMyRestaurants
// // );

// // // Create new restaurant
// // // POST /api/restaurant-owner/restaurants
// // router.post(
// //   '/restaurants',
// //   debugRequest,
// //   authMiddleware,
// //   ownerMiddleware,
// //   fields([
// //     { name: 'logo', maxCount: 1 },
// //     { name: 'coverImage', maxCount: 1 }
// //   ]),
// //   restaurantController.createRestaurant
// // );

// // // Update restaurant
// // // PUT /api/restaurant-owner/restaurants/:id
// // router.put(
// //   '/restaurants/:id',
// //   debugRequest,
// //   authMiddleware,
// //   ownerMiddleware,
// //   fields([
// //     { name: 'logo', maxCount: 1 },
// //     { name: 'coverImage', maxCount: 1 }
// //   ]),
// //   restaurantController.updateRestaurant
// // );

// // // Update restaurant status (open/close)
// // // PATCH /api/restaurant-owner/restaurants/:id/status
// // router.patch(
// //   '/restaurants/:id/status',
// //   authMiddleware,
// //   ownerMiddleware,
// //   restaurantController.updateRestaurantStatus
// // );

// // // Delete restaurant
// // // DELETE /api/restaurant-owner/restaurants/:id
// // router.delete(
// //   '/restaurants/:id',
// //   authMiddleware,
// //   ownerMiddleware,
// //   restaurantController.deleteRestaurant
// // );

// // module.exports = router;
// const express = require('express');
// const {
//   getAllRestaurants,
//   getRestaurantById,
//   searchRestaurantsByLocation,
//   searchRestaurants
// } = require('../controllers/restaurantController');

// const router = express.Router();

// // Public routes (no authentication required)

// // Get all restaurants with filtering and pagination
// // GET /api/restaurants?page=1&limit=10&cuisine=Italian&isPureVeg=true&search=pizza
// router.get('/', getAllRestaurants);

// // Advanced restaurant search with multiple filters
// // GET /api/restaurants/search?query=pizza&cuisine=Italian&isPureVeg=true&minRating=4&sortBy=rating
// router.get('/search', searchRestaurants);

// // Search restaurants by location (specific route before dynamic :id route)
// // GET /api/restaurants/search/location?lat=28.4595&lng=77.0266&radius=5000
// router.get('/search/location', searchRestaurantsByLocation);

// // Get restaurant by ID (keep this after other specific routes)
// // GET /api/restaurants/:id
// router.get('/:id', getRestaurantById);

// module.exports = router;
const express = require('express');
const router = express.Router();
const restaurantOwnerController = require('../controllers/restaurantOwnerController');
const { fields } = require('../utils/cloudinary');
const { authMiddleware, ownerMiddleware } = require('../middleware/auth');

// Debug middleware
const debugRequest = (req, res, next) => {
  console.log('=== RESTAURANT OWNER ROUTE DEBUG ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Body keys:', Object.keys(req.body || {}));
  console.log('Files:', req.files ? Object.keys(req.files) : 'No files');
  console.log('User:', req.user?.id || 'No user');
  console.log('====================================');
  next();
};

// Authentication routes (public)
router.post('/register', restaurantOwnerController.registerRestaurantOwner);
router.post('/verify-otp', restaurantOwnerController.verifyRestaurantOwnerOTP);
router.post('/login', restaurantOwnerController.loginRestaurantOwner);
router.post('/verify-login-otp', restaurantOwnerController.verifyRestaurantOwnerLoginOTP);

// Restaurant management routes (protected - owner only)

// Get all restaurants owned by current user
// GET /api/restaurant-owner/restaurants
router.get(
  '/restaurants',
  authMiddleware,
  ownerMiddleware,
  restaurantOwnerController.getMyRestaurants
);

// Create new restaurant
// POST /api/restaurant-owner/restaurants
router.post(
  '/restaurants',
  debugRequest,
  authMiddleware,
  ownerMiddleware,
  fields([
    { name: 'logo', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  restaurantOwnerController.createRestaurant
);

// Update restaurant
// PUT /api/restaurant-owner/restaurants/:id
router.put(
  '/restaurants/:id',
  debugRequest,
  authMiddleware,
  ownerMiddleware,
  fields([
    { name: 'logo', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  restaurantOwnerController.updateRestaurant
);

// Update restaurant status (open/close)
// PATCH /api/restaurant-owner/restaurants/:id/status
router.patch(
  '/restaurants/:id/status',
  authMiddleware,
  ownerMiddleware,
  restaurantOwnerController.updateRestaurantStatus
);

// Delete restaurant
// DELETE /api/restaurant-owner/restaurants/:id
router.delete(
  '/restaurants/:id',
  authMiddleware,
  ownerMiddleware,
  restaurantOwnerController.deleteRestaurant
);

module.exports = router;