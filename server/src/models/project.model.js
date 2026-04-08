const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 150,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 50,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
      enum: [
        'ecommerce',
        'education',
        'social',
        'analytics',
        'mobile',
        'ai',
        'backend',
        'website',
        'other',
      ],
    },
    budget: {
      min: {
        type: Number,
        required: true,
        min: 0,
      },
      max: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    timeline: {
      type: String,
      required: true,
      enum: ['1week', '2weeks', '1month', '2months', '3months', '6months', 'flexible'],
    },
    skills: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0 && value.length <= 10,
        message: 'Skills array must have 1-10 items',
      },
    },
    deliverables: {
      type: String,
      required: true,
      minlength: 20,
    },
    attachments: [
      {
        name: String,
        url: String,
        fileType: String,
      },
    ],
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'closed'],
      default: 'open',
      index: true,
    },
    proposals: [
      {
        developerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        proposalText: String,
        bidAmount: Number,
        estimatedDays: Number,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    selectedDeveloper: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Ensure budget min is less than max
projectSchema.pre('save', function (next) {
  if (this.budget.min > this.budget.max) {
    this.budget.min = this.budget.max - (this.budget.max * 0.2);
  }
  next();
});

// Create index for search
projectSchema.index({ title: 'text', description: 'text' });
projectSchema.index({ skills: 1 });
projectSchema.index({ 'budget.min': 1, 'budget.max': 1 });

module.exports = mongoose.model('Project', projectSchema);
