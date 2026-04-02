const Verification = require('../models/verification.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const crypto = require('crypto');
const emailService = require('../services/email.service');

const startVerification = asyncHandler(async (req, res) => {
  const { type } = req.body;

  if (!type || !['email', 'phone', 'identity', 'business'].includes(type)) {
    throw new ApiError(400, 'Invalid verification type');
  }

  let verification = await Verification.findOne({ userId: req.user._id, type });

  if (!verification) {
    verification = await Verification.create({
      userId: req.user._id,
      type,
    });
  }

  // Generate verification token
  const token = crypto.randomBytes(32).toString('hex');
  verification.verificationToken = token;
  verification.tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  verification.status = 'pending';
  await verification.save();

  // Send verification email/SMS based on type
  if (type === 'email') {
    try {
      await emailService.sendVerificationEmail(req.user.email, req.user.name, token);
    } catch (error) {
      console.error('Verification email failed:', error.message);
    }
  }

  res.json(new ApiResponse(200, { verificationId: verification._id }, 'Verification started successfully'));
});

const completeVerification = asyncHandler(async (req, res) => {
  const { token, documents } = req.body;

  if (!token) {
    throw new ApiError(400, 'Verification token is required');
  }

  const verification = await Verification.findOneAndUpdate(
    {
      userId: req.user._id,
      verificationToken: token,
      tokenExpiresAt: { $gt: new Date() },
    },
    {
      documents: documents || [],
      status: 'approved',
      verifiedAt: new Date(),
      verificationToken: undefined,
      tokenExpiresAt: undefined,
    },
    { new: true }
  );

  if (!verification) {
    throw new ApiError(400, 'Invalid or expired verification token');
  }

  res.json(new ApiResponse(200, verification, 'Verification completed successfully'));
});

const getVerificationStatus = asyncHandler(async (req, res) => {
  const verification = await Verification.findOne({
    userId: req.user._id,
    type: req.params.type,
  });

  if (!verification) {
    return res.json(new ApiResponse(200, { status: 'not_started' }, 'Verification not started'));
  }

  res.json(
    new ApiResponse(
      200,
      {
        status: verification.status,
        type: verification.type,
        verifiedAt: verification.verifiedAt,
      },
      'Verification status fetched successfully'
    )
  );
});

module.exports = {
  startVerification,
  completeVerification,
  getVerificationStatus,
};
