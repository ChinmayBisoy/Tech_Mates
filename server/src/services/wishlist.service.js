const User = require('../models/user.model');
const ProjectListing = require('../models/projectlisting.model');
const ApiError = require('../utils/ApiError');

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

const addToWishlist = async (userId, listingId) => {
  const listing = await ProjectListing.findOne({
    _id: listingId,
    adminApproved: true,
    status: 'active',
    isDeleted: false,
    isSold: false,
  });

  if (!listing) {
    throw new ApiError(404, 'Listing not found or unavailable');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const exists = (user.wishlist || []).some((item) => String(item) === String(listingId));
  if (exists) {
    throw new ApiError(409, 'Listing already in wishlist');
  }

  user.wishlist = [...(user.wishlist || []), listing._id];
  await user.save();

  return {
    count: user.wishlist.length,
  };
};

const removeFromWishlist = async (userId, listingId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.wishlist = (user.wishlist || []).filter((item) => String(item) !== String(listingId));
  await user.save();

  return {
    count: user.wishlist.length,
  };
};

const getWishlist = async (userId, pagination = {}) => {
  const { page, limit, skip } = normalizePagination(pagination);

  const user = await User.findById(userId).select('wishlist');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const wishlistIds = user.wishlist || [];

  const listingFilter = {
    _id: { $in: wishlistIds },
    adminApproved: true,
    status: 'active',
    isDeleted: false,
    isSold: false,
  };

  const [items, total] = await Promise.all([
    ProjectListing.find(listingFilter)
      .select('-repositoryUrl')
      .populate('sellerId', 'name avatar tier isPro avgRating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ProjectListing.countDocuments(listingFilter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
};
