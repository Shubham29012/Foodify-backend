const express = require('express');
const {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  getRestaurantsByOwner,
  updateRestaurant,
  deleteRestaurant,
  searchRestaurantsByLocation,
  updateRestaurantStatus
} = require('../controllers/restaurantController');

const { fields } = require('../utils/cloudinary');
const { authMiddleware, ownerMiddleware } = require('../middleware/auth');

const router = express.Router();

// Debug middleware
const debugRequest = (req, res, next) => {
  console.log('=== RESTAURANT ROUTE DEBUG ===');
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Body keys:', Object.keys(req.body || {}));
  console.log('Files:', req.files ? Object.keys(req.files) : 'No files');
  console.log('User:', req.user?.id || 'No user');
  console.log('=============================');
  next();
};

// Public routes (no authentication required)

// Get all restaurants with filtering and pagination
// GET /api/restaurants?page=1&limit=10&cuisine=Italian&isPureVeg=true&search=pizza
router.get('/', getAllRestaurants);

// Get restaurant by ID
// GET /api/restaurants/:id
router.get('/:id', getRestaurantById);

// Search restaurants by location
// GET /api/restaurants/search/location?lat=28.4595&lng=77.0266&radius=5000
router.get('/search/location', searchRestaurantsByLocation);

// Protected routes (authentication required)

// Get restaurants owned by current user
// GET /api/restaurants/owner/my-restaurants
// router.get('/owner/my-restaurants', authMiddleware, ownerMiddleware, getRestaurantsByOwner);

// // Create new restaurant (owner only)
// // POST /api/restaurants
// router.post(
//   '/',
//   debugRequest,
//   authMiddleware,
//   ownerMiddleware,
//   fields([
//     { name: 'logo', maxCount: 1 },
//     { name: 'coverImage', maxCount: 1 }
//   ]),
//   createRestaurant
// );

// Update restaurant (owner only)
// PUT /api/restaurants/:id
// router.put(
//   '/:id',
//   debugRequest,
//   authMiddleware,
//   ownerMiddleware,
//   fields([
//     { name: 'logo', maxCount: 1 },
//     { name: 'coverImage', maxCount: 1 }
//   ]),
//   updateRestaurant
// );

// // Update restaurant status (open/close) - owner only
// // PATCH /api/restaurants/:id/status
// router.patch(
//   '/:id/status',
//   authMiddleware,
//   ownerMiddleware,
//   updateRestaurantStatus
// );

// // Delete restaurant (owner only)
// // DELETE /api/restaurants/:id
// router.delete(
//   '/:id',
//   authMiddleware,
//   ownerMiddleware,
//   deleteRestaurant
// );

module.exports = router;