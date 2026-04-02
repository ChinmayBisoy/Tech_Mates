const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema(
  {
    purchaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Purchase',
      default: null,
    },
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      default: null,
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    againstUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['purchase_dispute', 'milestone_dispute'],
      required: true,
    },
    reason: {
      type: String,
      enum: ['not_as_described', 'broken_code', 'files_not_delivered', 'other'],
      required: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 20,
    },
    evidence: {
      type: [String],
      default: [],
    },
    sellerResponse: {
      type: String,
      default: '',
    },
    resolution: {
      type: String,
      default: '',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    refundIssued: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['open', 'seller_responded', 'resolved', 'closed'],
      default: 'open',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Dispute', disputeSchema);
