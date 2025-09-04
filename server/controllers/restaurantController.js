// const Restaurant = require('../models/restaurant');
// const mongoose = require('mongoose');

// // Create a new restaurant
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

// // Get all restaurants with filtering and pagination
// exports.getAllRestaurants = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       cuisine,
//       isPureVeg,
//       isOpen,
//       minRating,
//       search,
//       sortBy = 'createdAt',
//       order = 'desc'
//     } = req.query;

//     // Build filter object
//     const filter = {};
    
//     if (cuisine) {
//       filter.cuisines = { $in: [new RegExp(cuisine, 'i')] };
//     }
//     if (isPureVeg !== undefined) {
//       filter.isPureVeg = isPureVeg === 'true';
//     }
//     if (isOpen !== undefined) {
//       filter.isOpen = isOpen === 'true';
//     }
//     if (minRating) {
//       filter.rating = { $gte: parseFloat(minRating) };
//     }
//     if (search) {
//       filter.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { description: { $regex: search, $options: 'i' } },
//         { address: { $regex: search, $options: 'i' } }
//       ];
//     }

//     // Calculate pagination
//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     // Build sort object
//     const sort = {};
//     sort[sortBy] = order === 'asc' ? 1 : -1;

//     const restaurants = await Restaurant.find(filter)
//       .populate('ownerId', 'name email')
//       .sort(sort)
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Restaurant.countDocuments(filter);

//     res.json({
//       restaurants,
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(total / parseInt(limit)),
//         totalRestaurants: total,
//         hasNext: skip + restaurants.length < total,
//         hasPrev: parseInt(page) > 1
//       }
//     });

//   } catch (error) {
//     console.error("Error fetching restaurants:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Get restaurant by ID
// exports.getRestaurantById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid restaurant ID" });
//     }

//     const restaurant = await Restaurant.findById(id).populate('ownerId', 'name email phone');

//     if (!restaurant) {
//       return res.status(404).json({ message: "Restaurant not found" });
//     }

//     res.json(restaurant);

//   } catch (error) {
//     console.error("Error fetching restaurant:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Get restaurants by owner
// exports.getRestaurantsByOwner = async (req, res) => {
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

// // Update restaurant
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

// // Delete restaurant
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

// // Search restaurants by location
// exports.searchRestaurantsByLocation = async (req, res) => {
//   try {
//     const { lat, lng, radius = 5000 } = req.query; // radius in meters

//     if (!lat || !lng) {
//       return res.status(400).json({ message: "Latitude and longitude are required" });
//     }

//     const restaurants = await Restaurant.find({
//       location: {
//         $near: {
//           $geometry: {
//             type: "Point",
//             coordinates: [parseFloat(lng), parseFloat(lat)]
//           },
//           $maxDistance: parseInt(radius)
//         }
//       },
//       isOpen: true
//     }).populate('ownerId', 'name email');

//     res.json({
//       restaurants,
//       count: restaurants.length,
//       searchRadius: `${radius}m`
//     });

//   } catch (error) {
//     console.error("Error searching restaurants by location:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Update restaurant status (open/close)
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

const Restaurant = require('../models/restaurant');
const mongoose = require('mongoose');

// Get all restaurants with filtering and pagination (Public access)
exports.getAllRestaurants = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      cuisine,
      isPureVeg,
      isOpen,
      minRating,
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (cuisine) {
      filter.cuisines = { $in: [new RegExp(cuisine, 'i')] };
    }
    if (isPureVeg !== undefined) {
      filter.isPureVeg = isPureVeg === 'true';
    }
    if (isOpen !== undefined) {
      filter.isOpen = isOpen === 'true';
    }
    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = order === 'asc' ? 1 : -1;

    const restaurants = await Restaurant.find(filter)
      .populate('ownerId', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Restaurant.countDocuments(filter);

    res.json({
      restaurants,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRestaurants: total,
        hasNext: skip + restaurants.length < total,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get restaurant by ID (Public access)
exports.getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    const restaurant = await Restaurant.findById(id).populate('ownerId', 'name email phone');

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json(restaurant);

  } catch (error) {
    console.error("Error fetching restaurant:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Search restaurants by location (Public access)
exports.searchRestaurantsByLocation = async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query; // radius in meters

    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    const restaurants = await Restaurant.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      },
      isOpen: true
    }).populate('ownerId', 'name email');

    res.json({
      restaurants,
      count: restaurants.length,
      searchRadius: `${radius}m`
    });

  } catch (error) {
    console.error("Error searching restaurants by location:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Search restaurants with advanced filters (Public access)
exports.searchRestaurants = async (req, res) => {
  try {
    const {
      query,
      cuisine,
      isPureVeg,
      minRating,
      maxPrice,
      minPrice,
      isOpen = true,
      sortBy = 'relevance',
      page = 1,
      limit = 20
    } = req.query;

    // Build search filter
    const filter = { isOpen: isOpen === 'true' };
    
    // Text search
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { cuisines: { $in: [new RegExp(query, 'i')] } },
        { tags: { $in: [new RegExp(query, 'i')] } },
        { address: { $regex: query, $options: 'i' } }
      ];
    }

    // Cuisine filter
    if (cuisine) {
      const cuisines = Array.isArray(cuisine) ? cuisine : [cuisine];
      filter.cuisines = { $in: cuisines.map(c => new RegExp(c, 'i')) };
    }

    // Pure veg filter
    if (isPureVeg !== undefined) {
      filter.isPureVeg = isPureVeg === 'true';
    }

    // Rating filter
    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.averageCostForTwo = {};
      if (minPrice) filter.averageCostForTwo.$gte = parseFloat(minPrice);
      if (maxPrice) filter.averageCostForTwo.$lte = parseFloat(maxPrice);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sorting
    let sort = {};
    switch (sortBy) {
      case 'rating':
        sort = { rating: -1 };
        break;
      case 'price_low':
        sort = { averageCostForTwo: 1 };
        break;
      case 'price_high':
        sort = { averageCostForTwo: -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'name':
        sort = { name: 1 };
        break;
      default: // relevance
        sort = { rating: -1, createdAt: -1 };
    }

    const restaurants = await Restaurant.find(filter)
      .populate('ownerId', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Restaurant.countDocuments(filter);

    res.json({
      restaurants,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalResults: total,
        hasNext: skip + restaurants.length < total,
        hasPrev: parseInt(page) > 1
      },
      filters: {
        query: query || null,
        cuisine: cuisine || null,
        isPureVeg: isPureVeg || null,
        minRating: minRating || null,
        priceRange: {
          min: minPrice || null,
          max: maxPrice || null
        },
        sortBy
      }
    });

  } catch (error) {
    console.error("Error searching restaurants:", error);
    res.status(500).json({ message: "Server error" });
  }
};