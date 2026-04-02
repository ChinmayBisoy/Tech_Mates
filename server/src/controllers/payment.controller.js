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

module.exports = {
  fundMilestone,
  releaseMilestone,
  refundMilestone,
  getEarnings,
  requestPayout,
  handleWebhook,
};
