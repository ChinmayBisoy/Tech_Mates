const mongoose = require('mongoose');

const projectListingSchema = new mongoose.Schema(
  {
    sellerId: {
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
    },
    subcategory: {
      type: String,
      default: '',
      trim: true,
    },
    type: {
      type: String,
      enum: ['complete_project', 'template', 'saas_starter', 'module', 'ui_kit', 'idea_concept'],
      required: true,
    },
    techStack: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'At least one tech stack item is required',
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    previewImages: {
      type: [String],
      default: [],
      validate: {
        validator: (value) => Array.isArray(value) && value.length <= 5,
        message: 'previewImages cannot exceed 5 URLs',
      },
    },
    demoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    repositoryUrl: {
      type: String,
      default: '',
      trim: true,
      select: false,
    },
    whatsIncluded: {
      type: [String],
      default: [],
    },
    documentationIncluded: {
      type: Boolean,
      default: false,
    },
    supportDays: {
      type: Number,
      enum: [0, 7, 14, 30],
      default: 0,
    },
    licenseType: {
      type: String,
      enum: ['single_use', 'multi_use', 'open_source'],
      required: true,
    },
    deliveryMethod: {
      type: String,
      enum: ['download', 'github_access'],
      required: true,
      default: 'download',
    },
    isExclusive: {
      type: Boolean,
      default: false,
    },
    isSold: {
      type: Boolean,
      default: false,
    },
    purchases: {
      type: Number,
      default: 0,
      min: 0,
    },
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    featuredUntil: {
      type: Date,
      default: null,
    },
    adminApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
    adminApprovedAt: {
      type: Date,
      default: null,
    },
    adminRejectedReason: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'active', 'removed', 'sold_out'],
      default: 'draft',
      index: true,
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

projectListingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ProjectListing', projectListingSchema);
