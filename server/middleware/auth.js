// // middleware/auth.js
// const jwt = require('jsonwebtoken');
// const User = require('../models/user');

// const JWT_SECRET = process.env.JWT_SECRET || "supersecurekey";

// /**
//  * Verify JWT and attach user to request
//  */
// exports.authMiddleware = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader?.startsWith('Bearer ')) {
//       return res.status(401).json({ message: 'No token provided' });
//     }

//     const token = authHeader.split(' ')[1];
//     const decoded = jwt.verify(token, JWT_SECRET);

//     const user = await User.findById(decoded.id);
//     if (!user) {
//       return res.status(401).json({ message: 'Invalid token: user not found' });
//     }

//     req.user = user; // Attach user object
//     next();
//   } catch (err) {
//     console.error("Auth Middleware Error:", err);
//     return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
//   }
// };

// /**
//  * Role-based access control
//  * @param {...string} roles - Allowed roles for this route
//  */
// exports.roleMiddleware = (...roles) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ message: 'Unauthorized: No user data' });
//     }

//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({
//         message: `Access denied: Requires one of [${roles.join(', ')}]`
//       });
//     }

//     next();
//   };
// };
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || "supersecurekey";

/**
 * Verify JWT and attach user to request
 */
exports.authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token: user not found' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Account not verified' });
    }

    req.user = user; // Attach user object
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
};

/**
 * Role-based access control
 * @param {...string} roles - Allowed roles for this route
 */
exports.roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user data' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied: Requires one of [${roles.join(', ')}]. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

/**
 * Owner middleware - specifically for restaurant owners
 * Alias for roleMiddleware('restaurant_owner') for backward compatibility
 */
exports.ownerMiddleware = (req, res, next) => {
  return exports.roleMiddleware('restaurant_owner')(req, res, next);
};

/**
 * Customer middleware - specifically for customers
 */
exports.customerMiddleware = (req, res, next) => {
  return exports.roleMiddleware('customer')(req, res, next);
};

/**
 * Admin middleware - for admin users
 */
exports.adminMiddleware = (req, res, next) => {
  return exports.roleMiddleware('admin')(req, res, next);
};

/**
 * Multi-role middleware - allows multiple roles
 * @param {...string} roles - Allowed roles
 */
exports.multiRoleMiddleware = (...roles) => {
  return exports.roleMiddleware(...roles);
};