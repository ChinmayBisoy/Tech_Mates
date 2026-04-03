const stripe = require('../config/stripe');
const razorpayService = require('../services/razorpay.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const Transaction = require('../models/transaction.model');
const escrowService = require('../services/escrow.service');
const paymentService = require('../services/payment.service');
const purchaseService = require('../services/purchase.service');
const User = require('../models/user.model');

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
  console.log('[getEarnings] ========== START ==========');
  console.log('[getEarnings] User ID:', req.user._id);
  console.log('[getEarnings] Query params:', req.query);
  
  const result = await paymentService.getEarnings(req.user._id, req.query);
  
  console.log('[getEarnings] SUCCESS - Result:', JSON.stringify(result, null, 2));
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

// ============ RAZORPAY PAYMENT METHODS ============

/**
 * Create Razorpay order for milestone payment
 * POST /api/payments/razorpay/create-order
 */
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { contractId, milestoneId, amount } = req.body;

  if (!contractId || !milestoneId || !amount) {
    throw new ApiError(400, 'contractId, milestoneId, and amount are required');
  }

  const order = await razorpayService.createOrder(amount, {
    contractId,
    milestoneId,
    clientId: req.user._id,
  });

  // Store transaction in DB
  const transaction = await Transaction.create({
    contractId,
    milestoneId,
    clientId: req.user._id,
    amount,
    platformFee: Math.floor(amount * 0.1), // 10% platform fee
    developerEarnings: Math.floor(amount * 0.9),
    razorpayOrderId: order.orderId,
    status: 'initiated',
    type: 'milestone_payment',
  });

  res.json(
    new ApiResponse(
      200,
      {
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        transactionId: transaction._id,
      },
      'Razorpay order created successfully'
    )
  );
});

/**
 * Verify Razorpay payment
 * POST /api/payments/razorpay/verify
 */
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, 'Missing required payment verification fields');
  }

  // Verify signature
  const isValid = razorpayService.verifyPaymentSignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isValid) {
    throw new ApiError(400, 'Payment verification failed. Invalid signature.');
  }

  // Fetch payment details
  const payment = await razorpayService.fetchPayment(razorpay_payment_id);

  if (payment.status !== 'captured') {
    throw new ApiError(400, 'Payment is not in captured status');
  }

  // Update transaction
  const transaction = await Transaction.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id, isDeleted: false },
    {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'released',
      verifiedAt: new Date(),
    },
    { new: true }
  );

  if (!transaction) {
    throw new ApiError(404, 'Transaction not found');
  }

  // Credit developer wallet
  const developer = await User.findById(transaction.developerId);
  if (developer) {
    developer.walletBalance = (developer.walletBalance || 0) + transaction.developerEarnings;
    developer.totalEarnings = (developer.totalEarnings || 0) + transaction.developerEarnings;
    await developer.save();
  }

  res.json(
    new ApiResponse(
      200,
      {
        transactionId: transaction._id,
        status: transaction.status,
        amount: transaction.amount,
      },
      'Payment verified and processed successfully'
    )
  );
});

/**
 * Create Razorpay order for subscription
 * POST /api/payments/razorpay/subscription
 */
const createSubscriptionOrder = asyncHandler(async (req, res) => {
  const { planId, amount } = req.body;

  if (!planId || !amount) {
    throw new ApiError(400, 'planId and amount are required');
  }

  const order = await razorpayService.createOrder(amount, {
    planId,
    userId: req.user._id,
    type: 'subscription',
  });

  res.json(
    new ApiResponse(
      200,
      {
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
      },
      'Subscription order created successfully'
    )
  );
});

/**
 * Create Razorpay order for payout request
 * POST /api/payments/razorpay/payout
 */
const createPayoutOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount < 50000) {
    throw new ApiError(400, 'Minimum payout amount is ₹500 (50000 paise)');
  }

  const developer = await User.findById(req.user._id);
  if (!developer || !developer.kycVerified) {
    throw new ApiError(403, 'KYC verification required for payout');
  }

  const availableBalance = developer.walletBalance || 0;
  if (availableBalance < amount) {
    throw new ApiError(400, 'Insufficient wallet balance');
  }

  const order = await razorpayService.createOrder(amount, {
    userId: req.user._id,
    type: 'payout',
    email: developer.email,
  });

  res.json(
    new ApiResponse(
      200,
      {
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
      },
      'Payout order created successfully'
    )
  );
});

/**
 * Razorpay Webhook Handler
 * POST /api/payments/razorpay/webhook
 */
const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];

  if (!signature) {
    throw new ApiError(400, 'Missing Razorpay signature');
  }

  // Verify webhook signature
  const isValid = razorpayService.verifyWebhookSignature(req.body, signature);

  if (!isValid) {
    console.log('[RAZORPAY_WEBHOOK] Invalid signature');
    res.json({ received: true });
    return;
  }

  const event = req.body.event;
  const payload = req.body.payload;

  console.log(`[RAZORPAY_WEBHOOK] Event: ${event}`);

  try {
    switch (event) {
      case 'payment.authorized':
        // Payment authorized but not captured
        console.log('[RAZORPAY_WEBHOOK] Payment authorized:', payload.payment.id);
        break;

      case 'payment.failed':
        // Payment failed
        const failedTransaction = await Transaction.findOneAndUpdate(
          { razorpayPaymentId: payload.payment.id, isDeleted: false },
          { status: 'failed' },
          { new: true }
        );
        console.log('[RAZORPAY_WEBHOOK] Payment failed:', payload.payment.id);
        break;

      case 'payment.captured':
        // Payment captured successfully
        const payment = payload.payment;
        
        await Transaction.findOneAndUpdate(
          { razorpayOrderId: payment.order_id, isDeleted: false },
          {
            razorpayPaymentId: payment.id,
            status: 'released',
            verifiedAt: new Date(),
          },
          { new: true }
        );

        console.log('[RAZORPAY_WEBHOOK] Payment captured:', payment.id);
        break;

      case 'refund.created':
        // Refund created
        const refund = payload.refund;
        
        await Transaction.findOneAndUpdate(
          { razorpayPaymentId: refund.payment_id, isDeleted: false },
          { status: 'refunded' },
          { new: true }
        );

        console.log('[RAZORPAY_WEBHOOK] Refund created:', refund.id);
        break;

      default:
        console.log(`[RAZORPAY_WEBHOOK] Unknown event: ${event}`);
    }
  } catch (error) {
    console.error('[RAZORPAY_WEBHOOK] Error processing webhook:', error);
  }

  res.json({ received: true });
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
  createRazorpayOrder,
  verifyRazorpayPayment,
  createSubscriptionOrder,
  createPayoutOrder,
  handleRazorpayWebhook,
};
