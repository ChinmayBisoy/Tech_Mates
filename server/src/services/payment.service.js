const Transaction = require('../models/transaction.model');
const User = require('../models/user.model');
const Wallet = require('../models/wallet.model');
const ApiError = require('../utils/ApiError');

const normalizePagination = (pagination = {}) => {
  const parsedPage = Number.parseInt(pagination.page, 10);
  const parsedLimit = Number.parseInt(pagination.limit, 10);

  const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const limit = Number.isNaN(parsedLimit) || parsedLimit < 1 ? 10 : Math.min(parsedLimit, 50);

  return { page, limit, skip: (page - 1) * limit };
};

const getEarnings = async (developerId, pagination = {}) => {
  const { page, limit, skip } = normalizePagination(pagination);

  const releasedFilter = {
    developerId,
    status: 'released',
    isDeleted: false,
    type: { $in: ['milestone_release', 'milestone_payment'] },
  };

  const pendingFilter = {
    developerId,
    status: 'held',
    isDeleted: false,
    type: 'milestone_payment',
  };

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [transactions, total, releasedAgg, pendingAgg, thisMonthAgg] = await Promise.all([
    Transaction.find({ developerId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Transaction.countDocuments({ developerId, isDeleted: false }),
    Transaction.aggregate([
      { $match: releasedFilter },
      { $group: { _id: null, total: { $sum: '$developerEarnings' } } },
    ]),
    Transaction.aggregate([
      { $match: pendingFilter },
      { $group: { _id: null, total: { $sum: '$developerEarnings' } } },
    ]),
    Transaction.aggregate([
      {
        $match: {
          ...releasedFilter,
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$developerEarnings' } } },
    ]),
  ]);

  const summary = {
    totalEarnings: releasedAgg[0]?.total || 0,
    pendingEarnings: pendingAgg[0]?.total || 0,
    thisMonthEarnings: thisMonthAgg[0]?.total || 0,
  };

  return {
    summary,
    transactions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

const requestPayout = async (developerId, amount) => {
  if (!Number.isInteger(amount) || amount < 50000) {
    throw new ApiError(400, 'Minimum payout amount is 50000 paise');
  }

  const developer = await User.findById(developerId);
  if (!developer) {
    throw new ApiError(404, 'Developer not found');
  }

  if (developer.kycVerified !== true) {
    throw new ApiError(403, 'KYC verification is required before payout');
  }

  const currentBalance = Number(developer.walletBalance || 0);
  if (currentBalance < amount) {
    throw new ApiError(400, 'Insufficient wallet balance');
  }

  developer.walletBalance = currentBalance - amount;
  await developer.save();

  const wallet = await Wallet.findOne({ userId: developerId });
  if (wallet) {
    if (Number(wallet.balance || 0) < amount) {
      throw new ApiError(400, 'Insufficient wallet balance');
    }

    wallet.balance = Number(wallet.balance || 0) - amount;
    await wallet.save();
  }

  await Transaction.create({
    developerId,
    amount,
    platformFee: 0,
    developerEarnings: amount,
    commissionRate: 0,
    status: 'released',
    type: 'milestone_release',
    metadata: {
      payoutRequest: true,
      requestedAt: new Date().toISOString(),
    },
  });

  return {
    success: true,
    remainingBalance: Number(developer.walletBalance || 0),
  };
};

module.exports = {
  getEarnings,
  requestPayout,
};
