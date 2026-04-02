const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const listingService = require('../services/listing.service');
const wishlistService = require('../services/wishlist.service');
const { listingQuerySchema } = require('../validators/listing.validator');

const parseListingQuery = (query) => {
  const parsed = listingQuerySchema.safeParse(query);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    throw new ApiError(400, firstError?.message || 'Invalid listing query');
  }

  return parsed.data;
};

const createListing = asyncHandler(async (req, res) => {
  const listing = await listingService.createListing(req.user._id, req.validatedBody || req.body);

  res.status(201).json(new ApiResponse(201, listing, 'Listing created successfully'));
});

const submitForReview = asyncHandler(async (req, res) => {
  const listing = await listingService.submitForReview(req.params.id, req.user._id);

  res.json(new ApiResponse(200, listing, 'Listing submitted for review successfully'));
});

const getListings = asyncHandler(async (req, res) => {
  const filters = parseListingQuery(req.query);
  const result = await listingService.getListings(filters, req.query);

  res.json(new ApiResponse(200, result, 'Listings fetched successfully'));
});

const getListingBySlug = asyncHandler(async (req, res) => {
  const listing = await listingService.getListingBySlug(req.params.slug);

  res.json(new ApiResponse(200, listing, 'Listing fetched successfully'));
});

const getMyListings = asyncHandler(async (req, res) => {
  const result = await listingService.getMyListings(req.user._id, req.query);

  res.json(new ApiResponse(200, result, 'My listings fetched successfully'));
});

const updateListing = asyncHandler(async (req, res) => {
  const listing = await listingService.updateListing(req.params.id, req.user._id, req.validatedBody || req.body);

  res.json(new ApiResponse(200, listing, 'Listing updated successfully'));
});

const deleteListing = asyncHandler(async (req, res) => {
  await listingService.deleteListing(req.params.id, req.user._id);

  res.json(new ApiResponse(200, {}, 'Listing deleted successfully'));
});

const adminApproveListing = asyncHandler(async (req, res) => {
  const listing = await listingService.adminApproveListing(req.params.id, req.user._id);

  res.json(new ApiResponse(200, listing, 'Listing approved successfully'));
});

const adminRejectListing = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  if (!reason || !String(reason).trim()) {
    throw new ApiError(400, 'reason is required');
  }

  const listing = await listingService.adminRejectListing(req.params.id, req.user._id, reason);

  res.json(new ApiResponse(200, listing, 'Listing rejected successfully'));
});

const getPendingListings = asyncHandler(async (req, res) => {
  const result = await listingService.getPendingListings(req.query);

  res.json(new ApiResponse(200, result, 'Pending listings fetched successfully'));
});

const addToWishlist = asyncHandler(async (req, res) => {
  const result = await wishlistService.addToWishlist(req.user._id, req.params.listingId);

  res.json(new ApiResponse(200, result, 'Listing added to wishlist'));
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const result = await wishlistService.removeFromWishlist(req.user._id, req.params.listingId);

  res.json(new ApiResponse(200, result, 'Listing removed from wishlist'));
});

const getWishlist = asyncHandler(async (req, res) => {
  const result = await wishlistService.getWishlist(req.user._id, req.query);

  res.json(new ApiResponse(200, result, 'Wishlist fetched successfully'));
});

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
  addToWishlist,
  removeFromWishlist,
  getWishlist,
};
