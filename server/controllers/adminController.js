const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { generateOTP, getExpiryTime } = require('../utils/otp');
const { sendEmail } = require('../utils/sendEmail');

const JWT_SECRET = process.env.JWT_SECRET || "supersecurekey";

// Send Login OTP to Admin Email
exports.adminLogin = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, role: "admin" });
    if (!user) return res.status(400).json({ message: "Admin not found" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiresAt = getExpiryTime();
    await user.save();

    await sendEmail(email, "Admin Login OTP", `Your OTP is: ${otp}`);
    res.status(200).json({ message: "Login OTP sent to admin email" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify Admin Login OTP
exports.verifyAdminLoginOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email, role: "admin" });
    if (!user) return res.status(400).json({ message: "Admin not found" });

    if (user.otp !== otp || new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = jwt.sign({ id: user._id, role: "admin" }, JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({
      message: "Admin login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: "admin"
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
