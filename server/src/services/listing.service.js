const slugify = require('slugify');
const { customAlphabet } = require('nanoid');
const ProjectListing = require('../models/projectlisting.model');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const emailService = require('./email.service');
const notificationService = require('./notification.service');

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 4);

const normalizePagination = (pagination = {}) => {
  const parsedPage = Number.parseInt(pagination.page, 10);
  const parsedLimit = Number.parseInt(pagination.limit, 10);

  const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const limit = Number.isNaN(parsedLimit) || parsedLimit < 1 ? 12 : Math.min(parsedLimit, 50);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const buildUniqueSlug = async (title) => {
  const base = slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });

  let slug = `${base}-${nanoid()}`;

  while (await ProjectListing.exists({ slug })) {
    slug = `${base}-${nanoid()}`;
  }

  return slug;
};

const createListing = async (sellerId, data) => {
  const seller = await User.findById(sellerId);
  if (!seller) {
    throw new ApiError(404, 'Seller not found');
  }

  if (seller.isPro !== true) {
    throw new ApiError(403, 'Pro subscription required to post listings');
  }

  const slug = await buildUniqueSlug(data.title);

  const listing = await ProjectListing.create({
    sellerId,
    title: data.title,
    slug,
    description: data.description,
    category: data.category,
    subcategory: data.subcategory || '',
    type: data.type,
    techStack: data.techStack,
    tags: data.tags || [],
    price: data.price,
    previewImages: data.previewImages || [],
    demoUrl: data.demoUrl || '',
    repositoryUrl: data.repositoryUrl || '',
    whatsIncluded: data.whatsIncluded || [],
    documentationIncluded: Boolean(data.documentationIncluded),
    supportDays: data.supportDays,
    licenseType: data.licenseType,
    deliveryMethod: data.deliveryMethod,
    isExclusive: Boolean(data.isExclusive),
    status: 'draft',
  });

  return listing;
};

const submitForReview = async (listingId, sellerId) => {
  const listing = await ProjectListing.findOne({ _id: listingId, isDeleted: false });

  if (!listing) {
    throw new ApiError(404, 'Listing not found');
  }

  if (String(listing.sellerId) !== String(sellerId)) {
    throw new ApiError(403, 'You can only submit your own listing');
  }

  if (!Array.isArray(listing.previewImages) || listing.previewImages.length < 1) {
    throw new ApiError(400, 'At least one preview image is required before review submission');
  }

  listing.status = 'pending_review';
  listing.adminRejectedReason = '';

  await listing.save();

  console.log(`[LISTING_REVIEW_SUBMISSION] Listing ${listing._id} submitted for admin review.`);

  return listing;
};

const buildListingFilter = (filters = {}) => {
  const query = {
    adminApproved: true,
    status: 'active',
    isDeleted: false,
    isSold: false,
  };

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.techStack) {
    const stack = Array.isArray(filters.techStack)
      ? filters.techStack
      : String(filters.techStack)
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);

    if (stack.length > 0) {
      query.techStack = { $in: stack };
    }
  }

  if (filters.licenseType) {
    query.licenseType = filters.licenseType;
  }

  if (filters.supportDays !== undefined && filters.supportDays !== null && filters.supportDays !== '') {
    query.supportDays = Number(filters.supportDays);
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};

    if (filters.minPrice !== undefined && filters.minPrice !== null && filters.minPrice !== '') {
      query.price.$gte = Number(filters.minPrice);
    }

    if (filters.maxPrice !== undefined && filters.maxPrice !== null && filters.maxPrice !== '') {
      query.price.$lte = Number(filters.maxPrice);
    }
  }

  return query;
};

const getSortOption = (sortBy = 'newest') => {
  if (sortBy === 'price_asc') {
    return { price: 1, createdAt: -1 };
  }

  if (sortBy === 'price_desc') {
    return { price: -1, createdAt: -1 };
  }

  if (sortBy === 'rating') {
    return { avgRating: -1, totalReviews: -1, createdAt: -1 };
  }

  if (sortBy === 'popular') {
    return { purchases: -1, createdAt: -1 };
  }

  return { createdAt: -1 };
};

const getListings = async (filters = {}, pagination = {}) => {
  const { page, limit, skip } = normalizePagination(pagination);
  const query = buildListingFilter(filters);
  const sortOption = getSortOption(filters.sortBy);

  const [listings, total] = await Promise.all([
    ProjectListing.find(query)
      .select('-repositoryUrl')
      .populate('sellerId', 'name avatar tier isPro avgRating')
      .sort(sortOption)
      .skip(skip)
      .limit(limit),
    ProjectListing.countDocuments(query),
  ]);

  return {
    listings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

const getListingBySlug = async (slug) => {
  const listing = await ProjectListing.findOne({
    slug,
    adminApproved: true,
    status: 'active',
    isDeleted: false,
    isSold: false,
  })
    .select('-repositoryUrl')
    .populate('sellerId', 'name avatar tier isPro avgRating');

  if (!listing) {
    throw new ApiError(404, 'Listing not found');
  }

  return listing;
};

const getMyListings = async (sellerId, pagination = {}) => {
  const { page, limit, skip } = normalizePagination(pagination);

  const query = {
    sellerId,
    isDeleted: false,
  };

  const [listings, total] = await Promise.all([
    ProjectListing.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ProjectListing.countDocuments(query),
  ]);

  return {
    listings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

const updateListing = async (listingId, sellerId, data) => {
  const listing = await ProjectListing.findOne({ _id: listingId, isDeleted: false });

  if (!listing) {
    throw new ApiError(404, 'Listing not found');
  }

  if (String(listing.sellerId) !== String(sellerId)) {
    throw new ApiError(403, 'You can only update your own listing');
  }

  const originalTitle = listing.title;

  const updatableFields = [
    'title',
    'description',
    'category',
    'subcategory',
    'type',
    'techStack',
    'tags',
    'price',
    'previewImages',
    'demoUrl',
    'repositoryUrl',
    'whatsIncluded',
    'documentationIncluded',
    'supportDays',
    'licenseType',
    'deliveryMethod',
    'isExclusive',
  ];

  updatableFields.forEach((field) => {
    if (data[field] !== undefined) {
      listing[field] = data[field];
    }
  });

  if (data.title && data.title !== originalTitle) {
    listing.slug = await buildUniqueSlug(data.title);
  }

  if (listing.status === 'active') {
    listing.status = 'draft';
    listing.adminApproved = false;
    listing.adminApprovedAt = null;
    listing.adminRejectedReason = '';
  }

  await listing.save();

  return listing;
};

const deleteListing = async (listingId, sellerId) => {
  const listing = await ProjectListing.findOne({ _id: listingId, isDeleted: false });

  if (!listing) {
    throw new ApiError(404, 'Listing not found');
  }

  if (String(listing.sellerId) !== String(sellerId)) {
    throw new ApiError(403, 'You can only delete your own listing');
  }

  listing.isDeleted = true;
  listing.deletedAt = new Date();
  listing.status = 'removed';

  await listing.save();

  return { success: true };
};

const adminApproveListing = async (listingId, adminId) => {
  const admin = await User.findById(adminId);
  if (!admin || admin.role !== 'admin') {
    throw new ApiError(403, 'Admin access required');
  }

  const listing = await ProjectListing.findOne({ _id: listingId, isDeleted: false }).populate('sellerId', 'name email');

  if (!listing) {
    throw new ApiError(404, 'Listing not found');
  }

  listing.adminApproved = true;
  listing.adminApprovedAt = new Date();
  listing.adminRejectedReason = '';
  listing.status = 'active';

  await listing.save();

  if (listing.sellerId && listing.sellerId.email) {
    await emailService.sendEmail(
      listing.sellerId.email,
      'Your listing has been approved',
      `Hi ${listing.sellerId.name}, your listing "${listing.title}" is now live on TechMates.`,
      `<p>Hi ${listing.sellerId.name},</p><p>Your listing <strong>${listing.title}</strong> is now live on TechMates.</p>`
    );
  }

  await notificationService.notifyListingApproved(listing.sellerId._id || listing.sellerId, listing);

  return listing;
};

const adminRejectListing = async (listingId, adminId, reason) => {
  if (!reason || !String(reason).trim()) {
    throw new ApiError(400, 'Rejection reason is required');
  }

  const admin = await User.findById(adminId);
  if (!admin || admin.role !== 'admin') {
    throw new ApiError(403, 'Admin access required');
  }

  const listing = await ProjectListing.findOne({ _id: listingId, isDeleted: false }).populate('sellerId', 'name email');

  if (!listing) {
    throw new ApiError(404, 'Listing not found');
  }

  listing.adminApproved = false;
  listing.adminApprovedAt = null;
  listing.adminRejectedReason = String(reason).trim();
  listing.status = 'removed';

  await listing.save();

  if (listing.sellerId && listing.sellerId.email) {
    await emailService.sendEmail(
      listing.sellerId.email,
      'Your listing has been rejected',
      `Hi ${listing.sellerId.name}, your listing "${listing.title}" was rejected. Reason: ${listing.adminRejectedReason}`,
      `<p>Hi ${listing.sellerId.name},</p><p>Your listing <strong>${listing.title}</strong> was rejected.</p><p><strong>Reason:</strong> ${listing.adminRejectedReason}</p>`
    );
  }

  await notificationService.notifyListingRejected(
    listing.sellerId._id || listing.sellerId,
    listing,
    listing.adminRejectedReason
  );

  return listing;
};

const getPendingListings = async (pagination = {}) => {
  const { page, limit, skip } = normalizePagination(pagination);

  const query = {
    status: 'pending_review',
    isDeleted: false,
  };

  const [listings, total] = await Promise.all([
    ProjectListing.find(query)
      .sort({ createdAt: 1 })
      .populate('sellerId', 'name avatar tier isPro avgRating')
      .skip(skip)
      .limit(limit),
    ProjectListing.countDocuments(query),
  ]);

  return {
    listings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

module.exports = {
  createListing,
  submitForReview,
  getListings,
  getListingBySlug,
  getMyListings,
  updateListing,
  deleteListing,
  adminApproveListing,
  adminRejectListing,
  getPendingListings,
};
