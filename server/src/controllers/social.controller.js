const mongoose = require('mongoose');
const User = require('../models/user.model');
const SocialConnection = require('../models/socialConnection.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const CLIENT_ROLES = ['client', 'user'];

const getTargetRoles = (role) => {
  if (role === 'developer') {
    return CLIENT_ROLES;
  }

  if (CLIENT_ROLES.includes(role)) {
    return ['developer'];
  }

  return [];
};

const toConnectionStatus = (connection, currentUserId) => {
  if (!connection) {
    return 'none';
  }

  if (connection.status === 'accepted') {
    return 'connected';
  }

  if (connection.status === 'pending') {
    return String(connection.requesterId) === String(currentUserId)
      ? 'pending_sent'
      : 'pending_received';
  }

  return 'none';
};

const listDiscoverUsers = asyncHandler(async (req, res) => {
  const currentUserId = String(req.user._id);
  const targetRoles = getTargetRoles(req.user.role);

  if (!targetRoles.length) {
    throw new ApiError(403, 'Only clients and developers can use socialise');
  }

  const users = await User.find({
    _id: { $ne: req.user._id },
    role: { $in: targetRoles },
    isDeleted: false,
    isBanned: false,
  })
    .select(
      '_id name role avatar bio skills location tier avgRating totalReviews totalContractsCompleted socialHeadline achievements recentWorks createdAt'
    )
    .sort({ createdAt: -1 })
    .limit(300)
    .lean();

  const userIds = users.map((user) => user._id);

  const connections = await SocialConnection.find({
    $or: [
      { requesterId: req.user._id, receiverId: { $in: userIds } },
      { receiverId: req.user._id, requesterId: { $in: userIds } },
    ],
  })
    .select('requesterId receiverId status')
    .lean();

  const connectionByOtherUserId = new Map();
  for (const connection of connections) {
    const otherUserId =
      String(connection.requesterId) === currentUserId
        ? String(connection.receiverId)
        : String(connection.requesterId);
    connectionByOtherUserId.set(otherUserId, connection);
  }

  const discoverUsers = users.map((user) => ({
    ...user,
    connectionStatus: toConnectionStatus(connectionByOtherUserId.get(String(user._id)), currentUserId),
  }));

  res.json(new ApiResponse(200, discoverUsers, 'Discover users fetched successfully'));
});

const sendConnectionRequest = asyncHandler(async (req, res) => {
  const { targetUserId } = req.validatedBody || req.body;

  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw new ApiError(400, 'Invalid target user id');
  }

  if (String(targetUserId) === String(req.user._id)) {
    throw new ApiError(400, 'You cannot connect with yourself');
  }

  const targetUser = await User.findById(targetUserId).select('_id role isDeleted isBanned');
  if (!targetUser || targetUser.isDeleted || targetUser.isBanned) {
    throw new ApiError(404, 'Target user not found');
  }

  const allowedRoles = getTargetRoles(req.user.role);
  if (!allowedRoles.includes(targetUser.role)) {
    throw new ApiError(400, 'You can only connect with opposite-role users');
  }

  const pairKey = [String(req.user._id), String(targetUserId)].sort().join(':');
  const existing = await SocialConnection.findOne({ pairKey });

  if (!existing) {
    const connection = await SocialConnection.create({
      requesterId: req.user._id,
      receiverId: targetUserId,
      status: 'pending',
    });

    return res.json(new ApiResponse(201, connection, 'Connection request sent successfully'));
  }

  if (existing.status === 'accepted') {
    throw new ApiError(409, 'You are already connected');
  }

  if (existing.status === 'pending') {
    if (String(existing.requesterId) === String(req.user._id)) {
      throw new ApiError(409, 'Connection request already sent');
    }

    throw new ApiError(409, 'This user has already sent you a request. Check incoming requests.');
  }

  existing.requesterId = req.user._id;
  existing.receiverId = targetUserId;
  existing.status = 'pending';
  existing.respondedAt = null;
  await existing.save();

  res.json(new ApiResponse(200, existing, 'Connection request sent successfully'));
});

const getRequests = asyncHandler(async (req, res) => {
  const [incoming, sent] = await Promise.all([
    SocialConnection.find({
      receiverId: req.user._id,
      status: 'pending',
    })
      .populate('requesterId', '_id name role avatar bio socialHeadline skills location tier avgRating totalReviews')
      .sort({ createdAt: -1 })
      .lean(),
    SocialConnection.find({
      requesterId: req.user._id,
      status: 'pending',
    })
      .populate('receiverId', '_id name role avatar bio socialHeadline skills location tier avgRating totalReviews')
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  res.json(
    new ApiResponse(
      200,
      {
        incoming,
        sent,
      },
      'Requests fetched successfully'
    )
  );
});

const respondToRequest = asyncHandler(async (req, res) => {
  const { action } = req.validatedBody || req.body;

  const connection = await SocialConnection.findOne({
    _id: req.params.requestId,
    receiverId: req.user._id,
    status: 'pending',
  });

  if (!connection) {
    throw new ApiError(404, 'Pending request not found');
  }

  connection.status = action === 'accept' ? 'accepted' : 'rejected';
  connection.respondedAt = new Date();
  await connection.save();

  res.json(new ApiResponse(200, connection, `Request ${action}ed successfully`));
});

const getConnections = asyncHandler(async (req, res) => {
  const connections = await SocialConnection.find({
    status: 'accepted',
    $or: [{ requesterId: req.user._id }, { receiverId: req.user._id }],
  })
    .populate('requesterId', '_id name role avatar bio socialHeadline skills location tier avgRating totalReviews')
    .populate('receiverId', '_id name role avatar bio socialHeadline skills location tier avgRating totalReviews')
    .sort({ updatedAt: -1 })
    .lean();

  const mapped = connections.map((connection) => {
    const isRequester = String(connection.requesterId?._id) === String(req.user._id);
    return {
      ...connection,
      user: isRequester ? connection.receiverId : connection.requesterId,
    };
  });

  res.json(new ApiResponse(200, mapped, 'Connections fetched successfully'));
});

const getMySocialProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('_id name role avatar bio socialHeadline achievements recentWorks skills location tier avgRating totalReviews')
    .lean();

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json(new ApiResponse(200, user, 'Social profile fetched successfully'));
});

const updateMySocialProfile = asyncHandler(async (req, res) => {
  const payload = req.validatedBody || req.body;
  const updates = {};

  const allowedFields = ['socialHeadline', 'bio', 'achievements', 'recentWorks'];
  allowedFields.forEach((field) => {
    if (payload[field] !== undefined) {
      updates[field] = payload[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  })
    .select('_id name role avatar bio socialHeadline achievements recentWorks skills location tier avgRating totalReviews')
    .lean();

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json(new ApiResponse(200, user, 'Social profile updated successfully'));
});

module.exports = {
  listDiscoverUsers,
  sendConnectionRequest,
  getRequests,
  respondToRequest,
  getConnections,
  getMySocialProfile,
  updateMySocialProfile,
};
