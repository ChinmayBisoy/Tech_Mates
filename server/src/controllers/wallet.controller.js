const Wallet = require('../models/wallet.model');
const Transaction = require('../models/transaction.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const getWallet = asyncHandler(async (req, res) => {
  let wallet = await Wallet.findOne({ userId: req.user._id });

  if (!wallet) {
    wallet = await Wallet.create({ userId: req.user._id });
  }

  res.json(new ApiResponse(200, wallet, 'Wallet fetched successfully'));
});

const getTransactions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type, status } = req.query;

  const skip = (page - 1) * limit;
  const query = { userId: req.user._id };

  if (type) {
    query.type = type;
  }
  if (status) {
    query.status = status;
  }

  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Transaction.countDocuments(query),
  ]);

  res.json(new ApiResponse(200, {
    transactions,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
    },
  }, 'Transactions fetched successfully'));
});

const createTransaction = asyncHandler(async (req, res) => {
  const { type, amount, description, referenceType, reference } = req.body;

  if (!type || !amount || !description) {
    throw new ApiError(400, 'type, amount, and description are required');
  }

  if (amount <= 0) {
    throw new ApiError(400, 'Amount must be greater than 0');
  }

  let wallet = await Wallet.findOne({ userId: req.user._id });

  if (!wallet) {
    wallet = await Wallet.create({ userId: req.user._id });
  }

  if (type === 'debit' && wallet.balance < amount) {
    throw new ApiError(400, 'Insufficient wallet balance');
  }

  // Update wallet
  if (type === 'credit') {
    wallet.balance += amount;
    wallet.totalEarnings += amount;
  } else if (type === 'debit') {
    wallet.balance -= amount;
    wallet.totalSpent += amount;
  }

  await wallet.save();

  // Create transaction
  const transaction = await Transaction.create({
    userId: req.user._id,
    type,
    amount,
    description,
    referenceType,
    reference,
    status: 'completed',
  });

  res.status(201).json(new ApiResponse(201, transaction, 'Transaction created successfully'));
});

const requestWithdrawal = asyncHandler(async (req, res) => {
  const { amount, bankAccount } = req.body;

  if (!amount || !bankAccount) {
    throw new ApiError(400, 'amount and bankAccount are required');
  }

  const wallet = await Wallet.findOne({ userId: req.user._id });

  if (!wallet || wallet.balance < amount) {
    throw new ApiError(400, 'Insufficient wallet balance');
  }

  // Deduct from balance
  wallet.balance -= amount;
  await wallet.save();

  // Create withdrawal transaction
  const transaction = await Transaction.create({
    userId: req.user._id,
    type: 'debit',
    amount,
    description: `Withdrawal to bank account ending in ${bankAccount.slice(-4)}`,
    referenceType: 'withdrawal',
    status: 'pending',
    paymentMethod: 'bank_transfer',
    metadata: { bankAccount },
  });

  res.status(201).json(new ApiResponse(201, transaction, 'Withdrawal requested successfully'));
});

const depositFunds = asyncHandler(async (req, res) => {
  const { amount, paymentMethodId } = req.body;

  if (!amount || !paymentMethodId) {
    throw new ApiError(400, 'amount and paymentMethodId are required');
  }

  if (amount <= 0) {
    throw new ApiError(400, 'Amount must be greater than 0');
  }

  // In production, integrate with Stripe
  // For now, create a pending transaction
  
  const transaction = await Transaction.create({
    userId: req.user._id,
    type: 'credit',
    amount,
    description: `Deposit to wallet`,
    referenceType: 'deposit',
    status: 'pending',
    paymentMethod: 'stripe',
    metadata: { paymentMethodId },
  });

  res.status(201).json(new ApiResponse(201, transaction, 'Deposit initiated successfully'));
});

module.exports = {
  getWallet,
  getTransactions,
  createTransaction,
  requestWithdrawal,
  depositFunds,
};
