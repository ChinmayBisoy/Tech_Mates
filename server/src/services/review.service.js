const Review = require('../models/review.model');
const Contract = require('../models/contract.model');
const Purchase = require('../models/purchase.model');
const User = require('../models/user.model');
const ProjectListing = require('../models/projectlisting.model');
const ApiError = require('../utils/ApiError');
const notificationService = require('./notification.service');

const normalizePagination = (pagination = {}) => {
  const parsedPage = Number.parseInt(pagination.page, 10);
  const parsedLimit = Number.parseInt(pagination.limit, 10);

  const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const limit = Number.isNaN(parsedLimit) || parsedLimit < 1 ? 10 : Math.min(parsedLimit, 50);

  return { page, limit, skip: (page - 1) * limit };
};

const updateUserRating = async (userId) => {
  const [aggregation] = await Review.aggregate([
    { $match: { revieweeId: userId } },
    {
      $group: {
        _id: '$revieweeId',
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const avgRating = aggregation ? Number(aggregation.avgRating.toFixed(2)) : 0;
  const totalReviews = aggregation ? aggregation.totalReviews : 0;

  const user = await User.findById(userId);
  if (user) {
    user.avgRating = avgRating;
    user.totalReviews = totalReviews;

    if (typeof user.recalculateTier === 'function') {
      user.recalculateTier();
    }

    await user.save();
  }

  return { avgRating, totalReviews };
};

const updateListingRating = async (listingId) => {
  const [aggregation] = await Review.aggregate([
    { $match: { listingId } },
    {
      $group: {
        _id: '$listingId',
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const avgRating = aggregation ? Number(aggregation.avgRating.toFixed(2)) : 0;
  const totalReviews = aggregation ? aggregation.totalReviews : 0;

  await ProjectListing.findByIdAndUpdate(listingId, {
    avgRating,
    totalReviews,
  });

  return { avgRating, totalReviews };
};

const submitContractReview = async (reviewerId, contractId, rating, comment) => {
  const contract = await Contract.findOne({ _id: contractId, isDeleted: false });
  if (!contract) {
    throw new ApiError(404, 'Contract not found');
  }

  const isClient = String(contract.clientId) === String(reviewerId);
  const isDeveloper = String(contract.developerId) === String(reviewerId);

  if (!isClient && !isDeveloper) {
    throw new ApiError(403, 'You are not allowed to review this contract');
  }

  if (contract.status !== 'completed') {
    throw new ApiError(400, 'Contract must be completed before leaving a review');
  }

  const existingReview = await Review.findOne({ reviewerId, contractId });
  if (existingReview) {
    throw new ApiError(409, 'You have already reviewed this contract');
  }

  const revieweeId = isClient ? contract.developerId : contract.clientId;

  const review = await Review.create({
    reviewerId,
    revieweeId,
    contractId,
    type: 'contract_review',
    rating,
    comment,
  });

  await updateUserRating(revieweeId);

  await notificationService.createNotification(
    revieweeId,
    'review_received',
    'New Review Received',
    'You received a new review from a completed contract.',
    { contractId }
  );

  return review;
};

const submitPurchaseReview = async (reviewerId, purchaseId, rating, comment) => {
  const purchase = await Purchase.findOne({ _id: purchaseId, isDeleted: false });
  if (!purchase) {
    throw new ApiError(404, 'Purchase not found');
  }

  if (String(purchase.buyerId) !== String(reviewerId)) {
    throw new ApiError(403, 'Only the buyer can review this purchase');
  }

  if (purchase.status !== 'completed') {
    throw new ApiError(400, 'Purchase must be completed before review');
  }

  if (purchase.reviewLeft === true) {
    throw new ApiError(409, 'Review already submitted for this purchase');
  }

  const existingReview = await Review.findOne({ reviewerId, purchaseId });
  if (existingReview) {
    throw new ApiError(409, 'You have already reviewed this purchase');
  }

  const review = await Review.create({
    reviewerId,
    revieweeId: purchase.sellerId,
    purchaseId,
    listingId: purchase.listingId,
    type: 'purchase_review',
    rating,
    comment,
  });

  purchase.reviewLeft = true;
  await purchase.save();

  await updateUserRating(purchase.sellerId);
  await updateListingRating(purchase.listingId);

  await notificationService.createNotification(
    purchase.sellerId,
    'review_received',
    'New Listing Review',
    'You received a new review on one of your purchased listings.',
    { purchaseId, listingId: purchase.listingId }
  );

  return review;
};

const getReviewsForUser = async (userId, pagination = {}) => {
  const { page, limit, skip } = normalizePagination(pagination);

  const query = {
    revieweeId: userId,
    isPublic: true,
  };

  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate('reviewerId', 'name avatar role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(query),
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

const getReviewsForListing = async (listingId, pagination = {}) => {
  const { page, limit, skip } = normalizePagination(pagination);

  const query = {
    listingId,
  };

  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate('reviewerId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(query),
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

module.exports = {
  submitContractReview,
  submitPurchaseReview,
  updateUserRating,
  updateListingRating,
  getReviewsForUser,
  getReviewsForListing,
};
