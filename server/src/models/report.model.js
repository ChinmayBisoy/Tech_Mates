const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reportedContentId: mongoose.Schema.Types.ObjectId,
    contentType: {
      type: String,
      enum: ['user', 'requirement', 'proposal', 'review', 'listing'],
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'fraud', 'harassment', 'other'],
      required: true,
    },
    description: String,
    status: {
      type: String,
      enum: ['pending', 'investigating', 'resolved', 'dismissed'],
      default: 'pending',
    },
    resolution: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
