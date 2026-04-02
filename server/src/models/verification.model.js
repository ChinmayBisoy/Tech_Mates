const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['email', 'phone', 'identity', 'business'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    verificationToken: String,
    tokenExpiresAt: Date,
    documents: [String],
    rejectionReason: String,
    verifiedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Verification', verificationSchema);
