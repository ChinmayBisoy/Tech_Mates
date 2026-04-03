const stripe = require('../config/stripe');
const User = require('../models/user.model');
const Subscription = require('../models/subscription.model');
const ApiError = require('../utils/ApiError');
const emailService = require('./email.service');

const unixToDate = (value) => (value ? new Date(value * 1000) : null);

// Plan pricing configuration in paise (100 paise = ₹1)
const PLAN_CONFIG = {
  free: {
    priceId: null, // No Stripe charge for free tier
    amountPaise: 0, // ₹0
  },
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    amountPaise: 8390000, // ₹839 = 83,900 paise
  },
  max: {
    priceId: process.env.STRIPE_MAX_PRICE_ID,
    amountPaise: 41450000, // ₹4,145 = 414,500 paise
  },
};

const resolvePlanConfig = (planId) => {
  if (!['free', 'pro', 'max'].includes(planId)) {
    throw new ApiError(400, 'Invalid plan selected');
  }

  const config = PLAN_CONFIG[planId];
  if (!config) {
    throw new ApiError(500, 'Plan configuration not found');
  }

  // For paid tiers, Stripe price ID must be configured
  if (planId !== 'free' && !config.priceId) {
    throw new ApiError(500, `Stripe price is not configured for ${planId} plan`);
  }

  return config;
};

const createSubscription = async (userId, planId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const config = resolvePlanConfig(planId);

  // For free tier, no Stripe payment needed
  if (planId === 'free') {
    const subscription = await Subscription.create({
      userId,
      stripeSubscriptionId: `free-${Date.now()}`, // Generate mock ID for free tier
      stripeCustomerId: 'free-tier',
      plan: planId,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year for free tier
      cancelAtPeriodEnd: false,
      priceId: null,
      amount: 0,
    });

    user.subscription = planId;
    user.subscriptionId = subscription._id;
    user.subscriptionStatus = 'active';
    await user.save();

    return {
      subscription,
      message: 'Free tier subscription activated',
    };
  }

  // For paid tiers, create Stripe subscription
  let stripeCustomerId = user.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: String(user._id),
      },
    });

    stripeCustomerId = customer.id;
    user.stripeCustomerId = stripeCustomerId;
  }

  const stripeSubscription = await stripe.subscriptions.create({
    customer: stripeCustomerId,
    items: [{ price: config.priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });

  const currentPeriodStart = unixToDate(stripeSubscription.current_period_start);
  const currentPeriodEnd = unixToDate(stripeSubscription.current_period_end);

  const subscription = await Subscription.create({
    userId,
    stripeSubscriptionId: stripeSubscription.id,
    stripeCustomerId,
    plan: planId,
    status: 'active',
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd: Boolean(stripeSubscription.cancel_at_period_end),
    priceId: config.priceId,
    amount: config.amountPaise / 100, // Convert paise to rupees for storage
  });

  user.subscription = planId;
  user.subscriptionId = subscription._id;
  user.subscriptionStatus = 'active';
  user.subscriptionExpiresAt = currentPeriodEnd;
  await user.save();

  const clientSecret = stripeSubscription.latest_invoice?.payment_intent?.client_secret;

  return {
    clientSecret,
    subscription,
    message: `${planId} subscription created successfully`,
  };
};

const cancelSubscription = async (userId) => {
  const subscription = await Subscription.findOne({ userId, status: { $ne: 'cancelled' } }).sort({ createdAt: -1 });

  if (!subscription) {
    throw new ApiError(404, 'Active subscription not found');
  }

  // For free tier, just mark as cancelled
  if (subscription.plan === 'free') {
    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    await subscription.save();

    const user = await User.findById(userId);
    if (user) {
      user.subscription = null;
      user.subscriptionId = null;
      user.subscriptionStatus = null;
      await user.save();
    }

    return {
      message: 'Free tier subscription cancelled',
    };
  }

  // For paid tiers, use Stripe
  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  subscription.cancelAtPeriodEnd = true;
  await subscription.save();

  const user = await User.findById(userId);
  if (user?.email) {
    await emailService.sendEmail(
      user.email,
      `TechMates ${subscription.plan} subscription cancellation scheduled`,
      `Your subscription will end at period end: ${subscription.currentPeriodEnd}`,
      `<p>Your subscription will end at period end: <strong>${subscription.currentPeriodEnd}</strong></p>`
    );
  }

  return {
    message: 'Subscription will end at period end',
    endsAt: subscription.currentPeriodEnd,
  };
};

const handleSubscriptionWebhook = async (event) => {
  if (event.type === 'customer.subscription.updated') {
    const stripeSub = event.data.object;
    const subscription = await Subscription.findOne({ stripeSubscriptionId: stripeSub.id });

    if (!subscription) {
      return;
    }

    subscription.status = stripeSub.status;
    subscription.currentPeriodStart = unixToDate(stripeSub.current_period_start);
    subscription.currentPeriodEnd = unixToDate(stripeSub.current_period_end);
    subscription.cancelAtPeriodEnd = Boolean(stripeSub.cancel_at_period_end);

    if (stripeSub.cancel_at_period_end) {
      subscription.cancelledAt = stripeSub.canceled_at ? unixToDate(stripeSub.canceled_at) : subscription.cancelledAt;
    }

    await subscription.save();

    const user = await User.findById(subscription.userId);
    if (user && stripeSub.status === 'active') {
      user.isPro = true;
      user.proExpiresAt = subscription.currentPeriodEnd;
      await user.save();
    }

    return;
  }

  if (event.type === 'customer.subscription.deleted') {
    const stripeSub = event.data.object;
    const subscription = await Subscription.findOne({ stripeSubscriptionId: stripeSub.id });

    if (!subscription) {
      return;
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    subscription.currentPeriodEnd = unixToDate(stripeSub.current_period_end) || subscription.currentPeriodEnd;
    await subscription.save();

    const user = await User.findById(subscription.userId);
    if (user) {
      user.isPro = false;
      user.proSubscriptionId = null;
      user.proExpiresAt = null;
      user.proGracePeriodEndsAt = null;
      await user.save();

      if (user.email) {
        await emailService.sendEmail(
          user.email,
          'TechMates Pro ended',
          'Your Pro subscription has ended.',
          '<p>Your Pro subscription has ended.</p>'
        );
      }
    }

    return;
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;

    if (!subscriptionId) {
      return;
    }

    const subscription = await Subscription.findOne({ stripeSubscriptionId: subscriptionId });
    if (!subscription) {
      return;
    }

    subscription.status = 'past_due';
    subscription.gracePeriodEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    await subscription.save();

    const user = await User.findById(subscription.userId);
    if (user) {
      user.proGracePeriodEndsAt = subscription.gracePeriodEndsAt;
      await user.save();

      if (user.email) {
        await emailService.sendEmail(
          user.email,
          'TechMates Pro payment failed',
          'Your subscription payment failed. Please update payment method within 3 days to avoid interruption.',
          '<p>Your subscription payment failed. Please update payment method within <strong>3 days</strong> to avoid interruption.</p>'
        );
      }
    }

    return;
  }

  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;

    if (!subscriptionId) {
      return;
    }

    const subscription = await Subscription.findOne({ stripeSubscriptionId: subscriptionId });
    if (!subscription) {
      return;
    }

    const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);

    subscription.status = 'active';
    subscription.currentPeriodStart = unixToDate(stripeSub.current_period_start);
    subscription.currentPeriodEnd = unixToDate(stripeSub.current_period_end);
    subscription.gracePeriodEndsAt = null;
    await subscription.save();

    const user = await User.findById(subscription.userId);
    if (user) {
      user.isPro = true;
      user.proGracePeriodEndsAt = null;
      user.proExpiresAt = subscription.currentPeriodEnd;
      user.proSubscriptionId = subscription.stripeSubscriptionId;
      await user.save();
    }
  }
};

const getSubscription = async (userId) => {
  const subscription = await Subscription.findOne({ userId }).sort({ createdAt: -1 });

  if (!subscription) {
    throw new ApiError(404, 'Subscription not found');
  }

  return {
    plan: subscription.plan,
    status: subscription.status,
    nextBillingDate: subscription.currentPeriodEnd,
    amount: subscription.amount,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    gracePeriodEndsAt: subscription.gracePeriodEndsAt,
  };
};

module.exports = {
  createSubscription,
  cancelSubscription,
  handleSubscriptionWebhook,
  getSubscription,
};
