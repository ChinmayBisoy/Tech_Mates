const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectListing',
      required: true,
      index: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    platformFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    sellerEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    commissionRate: {
      type: Number,
      default: 0,
      min: 0,
    },
    stripePaymentIntentId: {
      type: String,
      default: null,
    },
    stripeChargeId: {
      type: String,
      default: null,
    },
    deliveryMethod: {
      type: String,
      enum: ['download', 'github_access'],
      required: true,
    },
    downloadUrl: {
      type: String,
      default: null,
    },
    downloadExpiresAt: {
      type: Date,
      default: null,
    },
    downloadAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDownloadAttempts: {
      type: Number,
      default: 3,
      min: 1,
    },
    githubInviteSent: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'disputed', 'refunded'],
      default: 'pending',
    },
    disputeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dispute',
      default: null,
    },
    reviewLeft: {
      type: Boolean,
      default: false,
    },
    disputeWindowEndsAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

purchaseSchema.index({ buyerId: 1 });
purchaseSchema.index({ status: 1 });

module.exports = mongoose.model('Purchase', purchaseSchema);
