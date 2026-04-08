const User = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const cloudinary = require('cloudinary').v2;
const Requirement = require('../models/requirement.model');
const Proposal = require('../models/proposal.model');
const Contract = require('../models/contract.model');
const Purchase = require('../models/purchase.model');
const adminService = require('../services/admin.service');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password -refreshToken');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.isDeleted || user.isBanned) {
    throw new ApiError(404, 'User not found');
  }

  res.json(new ApiResponse(200, user.toPublicProfile(), 'Public profile fetched successfully'));
});

const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password -refreshToken');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.isDeleted || user.isBanned) {
    throw new ApiError(403, 'Account is not available');
  }

  res.json(
    new ApiResponse(
      200,
      {
        ...user.toPublicProfile(),
        email: user.email,
      },
      'Profile fetched successfully'
    )
  );
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'name',
    'username',
    'bio',
    'skills',
    'location',
    'website',
    'linkedin',
    'instagram',
    'githubUsername',
    'portfolioLinks',
  ];

  const updates = {};
  const payload = req.validatedBody || req.body;

  allowedFields.forEach((field) => {
    if (payload[field] !== undefined) {
      updates[field] = payload[field];
    }
  });

  let user;
  try {
    user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password -refreshToken');
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.username) {
      throw new ApiError(409, 'Username is already taken');
    }
    throw error;
  }

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json(
    new ApiResponse(
      200,
      {
        ...user.toPublicProfile(),
        email: user.email,
      },
      'Profile updated successfully'
    )
  );
});

const uploadAvatar = asyncHandler(async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      throw new ApiError(400, 'Avatar file is required');
    }

    if (!req.user || !req.user._id) {
      throw new ApiError(401, 'User authentication required');
    }

    // Validate file size (max 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      throw new ApiError(400, 'Avatar file must be less than 5MB');
    }

    // Validate file type
    if (!req.file.mimetype || !req.file.mimetype.startsWith('image/')) {
      throw new ApiError(400, 'Only image files are allowed');
    }

    // Upload to cloudinary with timeout protection
    const uploadResult = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Cloudinary upload timeout'));
      }, 30000); // 30 second timeout

      try {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'techmates/avatars',
            resource_type: 'image',
            quality: 'auto',
            fetch_format: 'auto',
            width: 400,
            height: 400,
            crop: 'fill',
            gravity: 'face',
          },
          (error, result) => {
            clearTimeout(timeout);
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(new ApiError(500, 'Failed to upload avatar to storage service'));
            } else {
              resolve(result);
            }
          }
        );

        stream.on('error', (streamError) => {
          clearTimeout(timeout);
          console.error('Stream error:', streamError);
          reject(new ApiError(500, 'Stream upload error: ' + streamError.message));
        });

        stream.end(req.file.buffer);
      } catch (err) {
        clearTimeout(timeout);
        reject(new ApiError(500, 'Upload initialization error: ' + err.message));
      }
    });

    if (!uploadResult || !uploadResult.secure_url) {
      throw new ApiError(500, 'Invalid upload result from storage service');
    }

    // Find and update user
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Delete old avatar if exists
    if (user.avatar && user.avatar.includes('cloudinary')) {
      try {
        const publicId = user.avatar.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`techmates/avatars/${publicId}`);
      } catch (err) {
        console.warn('Failed to delete old avatar:', err);
        // Don't throw error, just log it
      }
    }

    user.avatar = uploadResult.secure_url;
    await user.save();

    res.json(
      new ApiResponse(
        200,
        user,
        'Avatar uploaded successfully'
      )
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, error.message || 'Failed to upload avatar');
  }
});

const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const role = req.user.role;

  if (role === 'client') {
    const [
      activeRequirements,
      activeContracts,
      totalSpentAgg,
      recentRequirements,
      recentContracts,
    ] = await Promise.all([
      Requirement.countDocuments({ postedBy: userId, status: 'open', isDeleted: false }),
      Contract.countDocuments({ clientId: userId, status: 'active', isDeleted: false }),
      Purchase.aggregate([
        { $match: { buyerId: userId, status: { $in: ['completed', 'disputed', 'refunded'] }, isDeleted: false } },
        { $group: { _id: null, totalSpent: { $sum: '$amount' } } },
      ]),
      Requirement.find({ postedBy: userId, isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(5),
      Contract.find({ clientId: userId, isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.json(new ApiResponse(200, {
      activeRequirements,
      activeContracts,
      totalSpent: totalSpentAgg[0]?.totalSpent || 0,
      recentRequirements,
      recentContracts,
    }, 'Client dashboard fetched successfully'));
    return;
  }

  if (role === 'developer') {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const [activeProposals, activeContracts, recentContracts, recentProposals] = await Promise.all([
      Proposal.countDocuments({
        developerId: userId,
        isDeleted: false,
        status: { $in: ['pending', 'shortlisted'] },
      }),
      Contract.countDocuments({ developerId: userId, status: 'active', isDeleted: false }),
      Contract.find({ developerId: userId, isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(5),
      Proposal.find({ developerId: userId, isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.json(new ApiResponse(200, {
      activeProposals,
      activeContracts,
      walletBalance: user.walletBalance || 0,
      totalEarnings: user.totalEarnings || 0,
      avgRating: user.avgRating || 0,
      tier: user.tier || 'beginner',
      isPro: Boolean(user.isPro),
      recentContracts,
      recentProposals,
    }, 'Developer dashboard fetched successfully'));
    return;
  }

  if (role === 'admin') {
    const analytics = await adminService.getPlatformAnalytics('today');
    res.json(new ApiResponse(200, analytics, 'Admin dashboard fetched successfully'));
    return;
  }

  throw new ApiError(403, 'Invalid role');
});

const searchDevelopers = asyncHandler(async (req, res) => {
  const queryInput = req.validatedQuery || req.query;
  const page = Number(queryInput.page || 1);
  const limit = Math.min(Number(queryInput.limit || 12), 50);
  const skip = (page - 1) * limit;

  const query = {
    role: 'developer',
    isDeleted: false,
    isBanned: false,
  };

  if (queryInput.skills) {
    const skills = String(queryInput.skills)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (skills.length > 0) {
      query.skills = { $in: skills };
    }
  }

  if (queryInput.minRating !== undefined) {
    query.avgRating = { $gte: Number(queryInput.minRating) };
  }

  if (queryInput.tier) {
    query.tier = queryInput.tier;
  }

  if (queryInput.isPro !== undefined) {
    query.isPro = queryInput.isPro;
  }

  if (queryInput.search) {
    const searchPattern = { $regex: String(queryInput.search), $options: 'i' };
    query.$or = [{ name: searchPattern }, { username: searchPattern }];
  }

  const sortBy = queryInput.sortBy || 'rating';
  let sort = { avgRating: -1, createdAt: -1 };

  if (sortBy === 'contracts') {
    sort = { totalContractsCompleted: -1, createdAt: -1 };
  }

  if (sortBy === 'newest') {
    sort = { createdAt: -1 };
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -refreshToken')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  res.json(new ApiResponse(200, {
    developers: users.map((user) => user.toPublicProfile()),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  }, 'Developers fetched successfully'));
});

module.exports = {
  getPublicProfile,
  getMyProfile,
  updateProfile,
  uploadAvatar,
  getDashboard,
  searchDevelopers,
};
