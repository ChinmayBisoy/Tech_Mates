const mongoose = require('mongoose');

const contractMilestoneSchema = new mongoose.Schema(
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
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'submitted', 'approved', 'revision_requested', 'disputed'],
      default: 'pending',
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    submissionNote: {
      type: String,
      default: '',
      trim: true,
    },
    revisionNote: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: true }
);

const contractSchema = new mongoose.Schema(
  {
    requirementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Requirement',
      required: true,
    },
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal',
      required: true,
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    developerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    totalAmount: {
      type: Number,
      default: 0,
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
      default: 0.15,
      min: 0,
    },
    milestones: {
      type: [contractMilestoneSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled', 'disputed'],
      default: 'active',
    },
    completedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
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

contractSchema.index({ clientId: 1 });
contractSchema.index({ developerId: 1 });
contractSchema.index({ status: 1 });
contractSchema.index({ createdAt: -1 });

const Contract = mongoose.model('Contract', contractSchema);

module.exports = Contract;
