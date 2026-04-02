const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'new_requirement',
        'proposal_received',
        'proposal_accepted',
        'proposal_rejected',
        'contract_created',
        'milestone_submitted',
        'milestone_approved',
        'milestone_revision',
        'milestone_disputed',
        'payment_received',
        'payment_released',
        'payout_processed',
        'listing_approved',
        'listing_rejected',
        'purchase_completed',
        'dispute_raised',
        'dispute_resolved',
        'new_message',
        'review_received',
        'subscription_activated',
        'subscription_cancelled',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
