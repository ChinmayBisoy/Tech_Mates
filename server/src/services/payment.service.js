const Transaction = require('../models/transaction.model');
const User = require('../models/user.model');
const Wallet = require('../models/wallet.model');
const Withdrawal = require('../models/withdrawal.model');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');

const normalizePagination = (pagination = {}) => {
  console.log('[normalizePagination] Input:', pagination);
  const parsedPage = Number.parseInt(pagination.page, 10);
  const parsedLimit = Number.parseInt(pagination.limit, 10);

  const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const limit = Number.isNaN(parsedLimit) || parsedLimit < 1 ? 10 : Math.min(parsedLimit, 50);

  const result = { page, limit, skip: (page - 1) * limit };
  console.log('[normalizePagination] Output:', result);
  return result;
};

const getEarnings = async (developerId, pagination = {}) => {
  try {
    console.log('[getEarnings SERVICE] START - developerId:', developerId);
    const { page, limit, skip } = normalizePagination(pagination);
    
    // Convert to ObjectId for database queries
    let developerObjectId;
    try {
      developerObjectId = mongoose.Types.ObjectId.isValid(developerId) 
        ? new mongoose.Types.ObjectId(developerId) 
        : developerId;
      console.log('[getEarnings SERVICE] Converted developerId to:', developerObjectId);
    } catch (e) {
      console.log('[getEarnings SERVICE] Could not convert to ObjectId, using string');
      developerObjectId = developerId;
    }

    // Step 1: Just try to find transactions
    console.log('[getEarnings SERVICE] Fetching transactions...');
    const transactions = await Transaction.find({ developerId: developerObjectId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    console.log('[getEarnings SERVICE] Found transactions:', transactions.length);

   const total = await Transaction.countDocuments({ developerId: developerObjectId, isDeleted: false });
    console.log('[getEarnings SERVICE] Total transaction count:', total);

    // Step 2: Calculate earnings - start simple
    const summary = {
      totalEarnings: 0,
      pendingEarnings: 0,
      thisMonthEarnings: 0,
    };

    // Calculate from transactions array if we have data
    if (transactions.length > 0) {
      transactions.forEach(tx => {
        if (tx.status === 'released') {
          summary.totalEarnings += tx.developerEarnings || 0;
        }
        if (tx.status === 'held') {
          summary.pendingEarnings += tx.developerEarnings || 0;
        }
      });
    }

    console.log('[getEarnings SERVICE] Final summary:', summary);

    const result = {
      summary,
      transactions: transactions || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };

    console.log('[getEarnings SERVICE] Returning:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('[getEarnings SERVICE] CRITICAL ERROR:', error.message);
    console.error('[getEarnings SERVICE] Stack:', error.stack);
    throw error;
  }
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

/**
 * Verify milestone payment (after Stripe confirms payment)
 * Credits developer wallet with 90% of payment
 */
const verifyMilestonePayment = async (transactionId) => {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) {
    throw new ApiError(404, 'Transaction not found');
  }

  if (transaction.status !== 'held') {
    throw new ApiError(400, 'Transaction is not in held status');
  }

  // Update transaction status
  transaction.status = 'released';
  await transaction.save();

  // Credit developer wallet (90%)
  const developer = await User.findById(transaction.developerId);
  if (!developer) {
    throw new ApiError(404, 'Developer not found');
  }

  developer.walletBalance = (developer.walletBalance || 0) + transaction.developerEarnings;
  developer.totalEarnings = (developer.totalEarnings || 0) + transaction.developerEarnings;
  await developer.save();

  return {
    success: true,
    developerEarnings: transaction.developerEarnings,
    totalEarnings: developer.totalEarnings,
  };
};

/**
 * Initiate withdrawal request
 */
const initiateWithdrawal = async (userId, amount, accountType, accountDetails) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Verify minimum amount
  if (amount < 500) {
    throw new ApiError(400, 'Minimum withdrawal amount is ₹500');
  }

  // Verify maximum amount (cannot exceed wallet balance)
  if ((user.walletBalance || 0) < amount) {
    throw new ApiError(400, 'Insufficient wallet balance');
  }

  // Create withdrawal record
  const withdrawal = await Withdrawal.create({
    userId,
    amount,
    accountType,
    accountDetails,
    status: 'pending',
    metadata: {
      initiatedFrom: 'web',
    },
  });

  // Deduct from wallet immediately (hold the funds)
  user.walletBalance = (user.walletBalance || 0) - amount;
  await user.save();

  return {
    success: true,
    withdrawalId: withdrawal._id,
    status: 'pending',
    message: 'Withdrawal initiated. Processing may take 2-5 business days.',
  };
};

/**
 * Get withdrawal history
 */
const getWithdrawalHistory = async (userId, page = 1, limit = 10) => {
  const { skip } = normalizePagination({ page, limit });

  const [withdrawals, total] = await Promise.all([
    Withdrawal.find({ userId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Withdrawal.countDocuments({ userId, isDeleted: false }),
  ]);

  return {
    withdrawals,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get transaction history
 */
const getTransactionHistory = async (userId, page = 1, limit = 10, type) => {
  const { skip } = normalizePagination({ page, limit });

  const filter = {
    $or: [{ clientId: userId }, { developerId: userId }],
    isDeleted: false,
  };

  if (type) {
    filter.type = type;
  }

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('clientId', 'name avatar')
      .populate('developerId', 'name avatar')
      .lean(),
    Transaction.countDocuments(filter),
  ]);

  return {
    transactions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Process withdrawal (mark as completed)
 */
const processWithdrawal = async (withdrawalId, razorpayTransactionId) => {
  const withdrawal = await Withdrawal.findById(withdrawalId);
  if (!withdrawal) {
    throw new ApiError(404, 'Withdrawal not found');
  }

  if (withdrawal.status !== 'pending') {
    throw new ApiError(400, `Cannot process withdrawal with status: ${withdrawal.status}`);
  }

  // Mark as processing
  withdrawal.status = 'processing';
  withdrawal.razorpayPayoutId = razorpayTransactionId;
  withdrawal.processedAt = new Date();

  // Create transaction record
  const transaction = await Transaction.create({
    developerId: withdrawal.userId,
    amount: withdrawal.amount,
    type: 'milestone_release',
    status: 'released',
    metadata: {
      withdrawalId: withdrawal._id,
      accountType: withdrawal.accountType,
    },
  });

  withdrawal.transactionId = transaction._id;
  await withdrawal.save();

  return {
    success: true,
    withdrawalId: withdrawal._id,
    status: 'processing',
    message: 'Withdrawal is being processed. Expected to complete in 2-5 business days.',
  };
};

/**
 * Cancel withdrawal (refund to wallet)
 */
const cancelWithdrawal = async (withdrawalId, reason) => {
  const withdrawal = await Withdrawal.findById(withdrawalId);
  if (!withdrawal) {
    throw new ApiError(404, 'Withdrawal not found');
  }

  if (!['pending', 'processing'].includes(withdrawal.status)) {
    throw new ApiError(400, `Cannot cancel withdrawal with status: ${withdrawal.status}`);
  }

  const user = await User.findById(withdrawal.userId);
  if (user) {
    // Refund to wallet
    user.walletBalance = (user.walletBalance || 0) + withdrawal.amount;
    await user.save();
  }

  withdrawal.status = 'cancelled';
  withdrawal.cancelReason = reason;
  withdrawal.cancelledAt = new Date();
  await withdrawal.save();

  return {
    success: true,
    withdrawalId: withdrawal._id,
    refundAmount: withdrawal.amount,
    message: 'Withdrawal cancelled and funds refunded to wallet.',
  };
};

module.exports = {
  getEarnings,
  requestPayout,
  verifyMilestonePayment,
  initiateWithdrawal,
  getWithdrawalHistory,
  getTransactionHistory,
  processWithdrawal,
  cancelWithdrawal,
};
