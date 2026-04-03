const stripe = require('../config/stripe');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const subscriptionService = require('../services/subscription.service');

const createSubscription = asyncHandler(async (req, res) => {
  const { planId } = req.validatedBody || req.body;
  const result = await subscriptionService.createSubscription(req.user._id, planId);

  res.json(new ApiResponse(200, result, 'Subscription created successfully'));
});

const cancelSubscription = asyncHandler(async (req, res) => {
  const result = await subscriptionService.cancelSubscription(req.user._id);
  res.json(new ApiResponse(200, result, 'Subscription cancellation scheduled'));
});

const getSubscription = asyncHandler(async (req, res) => {
  const subscription = await subscriptionService.getSubscription(req.user._id);
  res.json(new ApiResponse(200, subscription, 'Subscription fetched successfully'));
});

const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    throw new ApiError(400, 'Stripe signature or webhook secret is missing');
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    throw new ApiError(400, `Webhook signature verification failed: ${error.message}`);
  }

  await subscriptionService.handleSubscriptionWebhook(event);

  res.json(new ApiResponse(200, { received: true }, 'Webhook processed'));
});

module.exports = {
  createSubscription,
  cancelSubscription,
  getSubscription,
  handleWebhook,
};
