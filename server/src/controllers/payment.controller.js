const stripe = require('../config/stripe');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Transaction = require('../models/transaction.model');
const escrowService = require('../services/escrow.service');
const paymentService = require('../services/payment.service');
const purchaseService = require('../services/purchase.service');

const fundMilestone = asyncHandler(async (req, res) => {
  const { contractId, milestoneId } = req.validatedBody || req.body;

  const result = await escrowService.fundMilestone(contractId, milestoneId, req.user._id);

  res.json(
    new ApiResponse(
      200,
      {
        clientSecret: result.clientSecret,
        transaction: result.transaction,
      },
      'Milestone funded successfully'
    )
  );
});

const releaseMilestone = asyncHandler(async (req, res) => {
  const { contractId, milestoneId } = req.body;

  if (!contractId || !milestoneId) {
    throw new ApiError(400, 'contractId and milestoneId are required');
  }

  const result = await escrowService.releaseMilestone(contractId, milestoneId, req.user._id);

  res.json(new ApiResponse(200, result, 'Milestone payment released successfully'));
});

const refundMilestone = asyncHandler(async (req, res) => {
  const { contractId, milestoneId } = req.body;

  if (!contractId || !milestoneId) {
    throw new ApiError(400, 'contractId and milestoneId are required');
  }

  const refund = await escrowService.refundMilestone(contractId, milestoneId, req.user._id);

  res.json(new ApiResponse(200, refund, 'Milestone refunded successfully'));
});

const getEarnings = asyncHandler(async (req, res) => {
  const result = await paymentService.getEarnings(req.user._id, req.query);

  res.json(new ApiResponse(200, result, 'Earnings fetched successfully'));
});

const requestPayout = asyncHandler(async (req, res) => {
  const { amount } = req.validatedBody || req.body;

  const result = await paymentService.requestPayout(req.user._id, amount);

  res.json(new ApiResponse(200, result, 'Payout requested successfully'));
});

const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    res.json({ received: true });
    return;
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    console.log(`[WEBHOOK_IGNORED] Signature verification failed: ${error.message}`);
    res.json({ received: true });
    return;
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    const update = {
      status: 'held',
    };

    if (paymentIntent.latest_charge) {
      update.stripeChargeId = String(paymentIntent.latest_charge);
    }

    await Transaction.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id, isDeleted: false },
      update,
      { new: true }
    );
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;

    await Transaction.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id, isDeleted: false },
      {
        status: 'failed',
      },
      { new: true }
    );

    console.log(`[PAYMENT_FAILED] Payment failed for paymentIntentId=${paymentIntent.id}`);
  }

  if (event.type === 'charge.refunded') {
    const charge = event.data.object;

    await Transaction.findOneAndUpdate(
      {
        $or: [
          { stripeChargeId: charge.id },
          { stripePaymentIntentId: charge.payment_intent },
        ],
        isDeleted: false,
      },
      {
        status: 'refunded',
        stripeChargeId: charge.id,
      },
      { new: true }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    if (session.payment_intent) {
      try {
        await purchaseService.confirmPurchase(String(session.payment_intent));
      } catch (error) {
        console.log(`[PURCHASE_CONFIRMATION_ERROR] ${error.message}`);
      }
    }
  }

  res.json({ received: true });
});

/**
 * Verify milestone payment (called after Stripe confirms payment)
 * Updates milestone status and credits developer wallet
 */
const verifyMilestonePayment = asyncHandler(async (req, res) => {
  const { transactionId } = req.body;

  if (!transactionId) {
    throw new ApiError(400, 'Transaction ID is required');
  }

  const result = await escrowService.verifyMilestonePayment(transactionId);

  res.json(
    new ApiResponse(200, result, 'Milestone payment verified and credited successfully')
  );
});

/**
 * Initiate withdrawal request (developer withdraws from wallet to bank)
 * Creates withdrawal request in pending status
 */
const initiateWithdrawal = asyncHandler(async (req, res) => {
  const { amount, accountType, accountDetails } = req.body;
  const userId = req.user._id;

  // Validate required fields
  if (!amount || amount <= 0) {
    throw new ApiError(400, 'Valid amount is required (minimum ₹500)');
  }

  if (!accountType || !['bank', 'upi'].includes(accountType)) {
    throw new ApiError(400, 'Account type must be bank or upi');
  }

  // Check KYC status
  if (req.user?.kyc?.status !== 'verified') {
    throw new ApiError(400, 'KYC verification is required to withdraw funds');
  }

  // Check sufficient balance
  if ((req.user.walletBalance || 0) < amount) {
    throw new ApiError(400, 'Insufficient wallet balance');
  }

  // Use payment service to initiate withdrawal
  const result = await paymentService.initiateWithdrawal(
    userId,
    amount,
    accountType,
    accountDetails
  );

  res.json(
    new ApiResponse(200, result, `Withdrawal of ₹${amount} initiated. Processing may take 2-5 business days.`)
  );
});

/**
 * Get withdrawal history
 */
const getWithdrawalHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const result = await paymentService.getWithdrawalHistory(req.user._id, page, limit);

  res.json(
    new ApiResponse(200, result, 'Withdrawal history fetched successfully')
  );
});

/**
 * Get payment/transaction history
 */
const getTransactionHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type } = req.query;

  const result = await paymentService.getTransactionHistory(req.user._id, page, limit, type);

  res.json(
    new ApiResponse(200, result, 'Transaction history fetched successfully')
  );
});

/**
 * Admin: Process withdrawal (mark as completed)
 */
const processWithdrawal = asyncHandler(async (req, res) => {
  const { withdrawalId, transactionId } = req.body;

  if (!withdrawalId) {
    throw new ApiError(400, 'Withdrawal ID is required');
  }

  const result = await paymentService.processWithdrawal(withdrawalId, transactionId);

  res.json(
    new ApiResponse(200, result, 'Withdrawal processed successfully')
  );
});

/**
 * Admin: Reject/cancel withdrawal
 */
const cancelWithdrawal = asyncHandler(async (req, res) => {
  const { withdrawalId, reason } = req.body;

  if (!withdrawalId) {
    throw new ApiError(400, 'Withdrawal ID is required');
  }

  const result = await paymentService.cancelWithdrawal(withdrawalId, reason);

  res.json(
    new ApiResponse(200, result, 'Withdrawal cancelled and funds refunded')
  );
});

module.exports = {
  fundMilestone,
  releaseMilestone,
  refundMilestone,
  getEarnings,
  requestPayout,
  verifyMilestonePayment,
  initiateWithdrawal,
  getWithdrawalHistory,
  getTransactionHistory,
  processWithdrawal,
  cancelWithdrawal,
  handleWebhook,
};
