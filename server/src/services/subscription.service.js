const stripe = require('../config/stripe');
const User = require('../models/user.model');
const Subscription = require('../models/subscription.model');
const ApiError = require('../utils/ApiError');
const emailService = require('./email.service');

const unixToDate = (value) => (value ? new Date(value * 1000) : null);

const resolvePlanConfig = (plan) => {
  if (plan === 'monthly') {
    return {
      priceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
      amount: Number(process.env.STRIPE_PRO_MONTHLY_AMOUNT || 0),
    };
  }

  if (plan === 'yearly') {
    return {
      priceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
      amount: Number(process.env.STRIPE_PRO_YEARLY_AMOUNT || 0),
    };
  }

  throw new ApiError(400, 'Invalid plan selected');
};

const createSubscription = async (userId, plan) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (!['monthly', 'yearly'].includes(plan)) {
    throw new ApiError(400, 'Plan must be monthly or yearly');
  }

  const { priceId, amount } = resolvePlanConfig(plan);
  if (!priceId) {
    throw new ApiError(500, 'Stripe price is not configured for selected plan');
  }

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
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });

  const currentPeriodStart = unixToDate(stripeSubscription.current_period_start);
  const currentPeriodEnd = unixToDate(stripeSubscription.current_period_end);

  const subscription = await Subscription.create({
    userId,
    stripeSubscriptionId: stripeSubscription.id,
    stripeCustomerId,
    plan,
    status: 'active',
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd: Boolean(stripeSubscription.cancel_at_period_end),
    priceId,
    amount,
  });

  user.isPro = true;
  user.proSubscriptionId = stripeSubscription.id;
  user.proExpiresAt = currentPeriodEnd;
  user.proGracePeriodEndsAt = null;
  await user.save();

  const clientSecret = stripeSubscription.latest_invoice?.payment_intent?.client_secret;

  return {
    clientSecret,
    subscription,
  };
};

const cancelSubscription = async (userId) => {
  const subscription = await Subscription.findOne({ userId, status: { $ne: 'cancelled' } }).sort({ createdAt: -1 });

  if (!subscription) {
    throw new ApiError(404, 'Active subscription not found');
  }

  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  subscription.cancelAtPeriodEnd = true;
  await subscription.save();

  const user = await User.findById(userId);
  if (user?.email) {
    await emailService.sendEmail(
      user.email,
      'TechMates Pro cancellation scheduled',
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
