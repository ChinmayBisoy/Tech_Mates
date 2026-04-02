const Purchase = require('../models/purchase.model');
const ProjectListing = require('../models/projectlisting.model');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const { calculateCommission } = require('./commission.service');
const stripeService = require('./stripe.service');
const deliveryService = require('./delivery.service');
const emailService = require('./email.service');
const notificationService = require('./notification.service');

const scheduleReviewPromptEmail = (email, buyerName, listingTitle) => {
  const delayMs = 24 * 60 * 60 * 1000;

  setTimeout(async () => {
    try {
      await emailService.sendEmail(
        email,
        'Reminder: Leave a review on your purchase',
        `Hi ${buyerName}, please leave a review for ${listingTitle}.`,
        `<p>Hi ${buyerName},</p><p>Please leave a review for <strong>${listingTitle}</strong>.</p>`
      );
    } catch (error) {
      console.log(`[REVIEW_REMINDER_EMAIL_ERROR] ${error.message}`);
    }
  }, delayMs);
};

const normalizePagination = (pagination = {}) => {
  const parsedPage = Number.parseInt(pagination.page, 10);
  const parsedLimit = Number.parseInt(pagination.limit, 10);

  const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const limit = Number.isNaN(parsedLimit) || parsedLimit < 1 ? 10 : Math.min(parsedLimit, 50);

  return { page, limit, skip: (page - 1) * limit };
};

const initiatePurchase = async (buyerId, listingId) => {
  const listing = await ProjectListing.findOne({
    _id: listingId,
    adminApproved: true,
    status: 'active',
    isSold: false,
    isDeleted: false,
  });

  if (!listing) {
    throw new ApiError(404, 'Listing not available for purchase');
  }

  const existingPurchase = await Purchase.findOne({
    buyerId,
    listingId,
    isDeleted: false,
    status: { $in: ['pending', 'completed', 'disputed'] },
  });

  if (existingPurchase) {
    throw new ApiError(409, 'You have already purchased this listing');
  }

  const seller = await User.findById(listing.sellerId);
  if (!seller) {
    throw new ApiError(404, 'Seller not found');
  }

  const { platformFee, developerEarnings, rate } = calculateCommission(listing.price, seller);

  const { clientSecret, paymentIntentId } = await stripeService.createPaymentIntent(
    listing.price,
    'inr',
    {
      listingId: String(listing._id),
      buyerId: String(buyerId),
      sellerId: String(listing.sellerId),
    }
  );

  const purchase = await Purchase.create({
    buyerId,
    listingId: listing._id,
    sellerId: listing.sellerId,
    amount: listing.price,
    platformFee,
    sellerEarnings: developerEarnings,
    commissionRate: rate,
    stripePaymentIntentId: paymentIntentId,
    deliveryMethod: listing.deliveryMethod,
    status: 'pending',
  });

  return {
    clientSecret,
    purchase,
  };
};

const confirmPurchase = async (stripePaymentIntentId) => {
  const purchase = await Purchase.findOne({ stripePaymentIntentId, isDeleted: false });

  if (!purchase) {
    throw new ApiError(404, 'Purchase not found');
  }

  if (purchase.status === 'completed') {
    return Purchase.findById(purchase._id)
      .populate('buyerId', 'name email')
      .populate('listingId', 'title');
  }

  const deliveredPurchase = await deliveryService.deliverPurchase(purchase._id);

  const populatedPurchase = await Purchase.findById(deliveredPurchase._id)
    .populate('buyerId', 'name email')
    .populate('listingId', 'title');

  if (populatedPurchase?.buyerId?.email) {
    const buyerName = populatedPurchase.buyerId.name || 'Buyer';
    const listingTitle = populatedPurchase?.listingId?.title || 'your project';

    await emailService.sendEmail(
      populatedPurchase.buyerId.email,
      'Purchase confirmed on TechMates',
      `Hi ${buyerName}, your purchase for ${listingTitle} is confirmed and ready for delivery.`,
      `<p>Hi ${buyerName},</p><p>Your purchase for <strong>${listingTitle}</strong> is confirmed and ready for delivery.</p>`
    );

    scheduleReviewPromptEmail(populatedPurchase.buyerId.email, buyerName, listingTitle);
  }

  if (populatedPurchase?.listingId) {
    await notificationService.notifyPurchaseCompleted(
      populatedPurchase.buyerId?._id || populatedPurchase.buyerId,
      deliveredPurchase.sellerId,
      populatedPurchase.listingId
    );
  }

  return populatedPurchase || deliveredPurchase;
};

const getMyPurchases = async (buyerId, pagination = {}) => {
  const { page, limit, skip } = normalizePagination(pagination);

  const query = {
    buyerId,
    isDeleted: false,
    status: { $ne: 'pending' },
  };

  const [purchases, total] = await Promise.all([
    Purchase.find(query)
      .populate('listingId', 'title category type previewImages')
      .populate('sellerId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Purchase.countDocuments(query),
  ]);

  return {
    purchases,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

const getPurchaseById = async (purchaseId, buyerId) => {
  const purchase = await Purchase.findOne({ _id: purchaseId, isDeleted: false })
    .populate({ path: 'listingId', select: '+repositoryUrl' })
    .populate('sellerId')
    .populate('buyerId', 'name email avatar');

  if (!purchase) {
    throw new ApiError(404, 'Purchase not found');
  }

  if (String(purchase.buyerId?._id || purchase.buyerId) !== String(buyerId)) {
    throw new ApiError(403, 'You are not allowed to access this purchase');
  }

  return purchase;
};

module.exports = {
  initiatePurchase,
  confirmPurchase,
  getMyPurchases,
  getPurchaseById,
};
