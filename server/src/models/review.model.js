const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    revieweeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      default: null,
    },
    purchaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Purchase',
      default: null,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProjectListing',
      default: null,
    },
    type: {
      type: String,
      enum: ['contract_review', 'purchase_review'],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

reviewSchema.index(
  { reviewerId: 1, contractId: 1 },
  {
    unique: true,
    partialFilterExpression: { contractId: { $exists: true, $ne: null } },
  }
);

reviewSchema.index(
  { reviewerId: 1, purchaseId: 1 },
  {
    unique: true,
    partialFilterExpression: { purchaseId: { $exists: true, $ne: null } },
  }
);

reviewSchema.index({ revieweeId: 1 });
reviewSchema.index({ listingId: 1 });
reviewSchema.index({ type: 1 });
reviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
