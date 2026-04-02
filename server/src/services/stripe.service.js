const stripe = require('../config/stripe');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');

const createPaymentIntent = async (amount, currency = 'inr', metadata = {}) => {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new ApiError(400, 'Amount must be a positive integer in paise');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
};

const confirmPaymentIntent = async (paymentIntentId) => {
  if (!paymentIntentId) {
    throw new ApiError(400, 'paymentIntentId is required');
  }

  return stripe.paymentIntents.retrieve(paymentIntentId);
};

const createRefund = async (paymentIntentId, amount = null) => {
  if (!paymentIntentId) {
    throw new ApiError(400, 'paymentIntentId is required');
  }

  const payload = {
    payment_intent: paymentIntentId,
  };

  if (amount !== null) {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new ApiError(400, 'Refund amount must be a positive integer in paise');
    }
    payload.amount = amount;
  }

  return stripe.refunds.create(payload);
};

const transferToConnect = async (developerId, amount, currency = 'inr') => {
  if (!developerId) {
    throw new ApiError(400, 'developerId is required');
  }

  if (!Number.isInteger(amount) || amount <= 0) {
    throw new ApiError(400, 'Amount must be a positive integer in paise');
  }

  const developer = await User.findById(developerId);
  if (!developer) {
    throw new ApiError(404, 'Developer not found');
  }

  if (!developer.stripeConnectedAccountId) {
    throw new ApiError(400, 'Developer is not connected to Stripe');
  }

  return stripe.transfers.create({
    amount,
    currency,
    destination: developer.stripeConnectedAccountId,
    metadata: {
      developerId: String(developerId),
    },
  });
};

module.exports = {
  createPaymentIntent,
  confirmPaymentIntent,
  createRefund,
  transferToConnect,
};
