// controllers/customerController.js
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateOTP, getExpiryTime } = require('../utils/otp');
const { sendEmail } = require('../utils/sendEmail');

const JWT_SECRET = process.env.JWT_SECRET || "supersecurekey";

// ====================== REGISTER CUSTOMER ======================
exports.registerCustomer = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "Customer already registered & verified" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    let user;
    if (existingUser) {
      existingUser.otp = otp;
      existingUser.otpExpiresAt = getExpiryTime();
      existingUser.role = "customer";
      await existingUser.save();
      user = existingUser;
    } else {
      user = new User({
        name,
        email,
        phone,
        passwordHash: hashedPassword,
        role: "customer",
        otp,
        otpExpiresAt: getExpiryTime()
      });
      await user.save();
    }

    await sendEmail(email, "Customer Registration OTP", `Your OTP is: ${otp}`);
    res.status(200).json({ message: "OTP sent to your email" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================== VERIFY CUSTOMER OTP ======================
exports.verifyCustomerOTP = async (req, res) => {
  try {
    const { emailOrPhone, otp } = req.body;

    const user = await User.findOne({ 
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      role: "customer"
    });
    if (!user) return res.status(400).json({ message: "Customer not found" });

    if (user.otp !== otp || new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = jwt.sign({ id: user._id, role: "customer" }, JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ message: "Customer registered & verified", token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================== LOGIN CUSTOMER (Generate OTP) ======================
// exports.loginCustomer = async (req, res) => {
//   try {
//     const { emailOrPhone, password } = req.body;

//     const user = await User.findOne({ 
//       $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
//       role: "customer"
//     });
//     if (!user || !user.isVerified) {
//       return res.status(400).json({ message: "Customer not found or not verified" });
//     }

//     const isMatch = await bcrypt.compare(password, user.passwordHash);
//     if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

//     const otp = generateOTP();
//     user.otp = otp;
//     user.otpExpiresAt = getExpiryTime();
//     await user.save();

//     await sendEmail(user.email, "Customer Login OTP", `Your OTP is: ${otp}`);
//     res.status(200).json({ message: "Login OTP sent to your email" });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ====================== VERIFY CUSTOMER LOGIN OTP ======================
// exports.verifyCustomerLoginOTP = async (req, res) => {
//   try {
//     const { emailOrPhone, otp } = req.body;

//     const user = await User.findOne({ 
//       $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
//       role: "customer"
//     });
//     if (!user) return res.status(400).json({ message: "Customer not found" });

//     if (user.otp !== otp || new Date() > user.otpExpiresAt) {
//       return res.status(400).json({ message: "Invalid or expired OTP" });
//     }

//     user.otp = null;
//     user.otpExpiresAt = null;
//     await user.save();

//     const token = jwt.sign({ id: user._id, role: "customer" }, JWT_SECRET, { expiresIn: '24h' });

//     res.status(200).json({
//       message: "Customer login successful",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//         role: "customer"
//       }
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

exports.loginCustomer = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      role: "customer"
    });

    if (!user || !user.isVerified) {
      return res.status(400).json({ message: "Customer not found or not verified" });
    }

    // If user has a password, verify it
    if (user.passwordHash) {
      if (!password) {
        return res.status(400).json({ message: "Password is required for this account" });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
    }

    // Generate OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiresAt = getExpiryTime();
    await user.save();

    // Send OTP to email
    await sendEmail(user.email, "Customer Login OTP", `Your OTP is: ${otp}`);

    res.status(200).json({ message: "Login OTP sent to your email" });

  } catch (err) {
    console.error("Login Customer Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================== VERIFY CUSTOMER LOGIN OTP ======================
exports.verifyCustomerLoginOTP = async (req, res) => {
  try {
    const { emailOrPhone, otp } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      role: "customer"
    });

    if (!user) {
      return res.status(400).json({ message: "Customer not found" });
    }

    if (user.otp !== otp || new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: "customer" }, JWT_SECRET, { expiresIn: "24h" });

    res.status(200).json({
      message: "Customer login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: "customer"
      }
    });

  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};