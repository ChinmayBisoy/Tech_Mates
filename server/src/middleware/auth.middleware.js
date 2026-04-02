const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');

const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Access token is required');
    }

    const token = authHeader.slice(7).trim();

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new ApiError(401, 'Invalid or expired access token');
    }

    const user = await User.findById(decoded._id).select('-password -refreshToken');
    
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    if (user.isDeleted) {
      throw new ApiError(401, 'Account not found');
    }

    if (user.isBanned) {
      throw new ApiError(403, `Account suspended: ${user.bannedReason || 'Policy violation'}`);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }

      if (!roles.includes(req.user.role)) {
        throw new ApiError(403, 'Forbidden');
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = {
  verifyJWT,
  requireRole,
};
