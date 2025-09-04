const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  label: { type: String, required: true },
  addressLine: { type: String, required: true },
  pincode: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  }
}, { _id: false });

const AppProSchema = new mongoose.Schema({
  isActive: { type: Boolean, default: false },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProPlan' },
  startDate: { type: Date },
  endDate: { type: Date }
}, { _id: false });

const CartItemSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  dishId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish', required: true },
  quantity: { type: Number, default: 1, min: 1 },
  selectedAddons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Addon' }] // optional
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ }, // Email format
  phone: { type: String, required: true, unique: true, match: /^\+?[1-9]\d{9,14}$/ }, // E.164 phone
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['customer', 'restaurant_owner', 'delivery_partner', 'admin'], 
    default: 'customer' 
  },
  profileImage: { type: String },
  addresses: [AddressSchema],
  AppPro: AppProSchema,
  otp: { type: String },
  otpExpiresAt: { type: Date },
  isVerified: { type: Boolean, default: false }, // Only true after OTP verification

  // Favourites
  favouriteRestaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }],
  favouriteDishes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Dish' }],

  // 🛒 Cart
  cart: [CartItemSchema]

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
