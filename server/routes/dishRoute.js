// const express = require('express');
// const { addDish, getDishesByRestaurant } = require('../controllers/dishController');
// const { upload } = require('../utils/cloudinary');
// const { authMiddleware, ownerMiddleware } = require('../middleware/auth');

// const router = express.Router();

// // Debug middleware to log request details
// const debugRequest = (req, res, next) => {
//   console.log('=== DEBUG REQUEST ===');
//   console.log('Content-Type:', req.headers['content-type']);
//   console.log('Method:', req.method);
//   console.log('Body keys:', Object.keys(req.body || {}));
//   console.log('File present:', !!req.file);
//   console.log('===================');
//   next();
// };

// // Add dish route - CRITICAL: Order matters!
// router.post(
//   '/add',
//   debugRequest, // Debug first
//   authMiddleware, // Auth second
//   ownerMiddleware, // Owner check third
//   upload.single('image'), // Multer MUST come after auth but before controller
//   (req, res, next) => {
//     console.log('=== AFTER MULTER ===');
//     console.log('req.file:', req.file);
//     console.log('req.body:', req.body);
//     console.log('File uploaded:', !!req.file);
//     console.log('==================');
//     next();
//   },
//   addDish // Controller last
// );

// // Get dishes by restaurant
// router.get('/:restaurantId', getDishesByRestaurant);

// module.exports = router;
// const express = require('express');
// const { addDish, getDishesByRestaurant, updateDish, deleteDish, getDishById } = require('../controllers/dishController');
// const { upload } = require('../utils/cloudinary');
// const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// const router = express.Router();

// // Debug middleware to log request details
// const debugRequest = (req, res, next) => {
//   console.log('=== DEBUG DISH REQUEST ===');
//   console.log('Content-Type:', req.headers['content-type']);
//   console.log('Method:', req.method);
//   console.log('Path:', req.path);
//   console.log('Body keys:', Object.keys(req.body || {}));
//   console.log('File present:', !!req.file);
//   console.log('User:', req.user?.id || 'No user');
//   console.log('User Role:', req.user?.role || 'No role');
//   console.log('========================');
//   next();
// };

// // Public Routes (no authentication required)

// // Get dishes by restaurant ID
// // GET /api/dishes/:restaurantId
// router.get('/:restaurantId', getDishesByRestaurant);

// // Get single dish by ID
// // GET /api/dishes/dish/:dishId
// router.get('/dish/:dishId', getDishById);

// // Protected Routes (restaurant owner only)

// // Add dish route - CRITICAL: Order matters!
// // POST /api/dishes/add
// router.post(
//   '/add',
//   debugRequest, // Debug first
//   authMiddleware, // Auth second
//   roleMiddleware('restaurant_owner'), // Owner check third
//   upload.single('image'), // Multer MUST come after auth but before controller
//   (req, res, next) => {
//     console.log('=== AFTER MULTER ===');
//     console.log('req.file:', req.file);
//     console.log('req.body:', req.body);
//     console.log('File uploaded:', !!req.file);
//     console.log('==================');
//     next();
//   },
//   addDish // Controller last
// );

// // Update dish
// // PUT /api/dishes/:dishId
// router.put(
//   '/:dishId',
//   debugRequest,
//   authMiddleware,
//   roleMiddleware('restaurant_owner'),
//   upload.single('image'), // Optional image update
//   updateDish
// );

// // Delete dish
// // DELETE /api/dishes/:dishId
// router.delete(
//   '/:dishId',
//   authMiddleware,
//   roleMiddleware('restaurant_owner'),
//   deleteDish
// );

// module.exports = router;
const express = require('express');
const { 
  addDish, 
  getDishesByRestaurant, 
  updateDish, 
  deleteDish, 
  toggleDishAvailability 
} = require('../controllers/dishController');
const { upload } = require('../utils/cloudinary');
const { authMiddleware, ownerMiddleware } = require('../middleware/auth');

const router = express.Router();

// Debug middleware to log request details
const debugRequest = (req, res, next) => {
  console.log('=== DEBUG DISH REQUEST ===');
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  console.log('Params:', req.params);
  console.log('Body keys:', Object.keys(req.body || {}));
  console.log('File present:', !!req.file);
  console.log('User:', req.user?.id || 'No user');
  console.log('User Role:', req.user?.role || 'No role');
  console.log('========================');
  next();
};

// Protected Routes (restaurant owner only)

// Add dish to a specific restaurant
// POST /api/dishes/restaurants/:restaurantId
router.post(
  '/restaurants/:restaurantId',
  debugRequest,
  authMiddleware,
  ownerMiddleware,
  upload.single('image'), // Image is required for adding dish
  (req, res, next) => {
    console.log('=== AFTER MULTER ===');
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);
    console.log('File uploaded:', !!req.file);
    console.log('Restaurant ID from params:', req.params.restaurantId);
    console.log('==================');
    
    // Add restaurantId from URL params to body for controller
    req.body.restaurantId = req.params.restaurantId;
    next();
  },
  addDish
);

// Get dishes by restaurant ID (owner only - to manage their dishes)
// GET /api/dishes/restaurants/:restaurantId
router.get(
  '/restaurants/:restaurantId',
  getDishesByRestaurant
);

// Update dish by dish ID
// PUT /api/dishes/:dishId
router.put(
  '/:dishId',
  debugRequest,
  authMiddleware,
  ownerMiddleware,
  upload.single('image'), // Optional image update
  (req, res, next) => {
    console.log('=== AFTER MULTER (UPDATE) ===');
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);
    console.log('Dish ID from params:', req.params.dishId);
    console.log('============================');
    next();
  },
  updateDish
);

// Delete dish by dish ID
// DELETE /api/dishes/:dishId
router.delete(
  '/:dishId',
  authMiddleware,
  ownerMiddleware,
  deleteDish
);

// Toggle dish availability
// PATCH /api/dishes/:dishId/availability
router.patch(
  '/:dishId/availability',
  authMiddleware,
  ownerMiddleware,
  toggleDishAvailability
);

module.exports = router;