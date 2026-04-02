const crypto = require('crypto');
const Purchase = require('../models/purchase.model');
const ProjectListing = require('../models/projectlisting.model');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const emailService = require('./email.service');

const generateDownloadUrl = async (purchase) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const downloadUrl = `${baseUrl}/downloads/${token}`;

  purchase.downloadUrl = downloadUrl;
  purchase.downloadExpiresAt = expiresAt;

  await purchase.save();

  return {
    downloadUrl,
    expiresAt,
  };
};

const sendGithubAccess = async (purchase, listing) => {
  if (!listing.repositoryUrl) {
    throw new ApiError(400, 'Repository URL is not configured for this listing');
  }

  const buyer = await User.findById(purchase.buyerId);
  if (!buyer) {
    throw new ApiError(404, 'Buyer not found');
  }

  purchase.githubInviteSent = true;
  await purchase.save();

  const subject = `GitHub access for ${listing.title}`;
  const text = `Hi ${buyer.name},\n\nYour purchase is complete. Access your project repository here:\n${listing.repositoryUrl}\n\nPlease clone the repo and follow the setup instructions included in the project files.\n\n- Team TechMates`;
  const html = `<p>Hi ${buyer.name},</p><p>Your purchase is complete.</p><p>Access your project repository here:</p><p><a href="${listing.repositoryUrl}">${listing.repositoryUrl}</a></p><p>Please clone the repo and follow the setup instructions included in the project files.</p><p>- Team TechMates</p>`;

  await emailService.sendEmail(buyer.email, subject, text, html);

  return { success: true };
};

const deliverPurchase = async (purchaseId) => {
  const purchase = await Purchase.findOne({ _id: purchaseId, isDeleted: false })
    .populate({ path: 'listingId', select: '+repositoryUrl' })
    .populate('sellerId')
    .populate('buyerId', 'name email');

  if (!purchase) {
    throw new ApiError(404, 'Purchase not found');
  }

  const listing = purchase.listingId;
  if (!listing) {
    throw new ApiError(404, 'Listing not found for purchase');
  }

  if (listing.deliveryMethod === 'download') {
    await generateDownloadUrl(purchase);
  }

  if (listing.deliveryMethod === 'github_access') {
    await sendGithubAccess(purchase, listing);
  }

  purchase.status = 'completed';
  purchase.disputeWindowEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  await purchase.save();

  listing.purchases = Number(listing.purchases || 0) + 1;

  if (listing.isExclusive) {
    listing.isSold = true;
    listing.status = 'sold_out';
  }

  await listing.save();

  const seller = purchase.sellerId;
  if (!seller) {
    throw new ApiError(404, 'Seller not found for purchase');
  }

  seller.walletBalance = Number(seller.walletBalance || 0) + Number(purchase.sellerEarnings || 0);
  seller.totalEarnings = Number(seller.totalEarnings || 0) + Number(purchase.sellerEarnings || 0);
  seller.totalSales = Number(seller.totalSales || 0) + 1;

  if (typeof seller.recalculateTier === 'function') {
    seller.recalculateTier();
  }

  await seller.save();

  return purchase;
};

const getDownloadLink = async (purchaseId, buyerId) => {
  const purchase = await Purchase.findOne({ _id: purchaseId, isDeleted: false });

  if (!purchase) {
    throw new ApiError(404, 'Purchase not found');
  }

  if (String(purchase.buyerId) !== String(buyerId)) {
    throw new ApiError(403, 'You are not allowed to access this purchase');
  }

  if (purchase.status !== 'completed') {
    throw new ApiError(400, 'Download is available only for completed purchases');
  }

  if (purchase.deliveryMethod !== 'download') {
    throw new ApiError(400, 'This purchase does not use download delivery');
  }

  const maxAttempts = Number(purchase.maxDownloadAttempts || 3);
  const currentAttempts = Number(purchase.downloadAttempts || 0);

  if (currentAttempts >= maxAttempts) {
    throw new ApiError(403, 'Maximum download attempts exceeded');
  }

  if (!purchase.downloadExpiresAt || new Date(purchase.downloadExpiresAt).getTime() <= Date.now()) {
    throw new ApiError(410, 'Download link expired');
  }

  purchase.downloadAttempts = currentAttempts + 1;
  await purchase.save();

  return {
    downloadUrl: purchase.downloadUrl,
    attemptsRemaining: maxAttempts - purchase.downloadAttempts,
  };
};

module.exports = {
  generateDownloadUrl,
  sendGithubAccess,
  deliverPurchase,
  getDownloadLink,
};
