// routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Register
router.post('/register', customerController.registerCustomer);

// Verify Register OTP
router.post('/verify-otp', customerController.verifyCustomerOTP);

// Login (Generate OTP)
router.post('/login', customerController.loginCustomer);

// Verify Login OTP
router.post('/verify-login-otp', customerController.verifyCustomerLoginOTP);

module.exports = router;
