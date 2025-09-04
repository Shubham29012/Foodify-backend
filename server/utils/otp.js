// utils/otp.js

// Generate a 6-digit OTP
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Set OTP expiry (5 minutes)
exports.getExpiryTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 5);
  return now;
};
