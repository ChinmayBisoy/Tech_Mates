const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
  },
  { _id: true }
);

const proposalSchema = new mongoose.Schema(
  {
    requirementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Requirement',
      required: true,
    },
    developerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coverLetter: {
      type: String,
      required: true,
      trim: true,
      minlength: 50,
      maxlength: 2000,
    },
    proposedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryDays: {
      type: Number,
      required: true,
      min: 1,
    },
    milestones: {
      type: [milestoneSchema],
      default: [],
    },
    portfolioLinks: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },
    clientViewed: {
      type: Boolean,
      default: false,
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
  {
    timestamps: true,
  }
);

proposalSchema.index({ requirementId: 1 });
proposalSchema.index({ developerId: 1 });
proposalSchema.index({ status: 1 });

const Proposal = mongoose.model('Proposal', proposalSchema);

module.exports = Proposal;
