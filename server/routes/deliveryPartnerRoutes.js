const express = require('express');
const router = express.Router();
const controller = require('../controllers/deliveryPartnerController');

router.post('/register', controller.registerDeliveryPartner);
router.post('/verify-otp', controller.verifyDeliveryPartnerOTP);
router.post('/login', controller.loginDeliveryPartner);
router.post('/verify-login-otp', controller.verifyDeliveryPartnerLoginOTP);

module.exports = router;
