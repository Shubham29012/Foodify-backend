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
exports.requestPasswordReset = async (req, res) => {
  try {
    const { emailOrPhone } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      role: "customer",
      isVerified: true
    });

    // For security: respond the same even if not found
    if (!user) {
      return res.status(200).json({ message: "If the account exists, we've sent an OTP to the registered email." });
    }

    const otp = generateOTP();
    user.resetOtp = otp;
    user.resetOtpExpiresAt = getExpiryTime(); // e.g., 10 mins
    await user.save();

    await sendEmail(user.email, "Password Reset OTP", `Your OTP is: ${otp}`);

    res.status(200).json({ message: "If the account exists, we've sent an OTP to the registered email." });
  } catch (err) {
    console.error("requestPasswordReset error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Forgot Password: Verify OTP -> returns short-lived resetToken
 * Body: { emailOrPhone, otp }
 */
exports.verifyPasswordResetOTP = async (req, res) => {
  try {
    const { emailOrPhone, otp } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      role: "customer",
      isVerified: true
    });
    if (!user) return res.status(400).json({ message: "Invalid request" });

    if (!user.resetOtp || !user.resetOtpExpiresAt || user.resetOtp !== otp || new Date() > user.resetOtpExpiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Invalidate the OTP and issue a short-lived reset token (15 min)
    user.resetOtp = null;
    user.resetOtpExpiresAt = null;
    await user.save();

    const resetToken = jwt.sign({ id: user._id, purpose: "password_reset" }, JWT_SECRET, { expiresIn: "15m" });

    res.status(200).json({ message: "OTP verified", resetToken });
  } catch (err) {
    console.error("verifyPasswordResetOTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Forgot Password: Set new password using resetToken
 * Body: { resetToken, newPassword }
 */
exports.resetPasswordWithToken = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ message: "resetToken and newPassword are required" });
    }

    let payload;
    try {
      payload = jwt.verify(resetToken, JWT_SECRET);
    } catch {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    if (payload.purpose !== "password_reset") {
      return res.status(400).json({ message: "Invalid token purpose" });
    }

    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("resetPasswordWithToken error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Change Password (authenticated)
 * Body: { currentPassword, newPassword }
 * Headers: Authorization: Bearer <token>
 */
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "currentPassword and newPassword are required" });
    }

    const user = await User.findById(userId);
    if (!user?.passwordHash) {
      return res.status(400).json({ message: "Password change not allowed for this account" });
    }

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return res.status(400).json({ message: "Current password is incorrect" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("changePassword error:", err);
    res.status(500).json({ message: "Server error" });
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
