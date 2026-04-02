const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const asyncHandler = require('../utils/asyncHandler');
const validate = require('../middleware/validate.middleware');
const { verifyJWT } = require('../middleware/auth.middleware');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validators/auth.validator');

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // limit each IP to 100 requests per hour (for development)
  message: 'Too many auth attempts, please try again later',
  standardHeaders: true, // return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // disable the `X-RateLimit-*` headers
});

router.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  asyncHandler(authController.userRegisterController)
);

router.post(
  '/login',
  authLimiter,
  validate(loginSchema),
  asyncHandler(authController.userLoginController)
);

router.post(
  '/refresh-token',
  asyncHandler(authController.refreshTokenController)
);

router.post(
  '/logout',
  asyncHandler(authController.logoutController)
);

router.get(
  '/me',
  verifyJWT,
  asyncHandler(authController.getMeController)
);

router.post(
  '/forgot-password',
  asyncHandler(authController.forgotPasswordController)
);

router.post(
  '/reset-password/:token',
  asyncHandler(authController.resetPasswordController)
);

module.exports = router;