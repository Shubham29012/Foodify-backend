// controllers/userController.js
const User = require('../models/user');
const Dish = require("../models/dish");
const Order=require("../models/order");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateOTP, getExpiryTime } = require('../utils/otp');
const { sendEmail } = require('../utils/sendEmail');
// const { sendSMS } = require('../utils/sendSMS'); // Twilio disabled

const JWT_SECRET = process.env.JWT_SECRET || "supersecurekey";

// ====================== REGISTER ======================
exports.registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role, otpMethod } = req.body;

    // Check if already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser && existingUser.isVerified)
      return res.status(400).json({ message: "User already registered & verified" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    let user;
    if (existingUser) {
      existingUser.otp = otp;
      existingUser.otpExpiresAt = getExpiryTime();
      await existingUser.save();
      user = existingUser;
    } else {
      user = new User({
        name,
        email,
        phone,
        passwordHash: hashedPassword,
        role,
        otp,
        otpExpiresAt: getExpiryTime()
      });
      await user.save();
    }

    // Send OTP
    if (otpMethod === "email") {
      await sendEmail(email, "Your Registration OTP", `Your OTP is: ${otp}`);
    } 
    // else if (otpMethod === "sms") {
    //   // Twilio disabled: for now, just log OTP to console
    //   console.log(`(DEBUG) Registration OTP for ${phone}: ${otp}`);
    // } 
    else {
      return res.status(400).json({ message: "Invalid OTP method" });
    }

    res.status(200).json({ message: `OTP sent to your ${otpMethod}` });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================== VERIFY REGISTER OTP ======================
exports.verifyOTP = async (req, res) => {
  try {
    const { emailOrPhone, otp } = req.body;

    const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.otp !== otp || new Date() > user.otpExpiresAt)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    res.status(200).json({ message: "Account verified & registered", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================== LOGIN (Generate OTP) ======================
// exports.loginUser = async (req, res) => {
//   try {
//     const { emailOrPhone, password, otpMethod } = req.body;

//     const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
//     if (!user || !user.isVerified)
//       return res.status(400).json({ message: "User not found or not verified" });

//     const isMatch = await bcrypt.compare(password, user.passwordHash);
//     if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

//     const otp = generateOTP();
//     user.otp = otp;
//     user.otpExpiresAt = getExpiryTime();
//     await user.save();

//     if (otpMethod === "email") {
//       await sendEmail(user.email, "Your Login OTP", `Your OTP is: ${otp}`);
//     } 
//     // else if (otpMethod === "sms") {
//     //   // Twilio disabled: log OTP to console
//     //   console.log(`(DEBUG) Login OTP for ${user.phone}: ${otp}`);
//     // } 
//     else {
//       return res.status(400).json({ message: "Invalid OTP method" });
//     }

//     res.status(200).json({ message: `Login OTP sent to your ${otpMethod}` });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // ====================== VERIFY LOGIN OTP ======================
// exports.verifyLoginOTP = async (req, res) => {
//   try {
//     const { emailOrPhone, otp } = req.body;

//     const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
//     if (!user) return res.status(400).json({ message: "User not found" });

//     if (user.otp !== otp || new Date() > user.otpExpiresAt)
//       return res.status(400).json({ message: "Invalid or expired OTP" });

//     user.otp = null;
//     user.otpExpiresAt = null;
//     await user.save();

//     const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

//     res.status(200).json({
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//         role: user.role
//       }
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
exports.loginUser = async (req, res) => {
  try {
    const { emailOrPhone, password, otpMethod } = req.body;

    const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
    if (!user || !user.isVerified)
      return res.status(400).json({ message: "User not found or not verified" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiresAt = getExpiryTime();
    await user.save();

    // Send OTP via chosen method
    if (otpMethod === "email") {
      await sendEmail(user.email, "Your Login OTP", `Your OTP is: ${otp}`);
    } else if (otpMethod === "sms") {
      // Twilio disabled for now: log OTP to console
      console.log(`(DEBUG) Login OTP for ${user.phone}: ${otp}`);
    } else {
      return res.status(400).json({ message: "Invalid OTP method" });
    }

    // ✅ Return minimal info; token not generated until OTP verification
    res.status(200).json({ 
      message: `Login OTP sent to your ${otpMethod}`,
      userId: user._id 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- OTP Verification ----------------
exports.verifyLoginOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check OTP validity
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // ✅ Generate JWT token after successful OTP verification
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Clear OTP fields
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.status(200).json({ 
      message: "Login successful",
      userId: user._id,
      token 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

// ====================== GET ALL CUSTOMERS ======================
exports.getAllUserDetails = async (req, res) => {
  try {
    // Fetch only customers (role = "user")
    const customers = await User.find({ role: "customer" }).select("-passwordHash -otp -otpExpiresAt");

    if (!customers || customers.length === 0) {
      return res.status(404).json({ message: "No customers found" });
    }

    res.status(200).json({
      message: "Customer details fetched successfully",
      count: customers.length,
      customers
    });
  } catch (err) {
    console.error("Error fetching customers:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Add favourite restaurant
exports.addFavouritesRestaurant = async (req, res) => {
  try {
    const userId = req.user._id; // ✅ from auth
    const { restaurantId } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ message: "RestaurantId is required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favouriteRestaurants: restaurantId } },
      { new: true }
    ).populate("favouriteRestaurants favouriteDishes");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Restaurant added to favourites successfully",
      favourites: user.favouriteRestaurants,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error adding restaurant to favourites", error: error.message });
  }
};

exports.getFavouriteRestaurants = async (req, res) => {
  try {
    const userId = req.user._id; // ✅ from auth

    const user = await User.findById(userId).populate("favouriteRestaurants");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Favourite restaurants fetched successfully",
      favourites: user.favouriteRestaurants,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching favourite restaurants", error: error.message });
  }
};
exports.isRestaurantFavourite = async (req, res) => {
  try {
    const userId = req.user._id;
    const { restaurantId } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant Id is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFavourite = user.favouriteRestaurants.includes(restaurantId);

    return res.status(200).json({
      message: isFavourite
        ? "Restaurant is in favourites"
        : "Restaurant is not in favourites",
      isFavourite,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error checking favourite restaurant", error: error.message });
  }
};


exports.addFavouritesDish = async (req, res) => {
  try {
    const userId = req.user._id; // ✅ from auth
    const { restaurantId, dishId } = req.body;

    if (!restaurantId || !dishId) {
      return res.status(400).json({ message: "restaurantId and dishId are required" });
    }

    const dish = await Dish.findById(dishId);
    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }

    if (dish.restaurantId.toString() !== restaurantId) {
      return res.status(400).json({ message: "This dish does not belong to the given restaurant" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favouriteDishes: dishId } },
      { new: true }
    ).populate("favouriteRestaurants favouriteDishes");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Dish added to favourites successfully",
      favourites: user.favouriteDishes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error adding dish to favourites", error: error.message });
  }
};

exports.getFavouriteDishes = async (req, res) => {
  try {
    const userId = req.user._id; // ✅ from auth

    const user = await User.findById(userId).populate("favouriteDishes");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Favourite dishes fetched successfully",
      favourites: user.favouriteDishes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching favourite dishes", error: error.message });
  }
};
exports.isDishFavourite = async (req, res) => {
  try {
    const userId = req.user._id;
    const { dishId } = req.body;

    if (!dishId) {
      return res.status(400).json({ message: "Dish Id is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFavourite = user.favouriteDishes.includes(dishId);

    return res.status(200).json({
      message: isFavourite
        ? "Dish is in favourites"
        : "Dish is not in favourites",
      isFavourite,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error checking favourite dish",
      error: error.message,
    });
  }
};


// Remove favourite restaurant
exports.removeFavouriteRestaurant = async (req, res) => {
  try {
    const { userId, restaurantId } = req.body;

    if (!userId || !restaurantId) {
      return res.status(400).json({ message: "userId and restaurantId are required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { favouriteRestaurants: restaurantId } }, // remove restaurantId from array
      { new: true }
    ).populate("favouriteRestaurants favouriteDishes");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Restaurant removed from favourites successfully",
      favourites: user.favouriteRestaurants,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to remove restaurant from favourites", error: error.message });
  }
};
exports.removeFavouriteDish = async (req, res) => {
  try {
    const { userId, dishId } = req.body;

    if (!userId || !dishId) {
      return res.status(400).json({ message: "userId and dishId are required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { favouriteDishes: dishId } }, // remove dishId from array
      { new: true }
    ).populate("favouriteRestaurants favouriteDishes");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Dish removed from favourites successfully",
      favourites: user.favouriteDishes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to remove dish from favourites", error: error.message });
  }
};
// 🛒 Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user._id; // ✅ take from auth middleware
    const { restaurantId, dishId, quantity = 1 } = req.body;

    if (!restaurantId || !dishId) {
      return res
        .status(400)
        .json({ message: "Restaurant ID and Dish ID are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // check if item already exists in cart
    const existingItem = user.cart.find(
      (item) =>
        item.restaurantId.toString() === restaurantId &&
        item.dishId.toString() === dishId
    );

    if (existingItem) {
      existingItem.quantity += quantity; // increase quantity
    } else {
      user.cart.push({ restaurantId, dishId, quantity });
    }

    await user.save();
    res.status(200).json({ message: "Item added to cart", cart: user.cart });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error adding to cart", error: error.message });
  }
};

// 🛒 Get all items from cart
exports.getItemsFromCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate({
      path: "cart.dishId",
      select: "name price image", // ✅ populate dish details
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ cart: user.cart });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching cart", error: error.message });
  }
};

// 🛒 Update item quantity
exports.updateCartQuantity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { dishId, quantity } = req.body;

    if (!dishId || typeof quantity !== "number") {
      return res.status(400).json({ message: "Dish ID and valid quantity required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const cartItem = user.cart.find(
      (item) => item.dishId.toString() === dishId
    );

    if (!cartItem) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    if (quantity <= 0) {
      // remove if quantity <= 0
      user.cart = user.cart.filter((item) => item.dishId.toString() !== dishId);
    } else {
      cartItem.quantity = quantity;
    }

    await user.save();
    res.status(200).json({ message: "Cart updated", cart: user.cart });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error updating cart", error: error.message });
  }
};

// 🛒 Remove single item
exports.removeCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { dishId } = req.body;

    if (!dishId) {
      return res.status(400).json({ message: "Dish ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.cart = user.cart.filter((item) => item.dishId.toString() !== dishId);

    await user.save();
    res.status(200).json({ message: "Item removed from cart", cart: user.cart });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error removing item", error: error.message });
  }
};

// 🛒 Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.cart = []; // clear all items
    await user.save();

    res.status(200).json({ message: "Cart cleared", cart: user.cart });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error clearing cart", error: error.message });
  }
};
