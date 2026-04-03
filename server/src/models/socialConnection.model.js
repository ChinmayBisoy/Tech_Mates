const mongoose = require('mongoose');

const socialConnectionSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
      index: true,
    },
    pairKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

socialConnectionSchema.pre('validate', function setPairKey() {
  if (!this.requesterId || !this.receiverId) {
    return;
  }

  const [a, b] = [String(this.requesterId), String(this.receiverId)].sort();
  this.pairKey = `${a}:${b}`;
});

module.exports = mongoose.model('SocialConnection', socialConnectionSchema);
