// middleware/rateLimiter.js
const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

/**
 * Safely extract a stable per-user identifier from the request body.
 * Falls back to empty string if not provided.
 */
function getIdentifier(req) {
  const { email, phone, emailOrPhone } = req.body || {};
  const id =
    (email && String(email).toLowerCase().trim()) ||
    (emailOrPhone && String(emailOrPhone).toLowerCase().trim()) ||
    (phone && String(phone).toLowerCase().trim()) ||
    "";
  return id;
}

/**
 * Build a composite key "<IPv6-safe-IP>[:<identifier>]"
 * Uses express-rate-limit's ipKeyGenerator to normalize IPv4/IPv6.
 */
function ipAndIdentifierKey(req) {
  const ipKey = ipKeyGenerator(req); // ✅ IPv6-safe
  const id = getIdentifier(req);
  return id ? `${ipKey}:${id}` : ipKey;
}

/**
 * Consistent JSON handler for rate limit responses.
 * Signature must include (req, res, next, options) for v7+
 */
function jsonRateLimitHandler(req, res, _next, options) {
  return res.status((options && options.statusCode) || 429).json({
    message:
      (options && options.message) ||
      "Too many requests. Please try again later.",
  });
}

/**
 * Registration attempts (creates/sends OTP)
 * - Scoped by IP only to cut down mass signups from a single source.
 *   If you prefer per-identifier here, switch keyGenerator to ipAndIdentifierKey.
 */
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,                 // v7 uses `limit` (alias of `max`)
  standardHeaders: true,
  legacyHeaders: false,
  // ✅ Use IPv6-safe helper
  keyGenerator: (req) => ipKeyGenerator(req),
  message: "Too many registration attempts. Try again in 15 minutes.",
  handler: jsonRateLimitHandler,
});

/**
 * OTP send limiter (applies to endpoints that send OTP: login/register/forgot)
 * - Scoped by IP + identifier to prevent spamming a specific account.
 */
const otpSendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5,                 // 5 OTP sends per user per hour
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipAndIdentifierKey, // ✅ IPv6-safe + per-account
  message:
    "Too many OTP requests for this account. Please try again in about an hour.",
  handler: jsonRateLimitHandler,
});

/**
 * OTP verification attempts (applies to verify-otp and verify-login-otp)
 * - Scoped by IP + identifier to curb brute forcing.
 */
const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,                // 10 verify attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: ipAndIdentifierKey, // ✅ IPv6-safe + per-account
  message:
    "Too many OTP verification attempts. Please wait 15 minutes and try again.",
  handler: jsonRateLimitHandler,
});

module.exports = {
  registerLimiter,
  otpSendLimiter,
  verifyOtpLimiter,
};
