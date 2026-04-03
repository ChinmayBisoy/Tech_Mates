const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 500, // Minimum withdrawal ₹500
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    accountType: {
      type: String,
      enum: ['bank', 'upi'],
      required: true,
    },
    accountDetails: {
      // For bank transfers
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String,
      bankName: String,

      // For UPI
      upiId: String,
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null,
    },
    razorpayPayoutId: {
      type: String,
      default: null,
    },
    failureReason: String,
    cancelReason: String,
    processedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    metadata: {
      initiatedFrom: String, // 'mobile' or 'web'
      ipAddress: String,
      userAgent: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for quick lookups
withdrawalSchema.index({ userId: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1, createdAt: -1 });

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

module.exports = Withdrawal;
