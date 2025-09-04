// const Dish = require('../models/dish');

// // Add Dish
// // exports.addDish = async (req, res) => {
// //   try {
// //     const { restaurantId, name, description, price, discountPrice, isVeg, category, isAvailable, addons } = req.body;
    
// //     console.log("------ DEBUG: Dish Upload Request ------");
// //     console.log("req.body:", req.body);
// //     console.log("req.file:", req.file);
// //     console.log("req.headers['content-type']:", req.headers['content-type']);
// //     console.log("----------------------------------------");

// //     // Check if file was uploaded
// //     if (!req.file) {
// //       return res.status(400).json({ 
// //         message: "Image is required",
// //         debug: {
// //           bodyKeys: Object.keys(req.body),
// //           hasFile: !!req.file,
// //           contentType: req.headers['content-type']
// //         }
// //       });
// //     }

// //     const image = req.file.path; // Cloudinary URL

// //     const newDish = new Dish({
// //       restaurantId,
// //       name,
// //       description,
// //       price: parseFloat(price),
// //       discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
// //       isVeg: isVeg === 'true' || isVeg === true,
// //       category,
// //       isAvailable: isAvailable === 'true' || isAvailable === true,
// //       addons: addons ? JSON.parse(addons) : [],
// //       image
// //     });

// //     await newDish.save();
// //     res.status(201).json({ message: "Dish added successfully", dish: newDish });
// //   } catch (err) {
// //     console.error("Error adding dish:", err);
// //     res.status(500).json({ 
// //       message: "Server error", 
// //       error: process.env.NODE_ENV === 'development' ? err.message : undefined 
// //     });
// //   }
// // };


// exports.addDish = async (req, res) => {
//   try {
//     console.log("=== CONTROLLER DEBUG START ===");
//     console.log("Headers:", {
//       'content-type': req.headers['content-type'],
//       'content-length': req.headers['content-length']
//     });
//     console.log("Body:", req.body);
//     console.log("File:", req.file);
//     console.log("Body Keys:", Object.keys(req.body || {}));
//     console.log("=== CONTROLLER DEBUG END ===");

//     // Extract data from request
//     const { restaurantId, name, description, price, discountPrice, isVeg, category, isAvailable, addons } = req.body;
    
//     // Validate required fields
//     if (!restaurantId) {
//       return res.status(400).json({ message: "Restaurant ID is required" });
//     }
    
//     if (!name) {
//       return res.status(400).json({ message: "Dish name is required" });
//     }
    
//     if (!price) {
//       return res.status(400).json({ message: "Price is required" });
//     }

//     // Check if file was uploaded
//     if (!req.file) {
//       return res.status(400).json({ 
//         message: "Image is required",
//         debug: {
//           bodyKeys: Object.keys(req.body || {}),
//           hasFile: !!req.file,
//           contentType: req.headers['content-type'],
//           fileFieldReceived: req.file ? 'yes' : 'no'
//         }
//       });
//     }

//     const image = req.file.path; // Cloudinary URL

//     // Parse addons if provided
//     let parsedAddons = [];
//     if (addons) {
//       try {
//         parsedAddons = typeof addons === 'string' ? JSON.parse(addons) : addons;
//       } catch (error) {
//         return res.status(400).json({ message: "Invalid addons format" });
//       }
//     }

//     // Create new dish
//     const newDish = new Dish({
//       restaurantId,
//       name,
//       description,
//       price: parseFloat(price),
//       discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
//       isVeg: isVeg === 'true' || isVeg === true,
//       category,
//       isAvailable: isAvailable !== 'false' && isAvailable !== false, // Default to true
//       addons: parsedAddons,
//       image
//     });

//     const savedDish = await newDish.save();
    
//     console.log("Dish saved successfully:", savedDish._id);
    
//     res.status(201).json({ 
//       message: "Dish added successfully", 
//       dish: savedDish 
//     });
    
//   } catch (err) {
//     console.error("Error adding dish:", err);
//     res.status(500).json({ 
//       message: "Server error", 
//       error: process.env.NODE_ENV === 'development' ? err.message : undefined 
//     });
//   }
// };

// exports.getDishesByRestaurant = async (req, res) => {
//   try {
//     const { restaurantId } = req.params;
//     const dishes = await Dish.find({ restaurantId }).sort({ createdAt: -1 });
//     res.json(dishes);
//   } catch (err) {
//     console.error("Error fetching dishes:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Get dishes by restaurant
// // exports.getDishesByRestaurant = async (req, res) => {
// //   try {
// //     const { restaurantId } = req.params;
// //     const dishes = await Dish.find({ restaurantId, isAvailable: true });
// //     res.status(200).json({ dishes });
// //   } catch (err) {
// //     console.error("Error fetching dishes:", err);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };
// // Get all dishes for a restaurant
// // exports.getDishesByRestaurant = async (req, res) => {
// //   try {
// //     const { restaurantId } = req.params;
// //     const dishes = await Dish.find({ restaurantId });
// //     res.status(200).json(dishes);
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };
// // Update Dish
// exports.updateDish = async (req, res) => {
//   try {
//     const { dishId } = req.params;
//     const { restaurantId } = req.body;

//     const dish = await Dish.findById(dishId);
//     if (!dish) return res.status(404).json({ message: "Dish not found" });

//     // Ensure dish belongs to the same restaurant
//     if (dish.restaurantId.toString() !== restaurantId)
//       return res.status(403).json({ message: "You do not own this dish" });

//     // If new image uploaded
//     if (req.file) {
//       dish.image = req.file.path;
//     }

//     // Update other fields
//     Object.assign(dish, req.body);

//     if (req.body.addons) {
//       dish.addons = JSON.parse(req.body.addons);
//     }

//     await dish.save();
//     res.status(200).json({ message: "Dish updated successfully", dish });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Delete Dish
// exports.deleteDish = async (req, res) => {
//   try {
//     const { dishId } = req.params;
//     const { restaurantId } = req.body;

//     const dish = await Dish.findById(dishId);
//     if (!dish) return res.status(404).json({ message: "Dish not found" });

//     // Ensure dish belongs to the same restaurant
//     if (dish.restaurantId.toString() !== restaurantId)
//       return res.status(403).json({ message: "You do not own this dish" });

//     await dish.deleteOne();
//     res.status(200).json({ message: "Dish deleted successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

const Dish = require('../models/dish');
const Restaurant = require('../models/restaurant');
const mongoose = require('mongoose');

exports.addDish = async (req, res) => {
  try {
    console.log("=== CONTROLLER DEBUG START ===");
    console.log("Headers:", {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length']
    });
    console.log("Body:", req.body);
    console.log("File:", req.file);
    console.log("User ID:", req.user?.id);
    console.log("Body Keys:", Object.keys(req.body || {}));
    console.log("=== CONTROLLER DEBUG END ===");

    // Extract data from request
    const { restaurantId, name, description, price, discountPrice, isVeg, category, isAvailable, addons } = req.body;
    
    // Validate required fields
    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }
    
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }
    
    if (!name) {
      return res.status(400).json({ message: "Dish name is required" });
    }
    
    if (!price) {
      return res.status(400).json({ message: "Price is required" });
    }

    // Check if restaurant exists and belongs to the authenticated owner
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Verify ownership - restaurant must belong to the authenticated user
    if (restaurant.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to add dishes to this restaurant" });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        message: "Image is required",
        debug: {
          bodyKeys: Object.keys(req.body || {}),
          hasFile: !!req.file,
          contentType: req.headers['content-type'],
          fileFieldReceived: req.file ? 'yes' : 'no'
        }
      });
    }

    const image = req.file.path; // Cloudinary URL

    // Parse addons if provided
    let parsedAddons = [];
    if (addons) {
      try {
        parsedAddons = typeof addons === 'string' ? JSON.parse(addons) : addons;
      } catch (error) {
        return res.status(400).json({ message: "Invalid addons format" });
      }
    }

    // Create new dish
    const newDish = new Dish({
      restaurantId,
      name,
      description,
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
      isVeg: isVeg === 'true' || isVeg === true,
      category,
      isAvailable: isAvailable !== 'false' && isAvailable !== false, // Default to true
      addons: parsedAddons,
      image
    });

    const savedDish = await newDish.save();
    
    console.log("Dish saved successfully:", savedDish._id);
    
    res.status(201).json({ 
      message: "Dish added successfully", 
      dish: savedDish 
    });
    
  } catch (err) {
    console.error("Error adding dish:", err);
    res.status(500).json({ 
      message: "Server error", 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
};

// exports.getDishesByRestaurant = async (req, res) => {
//   try {
//     const { restaurantId } = req.params;
    
//     if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
//       return res.status(400).json({ message: "Invalid restaurant ID" });
//     }

//     // Check if restaurant exists and belongs to the authenticated owner
//     const restaurant = await Restaurant.findById(restaurantId);
//     if (!restaurant) {
//       return res.status(404).json({ message: "Restaurant not found" });
//     }

//     // Verify ownership - restaurant must belong to the authenticated user
//     if (restaurant.ownerId.toString() !== req.user.id) {
//       return res.status(403).json({ message: "You are not authorized to view dishes for this restaurant" });
//     }

//     const dishes = await Dish.find({ restaurantId }).sort({ createdAt: -1 });
    
//     res.json({
//       dishes,
//       count: dishes.length,
//       restaurantName: restaurant.name
//     });
//   } catch (err) {
//     console.error("Error fetching dishes:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// Update Dish

exports.getDishesByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Fetch dishes without ownership check
    const dishes = await Dish.find({ restaurantId }).sort({ createdAt: -1 });

    res.json({
      dishes,
      count: dishes.length,
      restaurantName: restaurant.name,
    });
  } catch (err) {
    console.error("Error fetching dishes:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateDish = async (req, res) => {
  try {
    const { dishId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(dishId)) {
      return res.status(400).json({ message: "Invalid dish ID" });
    }

    // Find the dish and populate restaurant info
    const dish = await Dish.findById(dishId).populate('restaurantId');
    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }

    // Check if the restaurant belongs to the authenticated owner
    if (dish.restaurantId.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to update this dish" });
    }

    // Prepare update data
    const updateData = { ...req.body };

    // If new image uploaded
    if (req.file) {
      updateData.image = req.file.path;
    }

    // Parse addons if provided
    if (req.body.addons) {
      try {
        updateData.addons = typeof req.body.addons === 'string' ? JSON.parse(req.body.addons) : req.body.addons;
      } catch (error) {
        return res.status(400).json({ message: "Invalid addons format" });
      }
    }

    // Convert string booleans and numbers
    if (updateData.isVeg !== undefined) {
      updateData.isVeg = updateData.isVeg === 'true' || updateData.isVeg === true;
    }
    if (updateData.isAvailable !== undefined) {
      updateData.isAvailable = updateData.isAvailable === 'true' || updateData.isAvailable === true;
    }
    if (updateData.price) {
      updateData.price = parseFloat(updateData.price);
    }
    if (updateData.discountPrice) {
      updateData.discountPrice = parseFloat(updateData.discountPrice);
    }

    // Remove fields that shouldn't be updated
    delete updateData.restaurantId; // Don't allow changing restaurant association

    const updatedDish = await Dish.findByIdAndUpdate(
      dishId,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ 
      message: "Dish updated successfully", 
      dish: updatedDish 
    });
    
  } catch (err) {
    console.error("Error updating dish:", err);
    res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Delete Dish
exports.deleteDish = async (req, res) => {
  try {
    const { dishId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(dishId)) {
      return res.status(400).json({ message: "Invalid dish ID" });
    }

    // Find the dish and populate restaurant info
    const dish = await Dish.findById(dishId).populate('restaurantId');
    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }

    // Check if the restaurant belongs to the authenticated owner
    if (dish.restaurantId.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to delete this dish" });
    }

    await Dish.findByIdAndDelete(dishId);
    
    res.status(200).json({ 
      message: "Dish deleted successfully",
      deletedDish: {
        id: dish._id,
        name: dish.name,
        restaurantName: dish.restaurantId.name
      }
    });
    
  } catch (err) {
    console.error("Error deleting dish:", err);
    res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Toggle dish availability
exports.toggleDishAvailability = async (req, res) => {
  try {
    const { dishId } = req.params;
    const { isAvailable } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(dishId)) {
      return res.status(400).json({ message: "Invalid dish ID" });
    }

    // Find the dish and populate restaurant info
    const dish = await Dish.findById(dishId).populate('restaurantId');
    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }

    // Check if the restaurant belongs to the authenticated owner
    if (dish.restaurantId.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to modify this dish" });
    }

    dish.isAvailable = isAvailable;
    await dish.save();

    res.status(200).json({
      message: `Dish ${isAvailable ? 'enabled' : 'disabled'} successfully`,
      dish: {
        id: dish._id,
        name: dish.name,
        isAvailable: dish.isAvailable
      }
    });
    
  } catch (err) {
    console.error("Error toggling dish availability:", err);
    res.status(500).json({ message: "Server error" });
  }
};