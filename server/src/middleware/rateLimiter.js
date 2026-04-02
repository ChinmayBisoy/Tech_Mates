const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

const limiterHandler = (req, res, next) => {
  next(new ApiError(429, 'Too many requests, please try again later'));
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterHandler,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterHandler,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterHandler,
});

const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterHandler,
});

module.exports = {
  authLimiter,
  apiLimiter,
  uploadLimiter,
  paymentLimiter,
};
