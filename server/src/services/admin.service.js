const User = require('../models/user.model');
const Dispute = require('../models/dispute.model');
const Requirement = require('../models/requirement.model');
const Proposal = require('../models/proposal.model');
const Contract = require('../models/contract.model');
const ProjectListing = require('../models/projectlisting.model');
const Purchase = require('../models/purchase.model');
const Transaction = require('../models/transaction.model');
const Subscription = require('../models/subscription.model');
const ApiError = require('../utils/ApiError');
const emailService = require('./email.service');
const listingService = require('./listing.service');

const normalizePagination = (pagination = {}) => {
  const parsedPage = Number.parseInt(pagination.page, 10);
  const parsedLimit = Number.parseInt(pagination.limit, 10);

  const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const limit = Number.isNaN(parsedLimit) || parsedLimit < 1 ? 20 : Math.min(parsedLimit, 100);

  return { page, limit, skip: (page - 1) * limit };
};

const getDateRangeFromPeriod = (period = 'month') => {
  const now = new Date();
  const start = new Date(now);

  if (period === 'today') {
    start.setHours(0, 0, 0, 0);
    return { start, end: now };
  }

  if (period === 'week') {
    start.setDate(now.getDate() - 7);
    return { start, end: now };
  }

  if (period === 'month') {
    start.setMonth(now.getMonth() - 1);
    return { start, end: now };
  }

  if (period === 'year') {
    start.setFullYear(now.getFullYear() - 1);
    return { start, end: now };
  }

  throw new ApiError(400, 'Invalid period');
};

const getAllUsers = async (filters = {}, pagination = {}) => {
  const { page, limit, skip } = normalizePagination(pagination);

  const query = {};

  if (filters.role) {
    query.role = filters.role;
  }

  if (filters.isPro !== undefined) {
    query.isPro = String(filters.isPro) === 'true';
  }

  if (filters.isBanned !== undefined) {
    query.isBanned = String(filters.isBanned) === 'true';
  }

  if (filters.isDeleted !== undefined) {
    query.isDeleted = String(filters.isDeleted) === 'true';
  }

  if (filters.tier) {
    query.tier = filters.tier;
  }

  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

const banUser = async (userId, adminId, reason) => {
  const admin = await User.findById(adminId);
  if (!admin || admin.role !== 'admin') {
    throw new ApiError(403, 'Admin access required');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.role === 'admin') {
    throw new ApiError(400, 'Admin users cannot be banned');
  }

  user.isBanned = true;
  user.bannedAt = new Date();
  user.bannedReason = reason;
  user.refreshToken = null;

  await user.save();

  if (user.email) {
    await emailService.sendEmail(
      user.email,
      'Your TechMates account has been suspended',
      `Your account has been suspended. Reason: ${reason}`,
      `<p>Your account has been suspended.</p><p><strong>Reason:</strong> ${reason}</p>`
    );
  }

  return user;
};

const unbanUser = async (userId, adminId) => {
  const admin = await User.findById(adminId);
  if (!admin || admin.role !== 'admin') {
    throw new ApiError(403, 'Admin access required');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.isBanned = false;
  user.bannedAt = null;
  user.bannedReason = null;
  await user.save();

  if (user.email) {
    await emailService.sendEmail(
      user.email,
      'Your TechMates account has been reinstated',
      'Your account suspension has been removed. You can now continue using TechMates.',
      '<p>Your account suspension has been removed. You can now continue using TechMates.</p>'
    );
  }

  return user;
};

const verifyUser = async (userId, adminId) => {
  const admin = await User.findById(adminId);
  if (!admin || admin.role !== 'admin') {
    throw new ApiError(403, 'Admin access required');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.kycVerified = true;
  user.kycPaidAt = new Date();
  await user.save();

  return user;
};

const deleteUser = async (userId, adminId) => {
  const admin = await User.findById(adminId);
  if (!admin || admin.role !== 'admin') {
    throw new ApiError(403, 'Admin access required');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.isDeleted = true;
  user.deletedAt = new Date();
  user.refreshToken = null;
  await user.save();

  return { success: true };
};

const getPendingListings = async (pagination = {}) => {
  return listingService.getPendingListings(pagination);
};

const approveListingAdmin = async (listingId, adminId) => {
  return listingService.adminApproveListing(listingId, adminId);
};

const rejectListingAdmin = async (listingId, adminId, reason) => {
  return listingService.adminRejectListing(listingId, adminId, reason);
};

const getAllDisputes = async (filters = {}, pagination = {}) => {
  const { page, limit, skip } = normalizePagination(pagination);

  const query = {};
  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.type) {
    query.type = filters.type;
  }

  const [disputes, total] = await Promise.all([
    Dispute.find(query)
      .populate('raisedBy', 'name email role')
      .populate('againstUserId', 'name email role')
      .populate('purchaseId')
      .populate('contractId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Dispute.countDocuments(query),
  ]);

  return {
    disputes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

const getDisputeById = async (disputeId) => {
  const dispute = await Dispute.findById(disputeId)
    .populate('raisedBy', 'name email role avatar')
    .populate('againstUserId', 'name email role avatar')
    .populate({
      path: 'purchaseId',
      populate: [
        { path: 'buyerId', select: 'name email role avatar' },
        { path: 'sellerId', select: 'name email role avatar' },
        { path: 'listingId', select: 'title slug category type' },
      ],
    })
    .populate({
      path: 'contractId',
      populate: [
        { path: 'clientId', select: 'name email role avatar' },
        { path: 'developerId', select: 'name email role avatar' },
      ],
    })
    .populate('resolvedBy', 'name email role');

  if (!dispute) {
    throw new ApiError(404, 'Dispute not found');
  }

  return dispute;
};

const getPlatformAnalytics = async (period = 'month') => {
  const { start, end } = getDateRangeFromPeriod(period);

  const [
    totalUsers,
    newThisPeriod,
    developers,
    clients,
    proUsers,
    totalCommissionAgg,
    seMarketCommissionAgg,
    projectMarketCommissionAgg,
    subscriptionRevenueAgg,
    thisPeriodRevenueAgg,
    transactionStats,
    seCounts,
    projectCounts,
    topDevelopers,
    topListings,
  ] = await Promise.all([
    User.countDocuments({ isDeleted: { $ne: true } }),
    User.countDocuments({ createdAt: { $gte: start, $lte: end }, isDeleted: { $ne: true } }),
    User.countDocuments({ role: 'developer', isDeleted: { $ne: true } }),
    User.countDocuments({ role: 'client', isDeleted: { $ne: true } }),
    User.countDocuments({ isPro: true, isDeleted: { $ne: true } }),
    Transaction.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: null, total: { $sum: '$platformFee' } } },
    ]),
    Transaction.aggregate([
      {
        $match: {
          isDeleted: { $ne: true },
          type: { $in: ['milestone_payment', 'milestone_release'] },
        },
      },
      { $group: { _id: null, total: { $sum: '$platformFee' } } },
    ]),
    Purchase.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      { $group: { _id: null, total: { $sum: '$platformFee' } } },
    ]),
    Subscription.aggregate([
      { $match: { status: { $in: ['active', 'cancelled', 'past_due', 'unpaid', 'trialing'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Purchase.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, isDeleted: { $ne: true } } },
      { $group: { _id: null, total: { $sum: '$platformFee' } } },
    ]),
    Promise.all([
      Purchase.countDocuments({ isDeleted: { $ne: true } }),
      Purchase.countDocuments({ status: 'completed', isDeleted: { $ne: true } }),
      Purchase.countDocuments({ status: 'disputed', isDeleted: { $ne: true } }),
      Purchase.countDocuments({ status: 'refunded', isDeleted: { $ne: true } }),
      Purchase.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]),
    Promise.all([
      Requirement.countDocuments({ isDeleted: { $ne: true } }),
      Requirement.countDocuments({ status: 'open', isDeleted: { $ne: true } }),
      Proposal.countDocuments({ isDeleted: { $ne: true } }),
      Contract.countDocuments({ isDeleted: { $ne: true } }),
      Contract.countDocuments({ status: 'active', isDeleted: { $ne: true } }),
      Contract.countDocuments({ status: 'completed', isDeleted: { $ne: true } }),
    ]),
    Promise.all([
      ProjectListing.countDocuments({ isDeleted: { $ne: true } }),
      ProjectListing.countDocuments({ status: 'active', isDeleted: { $ne: true } }),
      Purchase.countDocuments({ isDeleted: { $ne: true } }),
      Purchase.aggregate([
        { $match: { status: 'completed', isDeleted: { $ne: true } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]),
    User.find({ role: 'developer', isDeleted: { $ne: true } })
      .select('name avatar totalEarnings tier')
      .sort({ totalEarnings: -1 })
      .limit(5)
      .lean(),
    ProjectListing.find({ isDeleted: { $ne: true } })
      .select('title purchases avgRating')
      .sort({ purchases: -1 })
      .limit(5)
      .lean(),
  ]);

  const [txTotal, txCompleted, txDisputed, txRefunded, txVolumeAgg] = transactionStats;
  const [
    totalRequirements,
    activeRequirements,
    totalProposals,
    totalContracts,
    activeContracts,
    completedContracts,
  ] = seCounts;
  const [totalListings, activeListings, totalPurchases, totalSalesAgg] = projectCounts;

  return {
    users: {
      total: totalUsers,
      newThisPeriod,
      developers,
      clients,
      proUsers,
    },
    revenue: {
      totalCommission: totalCommissionAgg[0]?.total || 0,
      seMarketCommission: seMarketCommissionAgg[0]?.total || 0,
      projectMarketCommission: projectMarketCommissionAgg[0]?.total || 0,
      subscriptionRevenue: subscriptionRevenueAgg[0]?.total || 0,
      thisPeriod: thisPeriodRevenueAgg[0]?.total || 0,
    },
    transactions: {
      total: txTotal,
      completed: txCompleted,
      disputed: txDisputed,
      refunded: txRefunded,
      totalVolume: txVolumeAgg[0]?.total || 0,
    },
    seMarket: {
      totalRequirements,
      activeRequirements,
      totalProposals,
      totalContracts,
      activeContracts,
      completedContracts,
    },
    projectMarket: {
      totalListings,
      activeListings,
      totalPurchases,
      totalSales: totalSalesAgg[0]?.total || 0,
    },
    topDevelopers,
    topListings,
  };
};

const getRevenueChart = async (period = 'month') => {
  if (!['week', 'month', 'year'].includes(period)) {
    throw new ApiError(400, 'period must be week, month, or year');
  }

  const { start, end } = getDateRangeFromPeriod(period);
  const dateFormat = period === 'year' ? '%Y-%m' : '%Y-%m-%d';

  const [commissionRows, subscriptionRows] = await Promise.all([
    Purchase.aggregate([
      { $match: { isDeleted: { $ne: true }, createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          commission: { $sum: '$platformFee' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Subscription.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          subscriptions: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const map = new Map();

  for (const row of commissionRows) {
    map.set(row._id, {
      date: row._id,
      commission: row.commission || 0,
      subscriptions: 0,
      total: row.commission || 0,
    });
  }

  for (const row of subscriptionRows) {
    const existing = map.get(row._id) || {
      date: row._id,
      commission: 0,
      subscriptions: 0,
      total: 0,
    };

    existing.subscriptions = row.subscriptions || 0;
    existing.total = existing.commission + existing.subscriptions;
    map.set(row._id, existing);
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
};

module.exports = {
  getAllUsers,
  banUser,
  unbanUser,
  verifyUser,
  deleteUser,
  getPendingListings,
  approveListingAdmin,
  rejectListingAdmin,
  getAllDisputes,
  getDisputeById,
  getPlatformAnalytics,
  getRevenueChart,
};
