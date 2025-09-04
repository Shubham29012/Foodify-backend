const Dish = require('../models/dish');
const Review = require('../models/review');

exports.createReview = async (req, res) => {
  try {
    const { dishId, rating, comment } = req.body;

    if (!dishId || !rating) {
      return res.status(400).json({ message: "dishId and rating are required" });
    }

    const dish = await Dish.findById(dishId);
    if (!dish) {
      return res.status(404).json({ message: "Dish not found" });
    }

    const imageUrls = req.files?.map(file => file.path) || [];

    const review = new Review({
      restaurantId: dish.restaurantId,
      userId: req.user._id,
      rating,
      comment,
      images: imageUrls,
    });

    await review.save();

    res.status(201).json({
      message: "Review created successfully",
      review,
    });
  } catch (err) {
    console.error("Error creating review:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getReviews = async (req, res) => {
try {
const { restaurantId, dishId } = req.query;
const filter = {};
if (restaurantId) filter.restaurantId = restaurantId;
if (dishId) filter.dishId = dishId;

const reviews = await Review.find(filter)
  .populate('userId', 'name profileImage') // populate user info
  .sort({ createdAt: -1 }); // newest first

res.status(200).json({
  success: true,
  count: reviews.length,
  data: reviews
});
} catch (err) {
console.error('Error fetching reviews:', err);
res.status(500).json({ message: 'Server error while fetching reviews' });
}
};
