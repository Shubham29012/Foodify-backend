// models/restaurant.js
const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
}, { _id: false });

const TableBookingSchema = new mongoose.Schema({
  isAvailable: { type: Boolean, default: false },
  slots: [{ type: String }]
}, { _id: false });

const RestaurantSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  logo: { type: String },
  coverImage: { type: String },
  description: { type: String },
  address: { type: String, required: true },
  location: LocationSchema,
  cuisines: [{ type: String }],
  averageCostForTwo: { type: Number },
  timings: { type: String },
  isPureVeg: { type: Boolean, default: false },
  isOpen: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  deliveryTime: { type: String },
  tags: [{ type: String }],
  tableBooking: TableBookingSchema
}, { timestamps: true }); // adds createdAt & updatedAt

module.exports = mongoose.model('Restaurant', RestaurantSchema);
