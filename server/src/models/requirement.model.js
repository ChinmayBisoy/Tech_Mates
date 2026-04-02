const mongoose = require('mongoose');

const requirementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
    },
    budgetMin: {
      type: Number,
      required: true,
      min: 0,
    },
    budgetMax: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator(value) {
          return value >= this.budgetMin;
        },
        message: 'budgetMax must be greater than or equal to budgetMin',
      },
    },
    budgetType: {
      type: String,
      enum: ['fixed', 'hourly'],
      default: 'fixed',
    },
    deadline: {
      type: Date,
      required: true,
      validate: {
        validator(value) {
          return value && value.getTime() > Date.now();
        },
        message: 'deadline must be a future date',
      },
    },
    skillsRequired: {
      type: [String],
      required: true,
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: 'At least one skill is required',
      },
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    attachments: {
      type: [String],
      default: [],
    },
    visibility: {
      type: String,
      enum: ['public', 'invite_only', 'private'],
      default: 'public',
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    proposals: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Proposal',
        },
      ],
      default: [],
    },
    selectedProposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal',
      default: null,
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'expired', 'cancelled'],
      default: 'open',
    },
    requiresNDA: {
      type: Boolean,
      default: false,
    },
    maxProposals: {
      type: Number,
      default: 20,
      min: 1,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

requirementSchema.pre('save', function () {
    if (this.isNew && !this.expiresAt) {
        const baseDate = this.createdAt || new Date();
        this.expiresAt = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
});

requirementSchema.index({ status: 1 });
requirementSchema.index({ postedBy: 1 });
requirementSchema.index({ category: 1 });
requirementSchema.index({ createdAt: -1 });
requirementSchema.index({ isDeleted: 1 });

const Requirement = mongoose.model('Requirement', requirementSchema);

module.exports = Requirement;