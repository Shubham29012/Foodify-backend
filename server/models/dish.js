const mongoose = require('mongoose');

const addonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 }
});

const dishSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  price: { type: Number, required: true, min: 1 },
  discountPrice: { type: Number, min: 0 },
  isVeg: { type: Boolean, default: true },
  image: { type: String, required: true }, // Cloudinary URL
  category: { type: String, trim: true }, // e.g., Pizza, Drinks
  tags: [{ type: String, trim: true }], // e.g., ["Spicy", "Chef's Special"]
  isAvailable: { type: Boolean, default: true },
  addons: [addonSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-update `updatedAt` on save
dishSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Dish', dishSchema);
