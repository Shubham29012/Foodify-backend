// // const User = require('../models/user');
// // const bcrypt = require('bcrypt');
// // const jwt = require('jsonwebtoken');
// // const { generateOTP, getExpiryTime } = require('../utils/otp');
// // const { sendEmail } = require('../utils/sendEmail');

// // const JWT_SECRET = process.env.JWT_SECRET || "supersecurekey";

// // // Register Restaurant Owner
// // exports.registerRestaurantOwner = async (req, res) => {
// //   try {
// //     const { name, email, phone, password } = req.body;

// //     const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
// //     if (existingUser && existingUser.isVerified) {
// //       return res.status(400).json({ message: "Restaurant Owner already registered & verified" });
// //     }

// //     const hashedPassword = await bcrypt.hash(password, 10);
// //     const otp = generateOTP();

// //     let user;
// //     if (existingUser) {
// //       existingUser.otp = otp;
// //       existingUser.otpExpiresAt = getExpiryTime();
// //       existingUser.role = "restaurant_owner";
// //       await existingUser.save();
// //       user = existingUser;
// //     } else {
// //       user = new User({
// //         name,
// //         email,
// //         phone,
// //         passwordHash: hashedPassword,
// //         role: "restaurant_owner",
// //         otp,
// //         otpExpiresAt: getExpiryTime()
// //       });
// //       await user.save();
// //     }

// //     await sendEmail(email, "Restaurant Owner Registration OTP", `Your OTP is: ${otp}`);
// //     res.status(200).json({ message: "OTP sent to your email" });

// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };

// // // Verify Restaurant Owner Registration OTP
// // exports.verifyRestaurantOwnerOTP = async (req, res) => {
// //   try {
// //     const { emailOrPhone, otp } = req.body;

// //     const user = await User.findOne({ 
// //       $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
// //       role: "restaurant_owner"
// //     });
// //     if (!user) return res.status(400).json({ message: "Restaurant Owner not found" });

// //     if (user.otp !== otp || new Date() > user.otpExpiresAt) {
// //       return res.status(400).json({ message: "Invalid or expired OTP" });
// //     }

// //     user.isVerified = true;
// //     user.otp = null;
// //     user.otpExpiresAt = null;
// //     await user.save();

// //     const token = jwt.sign({ id: user._id, role: "restaurant_owner" }, JWT_SECRET, { expiresIn: '24h' });
// //     res.status(200).json({ message: "Restaurant Owner registered & verified", token });

// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };

// // // Login (Generate OTP)
// // exports.loginRestaurantOwner = async (req, res) => {
// //   try {
// //     const { emailOrPhone, password } = req.body;

// //     const user = await User.findOne({ 
// //       $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
// //       role: "restaurant_owner"
// //     });
// //     if (!user || !user.isVerified) {
// //       return res.status(400).json({ message: "Restaurant Owner not found or not verified" });
// //     }

// //     const isMatch = await bcrypt.compare(password, user.passwordHash);
// //     if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

// //     const otp = generateOTP();
// //     user.otp = otp;
// //     user.otpExpiresAt = getExpiryTime();
// //     await user.save();

// //     await sendEmail(user.email, "Restaurant Owner Login OTP", `Your OTP is: ${otp}`);
// //     res.status(200).json({ message: "Login OTP sent to your email" });

// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };

// // // Verify Login OTP
// // exports.verifyRestaurantOwnerLoginOTP = async (req, res) => {
// //   try {
// //     const { emailOrPhone, otp } = req.body;

// //     const user = await User.findOne({ 
// //       $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
// //       role: "restaurant_owner"
// //     });
// //     if (!user) return res.status(400).json({ message: "Restaurant Owner not found" });

// //     if (user.otp !== otp || new Date() > user.otpExpiresAt) {
// //       return res.status(400).json({ message: "Invalid or expired OTP" });
// //     }

// //     user.otp = null;
// //     user.otpExpiresAt = null;
// //     await user.save();

// //     const token = jwt.sign({ id: user._id, role: "restaurant_owner" }, JWT_SECRET, { expiresIn: '24h' });
// //     res.status(200).json({
// //       message: "Restaurant Owner login successful",
// //       token,
// //       user: {
// //         id: user._id,
// //         name: user.name,
// //         email: user.email,
// //         phone: user.phone,
// //         role: "restaurant_owner"
// //       }
// //     });

// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };
// const Restaurant = require('../models/restaurant');
// const mongoose = require('mongoose');

// // Create a new restaurant (Restaurant Owner only)
// exports.createRestaurant = async (req, res) => {
//   try {
//     console.log("=== CREATE RESTAURANT DEBUG ===");
//     console.log("Body:", req.body);
//     console.log("Files:", req.files);
//     console.log("User ID:", req.user?.id);
//     console.log("===============================");

//     const {
//       name,
//       description,
//       address,
//       location,
//       cuisines,
//       averageCostForTwo,
//       timings,
//       isPureVeg,
//       isOpen,
//       deliveryTime,
//       tags,
//       tableBooking
//     } = req.body;

//     // Validate required fields
//     if (!name) {
//       return res.status(400).json({ message: "Restaurant name is required" });
//     }
//     if (!address) {
//       return res.status(400).json({ message: "Address is required" });
//     }

//     // Parse JSON fields if they're strings
//     let parsedLocation, parsedCuisines, parsedTags, parsedTableBooking;

//     try {
//       parsedLocation = location ? (typeof location === 'string' ? JSON.parse(location) : location) : undefined;
//       parsedCuisines = cuisines ? (typeof cuisines === 'string' ? JSON.parse(cuisines) : cuisines) : [];
//       parsedTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];
//       parsedTableBooking = tableBooking ? (typeof tableBooking === 'string' ? JSON.parse(tableBooking) : tableBooking) : undefined;
//     } catch (error) {
//       return res.status(400).json({ message: "Invalid JSON format in request data" });
//     }

//     // Handle file uploads
//     const logo = req.files?.logo?.[0]?.path;
//     const coverImage = req.files?.coverImage?.[0]?.path;

//     // Create restaurant object
//     const restaurantData = {
//       ownerId: req.user.id,
//       name,
//       description,
//       address,
//       averageCostForTwo: averageCostForTwo ? parseFloat(averageCostForTwo) : undefined,
//       timings,
//       isPureVeg: isPureVeg === 'true' || isPureVeg === true,
//       isOpen: isOpen !== 'false' && isOpen !== false, // Default to true
//       deliveryTime,
//       cuisines: parsedCuisines,
//       tags: parsedTags
//     };

//     // Add optional fields
//     if (logo) restaurantData.logo = logo;
//     if (coverImage) restaurantData.coverImage = coverImage;
//     if (parsedLocation) restaurantData.location = parsedLocation;
//     if (parsedTableBooking) restaurantData.tableBooking = parsedTableBooking;

//     const newRestaurant = new Restaurant(restaurantData);
//     const savedRestaurant = await newRestaurant.save();

//     console.log("Restaurant created successfully:", savedRestaurant._id);

//     res.status(201).json({
//       message: "Restaurant created successfully",
//       restaurant: savedRestaurant
//     });

//   } catch (error) {
//     console.error("Error creating restaurant:", error);
//     res.status(500).json({
//       message: "Server error",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Get restaurants by owner (Restaurant Owner only)
// exports.getMyRestaurants = async (req, res) => {
//   try {
//     const ownerId = req.user.id;
    
//     const restaurants = await Restaurant.find({ ownerId }).sort({ createdAt: -1 });

//     res.json({
//       restaurants,
//       count: restaurants.length
//     });

//   } catch (error) {
//     console.error("Error fetching owner restaurants:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Update restaurant (Restaurant Owner only)
// exports.updateRestaurant = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid restaurant ID" });
//     }

//     // Find restaurant and check ownership
//     const restaurant = await Restaurant.findById(id);
//     if (!restaurant) {
//       return res.status(404).json({ message: "Restaurant not found" });
//     }

//     if (restaurant.ownerId.toString() !== req.user.id) {
//       return res.status(403).json({ message: "Not authorized to update this restaurant" });
//     }

//     const {
//       name,
//       description,
//       address,
//       location,
//       cuisines,
//       averageCostForTwo,
//       timings,
//       isPureVeg,
//       isOpen,
//       deliveryTime,
//       tags,
//       tableBooking
//     } = req.body;

//     // Parse JSON fields
//     let updateData = { ...req.body };
    
//     try {
//       if (location && typeof location === 'string') {
//         updateData.location = JSON.parse(location);
//       }
//       if (cuisines && typeof cuisines === 'string') {
//         updateData.cuisines = JSON.parse(cuisines);
//       }
//       if (tags && typeof tags === 'string') {
//         updateData.tags = JSON.parse(tags);
//       }
//       if (tableBooking && typeof tableBooking === 'string') {
//         updateData.tableBooking = JSON.parse(tableBooking);
//       }
//     } catch (error) {
//       return res.status(400).json({ message: "Invalid JSON format in request data" });
//     }

//     // Handle file uploads
//     if (req.files?.logo?.[0]) {
//       updateData.logo = req.files.logo[0].path;
//     }
//     if (req.files?.coverImage?.[0]) {
//       updateData.coverImage = req.files.coverImage[0].path;
//     }

//     // Convert string booleans
//     if (isPureVeg !== undefined) {
//       updateData.isPureVeg = isPureVeg === 'true' || isPureVeg === true;
//     }
//     if (isOpen !== undefined) {
//       updateData.isOpen = isOpen === 'true' || isOpen === true;
//     }

//     // Convert numbers
//     if (averageCostForTwo) {
//       updateData.averageCostForTwo = parseFloat(averageCostForTwo);
//     }

//     const updatedRestaurant = await Restaurant.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     ).populate('ownerId', 'name email');

//     res.json({
//       message: "Restaurant updated successfully",
//       restaurant: updatedRestaurant
//     });

//   } catch (error) {
//     console.error("Error updating restaurant:", error);
//     res.status(500).json({
//       message: "Server error",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// // Delete restaurant (Restaurant Owner only)
// exports.deleteRestaurant = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid restaurant ID" });
//     }

//     const restaurant = await Restaurant.findById(id);
//     if (!restaurant) {
//       return res.status(404).json({ message: "Restaurant not found" });
//     }

//     // Check ownership
//     if (restaurant.ownerId.toString() !== req.user.id) {
//       return res.status(403).json({ message: "Not authorized to delete this restaurant" });
//     }

//     await Restaurant.findByIdAndDelete(id);

//     res.json({ message: "Restaurant deleted successfully" });

//   } catch (error) {
//     console.error("Error deleting restaurant:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Update restaurant status (open/close) (Restaurant Owner only)
// exports.updateRestaurantStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { isOpen } = req.body;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid restaurant ID" });
//     }

//     const restaurant = await Restaurant.findById(id);
//     if (!restaurant) {
//       return res.status(404).json({ message: "Restaurant not found" });
//     }

//     if (restaurant.ownerId.toString() !== req.user.id) {
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     restaurant.isOpen = isOpen;
//     await restaurant.save();

//     res.json({
//       message: `Restaurant ${isOpen ? 'opened' : 'closed'} successfully`,
//       restaurant: {
//         id: restaurant._id,
//         name: restaurant.name,
//         isOpen: restaurant.isOpen
//       }
//     });

//   } catch (error) {
//     console.error("Error updating restaurant status:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
const User = require('../models/user');
const Restaurant = require('../models/restaurant');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { generateOTP, getExpiryTime } = require('../utils/otp');
const { sendEmail } = require('../utils/sendEmail');

const JWT_SECRET = process.env.JWT_SECRET || "supersecurekey";

// Register Restaurant Owner
exports.registerRestaurantOwner = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: "Restaurant Owner already registered & verified" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    let user;
    if (existingUser) {
      existingUser.otp = otp;
      existingUser.otpExpiresAt = getExpiryTime();
      existingUser.role = "restaurant_owner";
      await existingUser.save();
      user = existingUser;
    } else {
      user = new User({
        name,
        email,
        phone,
        passwordHash: hashedPassword,
        role: "restaurant_owner",
        otp,
        otpExpiresAt: getExpiryTime()
      });
      await user.save();
    }

    await sendEmail(email, "Restaurant Owner Registration OTP", `Your OTP is: ${otp}`);
    res.status(200).json({ message: "OTP sent to your email" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify Restaurant Owner Registration OTP
exports.verifyRestaurantOwnerOTP = async (req, res) => {
  try {
    const { emailOrPhone, otp } = req.body;

    const user = await User.findOne({ 
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      role: "restaurant_owner"
    });
    if (!user) return res.status(400).json({ message: "Restaurant Owner not found" });

    if (user.otp !== otp || new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = jwt.sign({ id: user._id, role: "restaurant_owner" }, JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ message: "Restaurant Owner registered & verified", token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login (Generate OTP)
exports.loginRestaurantOwner = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({ message: "Email/Phone and password are required" });
    }

    // Make sure passwordHash is fetched (if select: false in schema)
    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      role: "restaurant_owner",
    }).select("+passwordHash");

    if (!user || !user.isVerified) {
      return res.status(400).json({ message: "Restaurant Owner not found or not verified" });
    }

    if (!user.passwordHash) {
      return res.status(400).json({ message: "No password set for this account" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiresAt = getExpiryTime();
    await user.save();

    await sendEmail(user.email, "Restaurant Owner Login OTP", `Your OTP is: ${otp}`);
    res.status(200).json({ message: "Login OTP sent to your email" });

  } catch (err) {
  console.error("Login error:", err);
  res.status(500).json({
    message: "Server error",
    error: err.message,   // shows actual error
    stack: err.stack      // optional: shows where it broke
  });
  }
};

exports.verifyRestaurantOwnerLoginOTP = async (req, res) => {
  try {
    const { emailOrPhone, otp } = req.body;

    if (!emailOrPhone || !otp) {
      return res.status(400).json({ message: "Email/Phone and OTP are required" });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      role: "restaurant_owner",
    });

    if (!user) {
      return res.status(400).json({ message: "Restaurant Owner not found" });
    }

    if (user.otp !== otp || new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: "restaurant_owner" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Restaurant Owner login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: "restaurant_owner",
      },
    });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new restaurant (Restaurant Owner only)
// exports.createRestaurant = async (req, res) => {
//   try {
//     console.log("=== CREATE RESTAURANT DEBUG ===");
//     console.log("Body:", req.body);
//     console.log("Files:", req.files);
//     console.log("User ID:", req.user?.id);
//     console.log("===============================");

//     const {
//       name,
//       description,
//       address,
//       location,
//       cuisines,
//       averageCostForTwo,
//       timings,
//       isPureVeg,
//       isOpen,
//       deliveryTime,
//       tags,
//       tableBooking
//     } = req.body;

//     // Validate required fields
//     if (!name) {
//       return res.status(400).json({ message: "Restaurant name is required" });
//     }
//     if (!address) {
//       return res.status(400).json({ message: "Address is required" });
//     }

//     // Parse JSON fields if they're strings
//     let parsedLocation, parsedCuisines, parsedTags, parsedTableBooking;

//     try {
//       parsedLocation = location ? (typeof location === 'string' ? JSON.parse(location) : location) : undefined;
//       parsedCuisines = cuisines ? (typeof cuisines === 'string' ? JSON.parse(cuisines) : cuisines) : [];
//       parsedTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];
//       parsedTableBooking = tableBooking ? (typeof tableBooking === 'string' ? JSON.parse(tableBooking) : tableBooking) : undefined;
//     } catch (error) {
//       return res.status(400).json({ message: "Invalid JSON format in request data" });
//     }

//     // Handle file uploads
//     const logo = req.files?.logo?.[0]?.path;
//     const coverImage = req.files?.coverImage?.[0]?.path;

//     // Create restaurant object
//     const restaurantData = {
//       ownerId: req.user.id,
//       name,
//       description,
//       address,
//       averageCostForTwo: averageCostForTwo ? parseFloat(averageCostForTwo) : undefined,
//       timings,
//       isPureVeg: isPureVeg === 'true' || isPureVeg === true,
//       isOpen: isOpen !== 'false' && isOpen !== false, // Default to true
//       deliveryTime,
//       cuisines: parsedCuisines,
//       tags: parsedTags
//     };

//     // Add optional fields
//     if (logo) restaurantData.logo = logo;
//     if (coverImage) restaurantData.coverImage = coverImage;
//     if (parsedLocation) restaurantData.location = parsedLocation;
//     if (parsedTableBooking) restaurantData.tableBooking = parsedTableBooking;

//     const newRestaurant = new Restaurant(restaurantData);
//     const savedRestaurant = await newRestaurant.save();

//     console.log("Restaurant created successfully:", savedRestaurant._id);

//     res.status(201).json({
//       message: "Restaurant created successfully",
//       restaurant: savedRestaurant
//     });

//   } catch (error) {
//     console.error("Error creating restaurant:", error);
//     res.status(500).json({
//       message: "Server error",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

exports.createRestaurant = async (req, res) => {
  try {
    console.log("=== CREATE RESTAURANT DEBUG ===");
    console.log("Body:", req.body);
    console.log("Files:", req.files);
    console.log("User ID:", req.user?.id);
    console.log("===============================");

    const {
      name,
      description,
      address,
      location,
      cuisines,
      averageCostForTwo,
      timings,
      isPureVeg,
      isOpen,
      deliveryTime,
      tags,
      tableBooking,
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: "Restaurant name is required" });
    }
    if (!address) {
      return res.status(400).json({ message: "Address is required" });
    }

    // Validate required file uploads
    if (!req.files?.logo?.[0]) {
      return res.status(400).json({ 
        message: "Restaurant logo is required",
        debug: {
          filesReceived: req.files ? Object.keys(req.files) : 'No files',
          logoPresent: !!req.files?.logo?.[0]
        }
      });
    }

    if (!req.files?.coverImage?.[0]) {
      return res.status(400).json({ 
        message: "Restaurant cover image is required",
        debug: {
          filesReceived: req.files ? Object.keys(req.files) : 'No files',
          coverImagePresent: !!req.files?.coverImage?.[0]
        }
      });
    }

    // Parse JSON fields if they're strings
    let parsedLocation, parsedCuisines, parsedTags, parsedTableBooking;

    try {
      parsedLocation = location ? (typeof location === 'string' ? JSON.parse(location) : location) : undefined;
      parsedCuisines = cuisines ? (typeof cuisines === 'string' ? JSON.parse(cuisines) : cuisines) : [];
      parsedTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];
      parsedTableBooking = tableBooking ? (typeof tableBooking === 'string' ? JSON.parse(tableBooking) : tableBooking) : undefined;
    } catch (error) {
      return res.status(400).json({ message: "Invalid JSON format in request data" });
    }

    // Get file paths (now guaranteed to exist due to validation above)
    const logo = req.files.logo[0].path;
    const coverImage = req.files.coverImage[0].path;

    // Create restaurant object with required images
    const restaurantData = {
      ownerId: req.user.id,
      name,
      description,
      address,
      logo, // Required field
      coverImage, // Required field
      averageCostForTwo: averageCostForTwo ? parseFloat(averageCostForTwo) : undefined,
      timings,
      isPureVeg: isPureVeg === 'true' || isPureVeg === true,
      isOpen: isOpen !== 'false' && isOpen !== false, // Default to true
      deliveryTime,
      cuisines: parsedCuisines,
      tags: parsedTags
    };

    // Add other optional fields
    if (parsedLocation) restaurantData.location = parsedLocation;
    if (parsedTableBooking) restaurantData.tableBooking = parsedTableBooking;

    const newRestaurant = new Restaurant(restaurantData);
    const savedRestaurant = await newRestaurant.save();

    console.log("Restaurant created successfully:", savedRestaurant._id);

    res.status(201).json({
      message: "Restaurant created successfully",
      restaurant: savedRestaurant,
      images: {
        logo: savedRestaurant.logo,
        coverImage: savedRestaurant.coverImage
      }
    });

  } catch (error) {
    console.error("Error creating restaurant:", error);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
// Get restaurants by owner (Restaurant Owner only)
exports.getMyRestaurants = async (req, res) => {
  try {
    const ownerId = req.user.id;
    
    const restaurants = await Restaurant.find({ ownerId }).sort({ createdAt: -1 });

    res.json({
      restaurants,
      count: restaurants.length
    });

  } catch (error) {
    console.error("Error fetching owner restaurants:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update restaurant (Restaurant Owner only)
exports.updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    // Find restaurant and check ownership
    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (restaurant.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this restaurant" });
    }

    const {
      name,
      description,
      address,
      location,
      cuisines,
      averageCostForTwo,
      timings,
      isPureVeg,
      isOpen,
      deliveryTime,
      tags,
      tableBooking
    } = req.body;

    // Parse JSON fields
    let updateData = { ...req.body };
    
    try {
      if (location && typeof location === 'string') {
        updateData.location = JSON.parse(location);
      }
      if (cuisines && typeof cuisines === 'string') {
        updateData.cuisines = JSON.parse(cuisines);
      }
      if (tags && typeof tags === 'string') {
        updateData.tags = JSON.parse(tags);
      }
      if (tableBooking && typeof tableBooking === 'string') {
        updateData.tableBooking = JSON.parse(tableBooking);
      }
    } catch (error) {
      return res.status(400).json({ message: "Invalid JSON format in request data" });
    }

    // Handle file uploads
    if (req.files?.logo?.[0]) {
      updateData.logo = req.files.logo[0].path;
    }
    if (req.files?.coverImage?.[0]) {
      updateData.coverImage = req.files.coverImage[0].path;
    }

    // Convert string booleans
    if (isPureVeg !== undefined) {
      updateData.isPureVeg = isPureVeg === 'true' || isPureVeg === true;
    }
    if (isOpen !== undefined) {
      updateData.isOpen = isOpen === 'true' || isOpen === true;
    }

    // Convert numbers
    if (averageCostForTwo) {
      updateData.averageCostForTwo = parseFloat(averageCostForTwo);
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('ownerId', 'name email');

    res.json({
      message: "Restaurant updated successfully",
      restaurant: updatedRestaurant
    });

  } catch (error) {
    console.error("Error updating restaurant:", error);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete restaurant (Restaurant Owner only)
exports.deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Check ownership
    if (restaurant.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this restaurant" });
    }

    await Restaurant.findByIdAndDelete(id);

    res.json({ message: "Restaurant deleted successfully" });

  } catch (error) {
    console.error("Error deleting restaurant:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update restaurant status (open/close) (Restaurant Owner only)
exports.updateRestaurantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isOpen } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    if (restaurant.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    restaurant.isOpen = isOpen;
    await restaurant.save();

    res.json({
      message: `Restaurant ${isOpen ? 'opened' : 'closed'} successfully`,
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        isOpen: restaurant.isOpen
      }
    });

  } catch (error) {
    console.error("Error updating restaurant status:", error);
    res.status(500).json({ message: "Server error" });
  }
};