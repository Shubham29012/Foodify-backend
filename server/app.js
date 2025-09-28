// // server.js
// const express = require('express');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const connectDb = require('./db/connection');
// const userRoutes = require('./routes/userRoute');
// const dishRoutes = require('./routes/dishRoute');

// const cors = require('cors');

// dotenv.config();

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json()); // Parse JSON requests

// // Connect to DB
// connectDb();

// // Routes
// app.get('/', (req, res) => {
//   res.send('API is running...');
// });

// app.use('/api/users', userRoutes); // User routes
// app.use('/api/dishes', dishRoutes);//dish Routes

// // Handle 404
// app.use((req, res) => {
//   res.status(404).json({ message: 'Route not found' });
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: 'Server error' });
// });

// // Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// server.js
// Load environment variables FIRST, before any other imports
// Load environment variables FIRST, before any other imports
// require('dotenv').config();

// const express = require('express');
// const mongoose = require('mongoose');
// const multer = require('multer');
// const connectDb = require('./db/connection');
// const userRoutes = require('./routes/userRoute');
// const dishRoutes = require('./routes/dishRoute');
// const restaurantRoutes = require('./routes/restaurantRoute');
// const reviewRoutes = require('./routes/reviewRoute');
// const cors = require('cors');

// const app = express();

// // Debug environment variables
// // console.log('=== ENVIRONMENT CHECK ===');
// // console.log('NODE_ENV:', process.env.NODE_ENV);
// // console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing');
// // console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing');
// // console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing');
// // console.log('========================');

// // Middleware
// app.use(cors());

// // Connect to DB
// connectDb();

// // Routes
// app.get('/', (req, res) => {
//   res.json({ 
//     message: 'Food App API is running!',
//     version: '1.0.0',
//     endpoints: {
//       users: '/api/users',
//       restaurants: '/api/restaurants',
//       dishes: '/api/dishes'
//     }
//   });
// });

// // API Routes - Mount routes without express.json() for file uploads
// app.use('/api/restaurants', restaurantRoutes);
// app.use('/api/dishes', dishRoutes);
// app.use('/api/reviews', reviewRoutes);

// // Mount user routes with JSON parsing middleware
// app.use('/api/users', express.json(), userRoutes);

// // Handle 404
// app.use((req, res) => {
//   res.status(404).json({ 
//     message: 'Route not found',
//     availableRoutes: [
//       'GET /',
//       'POST /api/users/register',
//       'POST /api/users/login', 
//       'GET /api/restaurants',
//       'POST /api/restaurants',
//       'GET /api/dishes/:restaurantId',
//       'POST /api/dishes/add',
//       'POST /api/reviews/add',
//     ]
//   });
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error('Global error handler:', err);
  
//   if (err instanceof multer.MulterError) {
//     if (err.code === 'LIMIT_FILE_SIZE') {
//       return res.status(400).json({ message: 'File too large (max 5MB)' });
//     }
//     if (err.code === 'LIMIT_UNEXPECTED_FILE') {
//       return res.status(400).json({ message: 'Unexpected field name' });
//     }
//   }
  
//   res.status(500).json({ 
//     message: 'Server error',
//     error: process.env.NODE_ENV === 'development' ? err.message : undefined
//   });
// });

// // Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`Server is running on port ${PORT}`);
//   console.log(`API Documentation:`);
//   console.log(`- Users: http://localhost:${PORT}/api/users`);
//   console.log(`- Restaurants: http://localhost:${PORT}/api/restaurants`);
//   console.log(`- Dishes: http://localhost:${PORT}/api/dishes`);
// });
// require('dotenv').config();

// const express = require('express');
// const mongoose = require('mongoose');
// const multer = require('multer');
// const cors = require('cors');
// const connectDb = require('./db/connection');

// // Routes
// const userRoutes = require('./routes/userRoute');
// const dishRoutes = require('./routes/dishRoute');
// const restaurantRoutes = require('./routes/restaurantRoute');
// const reviewRoutes = require('./routes/reviewRoute');
// const customerRoutes = require('./routes/customerRoutes'); 

// const app = express();

// // ─────────────────────────────
// // Middleware
// // ─────────────────────────────
// app.use(cors());
// app.use(express.json()); // Global JSON parser unless a specific route overrides it

// // ─────────────────────────────
// // Database Connection
// // ─────────────────────────────
// connectDb();

// // ─────────────────────────────
// // Health Check Endpoint
// // ─────────────────────────────
// app.get('/', (req, res) => {
//   res.json({
//     message: 'Food App API is running!',
//     version: '1.0.0',
//     endpoints: {
//       users: '/api/users',
//       restaurants: '/api/restaurants',
//       dishes: '/api/dishes',
//       reviews: '/api/reviews',
//     }
//   });
// });

// // ─────────────────────────────
// // API Routes
// // ─────────────────────────────
// app.use('/api/users', userRoutes);
// // app.use('/api/restaurants', restaurantRoutes);
// // app.use('/api/dishes', dishRoutes);
// app.use('/api/reviews', reviewRoutes);
// app.use('/api/customers', customerRoutes);

// // ─────────────────────────────
// // 404 Handler
// // ─────────────────────────────
// app.use((req, res) => {
//   res.status(404).json({
//     message: 'Route not found',
//     availableRoutes: [
//       'GET /',
//       'POST /api/users/register',
//       'POST /api/users/login',
//       'POST /api/users/verify-otp',
//       'GET /api/restaurants',
//       'POST /api/restaurants',
//       'GET /api/dishes/:restaurantId',
//       'POST /api/dishes/add',
//       'POST /api/reviews/add',
//     ]
//   });
// });

// // ─────────────────────────────
// // Global Error Handler
// // ─────────────────────────────
// app.use((err, req, res, next) => {
//   console.error('Global error handler:', err);

//   if (err instanceof multer.MulterError) {
//     if (err.code === 'LIMIT_FILE_SIZE') {
//       return res.status(400).json({ message: 'File too large (max 5MB)' });
//     }
//     if (err.code === 'LIMIT_UNEXPECTED_FILE') {
//       return res.status(400).json({ message: 'Unexpected field name' });
//     }
//   }

//   res.status(500).json({
//     message: 'Server error',
//     error: process.env.NODE_ENV === 'development' ? err.message : undefined
//   });
// });

// // ─────────────────────────────
// // Server Startup
// // ─────────────────────────────
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`🚀 Server is running on port ${PORT}`);
//   console.log(`📌 API Documentation:`);
//   console.log(`   - Users: http://localhost:${PORT}/api/users`);
//   console.log(`   - Restaurants: http://localhost:${PORT}/api/restaurants`);
//   console.log(`   - Dishes: http://localhost:${PORT}/api/dishes`);
//   console.log(`   - Reviews: http://localhost:${PORT}/api/reviews`);
// });

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const connectDb = require('./db/connection');

// Routes
const userRoutes = require('./routes/userRoute');
const dishRoutes = require('./routes/dishRoute');
const restaurantRoutes = require('./routes/restaurantRoute');
const restaurantOwnerRoutes = require('./routes/restaurantOwnerRoutes');
const reviewRoutes = require('./routes/reviewRoute');
const customerRoutes = require('./routes/customerRoutes');
const adminRoutes=require('./routes/adminRoutes');
// const orderRoutes=require('./routes/orderRoutes');


const app = express();

// ─────────────────────────────
// Middleware
// ─────────────────────────────
app.use(cors());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
// Global JSON parser unless a specific route overrides it

// ─────────────────────────────
// Database Connection
// ─────────────────────────────
connectDb();

// ─────────────────────────────
// Health Check Endpoint
// ─────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: 'Food App API is running!',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      customers: '/api/customers',
      'restaurant-owners': '/api/restaurant-owner',
      restaurants: '/api/restaurants',
      dishes: '/api/dishes',
      reviews: '/api/reviews',
    }
  });
});
app.set('trust proxy', true); 

// ─────────────────────────────
// API Routes
// ─────────────────────────────
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/restaurant-owner', restaurantOwnerRoutes);
app.use('/api/restaurants', restaurantRoutes);

app.use('/api/reviews', reviewRoutes);
app.use('/api/admin',adminRoutes);
app.use('/api/dishes', dishRoutes);
// app.use('/api/orders',orderRoutes);


// ─────────────────────────────
// 404 Handler
// ─────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    availableRoutes: [
      'GET /',
      // User routes
      'POST /api/users/register',
      'POST /api/users/login',
      'POST /api/users/verify-otp',
      // Customer routes
      'POST /api/customers/register',
      'POST /api/customers/login',
      // Restaurant Owner routes
      'POST /api/restaurant-owner/register',
      'POST /api/restaurant-owner/login',
      'POST /api/restaurant-owner/verify-otp',
      'POST /api/restaurant-owner/verify-login-otp',
      'GET /api/restaurant-owner/restaurants',
      'POST /api/restaurant-owner/restaurants',
      'PUT /api/restaurant-owner/restaurants/:id',
      'DELETE /api/restaurant-owner/restaurants/:id',
      // Public restaurant routes
      'GET /api/restaurants',
      'GET /api/restaurants/search',
      'GET /api/restaurants/search/location',
      'GET /api/restaurants/:id',
      // Dish routes
      'GET /api/dishes/:restaurantId',
      'POST /api/dishes/add',
      // Review routes
      'POST /api/reviews/add',
    ]
  });
});

// ─────────────────────────────
// Global Error Handler
// ─────────────────────────────
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large (max 5MB)' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected field name' });
    }
  }

  res.status(500).json({
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ─────────────────────────────
// Server Startup
// ─────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📌 API Documentation:`);
  console.log(`   - Users: http://localhost:${PORT}/api/users`);
  console.log(`   - Customers: http://localhost:${PORT}/api/customers`);
  console.log(`   - Restaurant Owners: http://localhost:${PORT}/api/restaurant-owner`);
  console.log(`   - Restaurants (Public): http://localhost:${PORT}/api/restaurants`);
  console.log(`   - Dishes: http://localhost:${PORT}/api/dishes`);
  console.log(`   - Reviews: http://localhost:${PORT}/api/reviews`);
});