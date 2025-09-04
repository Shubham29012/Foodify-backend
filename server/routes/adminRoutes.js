const express = require('express');
const router = express.Router();
const controller = require('../controllers/adminController');

router.post('/login', controller.adminLogin);
router.post('/verify-login-otp', controller.verifyAdminLoginOTP);

module.exports = router;
