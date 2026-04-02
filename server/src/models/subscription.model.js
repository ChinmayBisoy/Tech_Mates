const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    stripeSubscriptionId: {
      type: String,
      required: true,
      index: true,
    },
    stripeCustomerId: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'past_due', 'unpaid', 'trialing'],
      default: 'active',
      index: true,
    },
    currentPeriodStart: {
      type: Date,
      default: null,
    },
    currentPeriodEnd: {
      type: Date,
      default: null,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    gracePeriodEndsAt: {
      type: Date,
      default: null,
    },
    priceId: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
