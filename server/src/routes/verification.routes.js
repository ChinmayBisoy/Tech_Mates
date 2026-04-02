const express = require('express');
const verificationController = require('../controllers/verification.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// All verification routes require authentication
router.use(verifyJWT);

router.post(
  '/start',
  asyncHandler(verificationController.startVerification)
);

router.post(
  '/complete',
  asyncHandler(verificationController.completeVerification)
);

router.get(
  '/status/:type',
  asyncHandler(verificationController.getVerificationStatus)
);

module.exports = router;
