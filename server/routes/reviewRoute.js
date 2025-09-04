const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../middleware/auth');
const {
createReview,
getReviews,
} = require('../controllers/reviewController');
const { uploadReviewImages, handleMulterError } = require('../utils/cloudinary');

router.post(
'/add',
authMiddleware,
uploadReviewImages.array('images', 5),
handleMulterError,
createReview
);
router.get('/', getReviews);

module.exports = router;