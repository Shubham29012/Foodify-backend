const Joi = require("joi");

// Common helpers
const objectId = Joi.string().hex().length(24).message("Must be a 24-char hex ObjectId");

const emailOrPhone = Joi.alternatives().try(
  Joi.string().email().lowercase().trim(),
  Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).trim()
).messages({
  "alternatives.match": "emailOrPhone must be a valid email or E.164 phone",
});

const password = Joi.string().min(8).max(128);

const otp = Joi.string().trim().length(6).pattern(/^\d{6}$/).messages({
  "string.length": "OTP must be 6 digits",
  "string.pattern.base": "OTP must be numeric",
});

// ---------- Auth / Registration ----------
const registerCustomerBody = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().email().lowercase().trim().required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).trim().required(),
  password: password.required(),
});

const verifyCustomerOtpBody = Joi.object({
  emailOrPhone: emailOrPhone.required(),
  otp: otp.required(),
});

const loginCustomerBody = Joi.object({
  emailOrPhone: emailOrPhone.required(),
  // Password may be optional (your controller handles accounts without password)
  password: password.optional(),
});

const verifyLoginOtpBody = Joi.object({
  emailOrPhone: emailOrPhone.required(),
  otp: otp.required(),
});

// ---------- Forgot Password ----------
const requestPasswordResetBody = Joi.object({
  emailOrPhone: emailOrPhone.required(),
});

const verifyPasswordResetOtpBody = Joi.object({
  emailOrPhone: emailOrPhone.required(),
  otp: otp.required(),
});

const resetPasswordWithTokenBody = Joi.object({
  resetToken: Joi.string().trim().required(),
  newPassword: password.required(),
});

const changePasswordBody = Joi.object({
  currentPassword: password.required(),
  newPassword: password.disallow(Joi.ref("currentPassword")).concat(password).required()
    .messages({ "any.invalid": "newPassword must be different from currentPassword" }),
});

// ---------- Favourites ----------
const addFavouriteRestaurantBody = Joi.object({
  restaurantId: objectId.required(),
});

const removeFavouriteRestaurantBody = Joi.object({
  userId: objectId.required(),        // matches your current controller signature
  restaurantId: objectId.required(),
});

const checkRestaurantFavouriteBody = Joi.object({
  restaurantId: objectId.required(),
});

const addFavouriteDishBody = Joi.object({
  restaurantId: objectId.required(),
  dishId: objectId.required(),
});

const removeFavouriteDishBody = Joi.object({
  userId: objectId.required(),        // matches your current controller signature
  dishId: objectId.required(),
});

const checkDishFavouriteBody = Joi.object({
  dishId: objectId.required(),
});

// ---------- Cart ----------
const addToCartBody = Joi.object({
  restaurantId: objectId.required(),
  dishId: objectId.required(),
  quantity: Joi.number().integer().min(1).default(1),
});

const updateCartQuantityBody = Joi.object({
  dishId: objectId.required(),
  quantity: Joi.number().integer().min(0).required(), // 0 => remove in controller
});

const removeCartItemBody = Joi.object({
  dishId: objectId.required(),
});

// ---------- Orders (based on routes you shared) ----------
const cancelOrderParams = Joi.object({
  orderId: objectId.required(),
});

// If you later define a body for placeOrder, add it here:
const placeOrderBody = Joi.object().unknown(true); // placeholder – allow anything for now

module.exports = {
  // exports
  objectId,

  // auth
  registerCustomerBody,
  verifyCustomerOtpBody,
  loginCustomerBody,
  verifyLoginOtpBody,
  requestPasswordResetBody,
  verifyPasswordResetOtpBody,
  resetPasswordWithTokenBody,
  changePasswordBody,

  // favourites
  addFavouriteRestaurantBody,
  removeFavouriteRestaurantBody,
  checkRestaurantFavouriteBody,
  addFavouriteDishBody,
  removeFavouriteDishBody,
  checkDishFavouriteBody,

  // cart
  addToCartBody,
  updateCartQuantityBody,
  removeCartItemBody,

  // orders
  cancelOrderParams,
  placeOrderBody,
};
