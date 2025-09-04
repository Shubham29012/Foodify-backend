const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateOTP, getExpiryTime } = require('../utils/otp');
const { sendEmail } = require('../utils/sendEmail');

const JWT_SECRET = process.env.JWT_SECRET || "supersecurekey";

// Register Delivery Partner
exports.registerDeliveryPartner = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "Delivery Partner already registered & verified" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    let user;
    if (existingUser) {
      existingUser.otp = otp;
      existingUser.otpExpiresAt = getExpiryTime();
      existingUser.role = "delivery_partner";
      await existingUser.save();
      user = existingUser;
    } else {
      user = new User({
        name,
        email,
        phone,
        passwordHash: hashedPassword,
        role: "delivery_partner",
        otp,
        otpExpiresAt: getExpiryTime()
      });
      await user.save();
    }

    await sendEmail(email, "Delivery Partner Registration OTP", `Your OTP is: ${otp}`);
    res.status(200).json({ message: "OTP sent to your email" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify Delivery Partner Registration OTP
exports.verifyDeliveryPartnerOTP = async (req, res) => {
  try {
    const { emailOrPhone, otp } = req.body;

    const user = await User.findOne({ 
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      role: "delivery_partner"
    });
    if (!user) return res.status(400).json({ message: "Delivery Partner not found" });

    if (user.otp !== otp || new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = jwt.sign({ id: user._id, role: "delivery_partner" }, JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ message: "Delivery Partner registered & verified", token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login (Generate OTP)
exports.loginDeliveryPartner = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    const user = await User.findOne({ 
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      role: "delivery_partner"
    });
    if (!user || !user.isVerified) {
      return res.status(400).json({ message: "Delivery Partner not found or not verified" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiresAt = getExpiryTime();
    await user.save();

    await sendEmail(user.email, "Delivery Partner Login OTP", `Your OTP is: ${otp}`);
    res.status(200).json({ message: "Login OTP sent to your email" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify Login OTP
exports.verifyDeliveryPartnerLoginOTP = async (req, res) => {
  try {
    const { emailOrPhone, otp } = req.body;

    const user = await User.findOne({ 
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      role: "delivery_partner"
    });
    if (!user) return res.status(400).json({ message: "Delivery Partner not found" });

    if (user.otp !== otp || new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = jwt.sign({ id: user._id, role: "delivery_partner" }, JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({
      message: "Delivery Partner login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: "delivery_partner"
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
