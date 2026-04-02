const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const reviewService = require('../services/review.service');

const submitReview = asyncHandler(async (req, res) => {
  const { contractId, purchaseId, rating, comment } = req.validatedBody || req.body;

  if (contractId) {
    const review = await reviewService.submitContractReview(req.user._id, contractId, rating, comment);
    res.json(new ApiResponse(200, review, 'Contract review submitted successfully'));
    return;
  }

  if (purchaseId) {
    const review = await reviewService.submitPurchaseReview(req.user._id, purchaseId, rating, comment);
    res.json(new ApiResponse(200, review, 'Purchase review submitted successfully'));
    return;
  }

  throw new ApiError(400, 'Either contractId or purchaseId is required');
});

const getReviewsForUser = asyncHandler(async (req, res) => {
  const result = await reviewService.getReviewsForUser(req.params.userId, req.query);

  res.json(new ApiResponse(200, result, 'User reviews fetched successfully'));
});

const getReviewsForListing = asyncHandler(async (req, res) => {
  const result = await reviewService.getReviewsForListing(req.params.listingId, req.query);

  res.json(new ApiResponse(200, result, 'Listing reviews fetched successfully'));
});

module.exports = {
  submitReview,
  getReviewsForUser,
  getReviewsForListing,
};
