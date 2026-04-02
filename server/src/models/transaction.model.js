const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      default: null,
      index: true,
    },
    milestoneId: {
      type: String,
      default: null,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    developerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: ['milestone_payment', 'milestone_release', 'refund', 'credit', 'debit'],
      default: 'milestone_payment',
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
    developerEarnings: {
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
    status: {
      type: String,
      enum: ['pending', 'held', 'released', 'refunded', 'disputed', 'failed', 'completed', 'cancelled'],
      default: 'pending',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },

    // Compatibility fields for existing non-escrow transaction flows.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    reference: {
      type: String,
      default: null,
    },
    referenceType: {
      type: String,
      enum: ['contract', 'proposal', 'withdrawal', 'deposit', 'refund'],
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'bank_transfer', 'internal'],
      default: 'internal',
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

transactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
