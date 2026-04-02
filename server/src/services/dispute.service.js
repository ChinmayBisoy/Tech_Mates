const Dispute = require('../models/dispute.model');
const Purchase = require('../models/purchase.model');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const stripeService = require('./stripe.service');
const notificationService = require('./notification.service');

const raiseDispute = async (purchaseId, buyerId, reason, description) => {
  const purchase = await Purchase.findOne({ _id: purchaseId, isDeleted: false });

  if (!purchase) {
    throw new ApiError(404, 'Purchase not found');
  }

  if (String(purchase.buyerId) !== String(buyerId)) {
    throw new ApiError(403, 'You are not allowed to dispute this purchase');
  }

  if (purchase.status !== 'completed') {
    throw new ApiError(400, 'Disputes can only be raised for completed purchases');
  }

  if (!purchase.disputeWindowEndsAt || Date.now() >= new Date(purchase.disputeWindowEndsAt).getTime()) {
    throw new ApiError(400, 'Dispute window has expired');
  }

  const existingDispute = await Dispute.findOne({ purchaseId, status: { $in: ['open', 'seller_responded', 'resolved'] } });
  if (existingDispute) {
    throw new ApiError(409, 'A dispute already exists for this purchase');
  }

  const dispute = await Dispute.create({
    purchaseId,
    raisedBy: buyerId,
    againstUserId: purchase.sellerId,
    type: 'purchase_dispute',
    reason,
    description,
    status: 'open',
  });

  purchase.status = 'disputed';
  purchase.disputeId = dispute._id;
  await purchase.save();

  await notificationService.notifyDisputeRaised(purchase.sellerId, null, dispute);

  console.log(`[DISPUTE_RAISED] purchase=${purchase._id} seller=${purchase.sellerId} dispute=${dispute._id}`);

  return dispute;
};

const respondToDispute = async (disputeId, sellerId, response) => {
  const dispute = await Dispute.findById(disputeId).populate('purchaseId');

  if (!dispute) {
    throw new ApiError(404, 'Dispute not found');
  }

  if (!dispute.purchaseId) {
    throw new ApiError(404, 'Associated purchase not found');
  }

  if (String(dispute.purchaseId.sellerId) !== String(sellerId)) {
    throw new ApiError(403, 'Only the seller can respond to this dispute');
  }

  if (dispute.status !== 'open') {
    throw new ApiError(400, 'Only open disputes can receive a seller response');
  }

  dispute.sellerResponse = response;
  dispute.status = 'seller_responded';
  await dispute.save();

  console.log(`[DISPUTE_SELLER_RESPONDED] dispute=${dispute._id}`);

  return dispute;
};

const resolveDispute = async (disputeId, adminId, resolution, refundBuyer) => {
  const admin = await User.findById(adminId);
  if (!admin || admin.role !== 'admin') {
    throw new ApiError(403, 'Admin access required');
  }

  const dispute = await Dispute.findById(disputeId).populate('purchaseId');

  if (!dispute) {
    throw new ApiError(404, 'Dispute not found');
  }

  if (!dispute.purchaseId) {
    throw new ApiError(404, 'Associated purchase not found');
  }

  const purchase = await Purchase.findById(dispute.purchaseId._id);
  if (!purchase) {
    throw new ApiError(404, 'Purchase not found');
  }

  dispute.resolvedBy = adminId;
  dispute.resolution = resolution;
  dispute.status = 'resolved';

  if (refundBuyer === true) {
    if (!purchase.stripePaymentIntentId) {
      throw new ApiError(400, 'Refund not possible: missing Stripe payment intent');
    }

    await stripeService.createRefund(purchase.stripePaymentIntentId);

    purchase.status = 'refunded';

    const seller = await User.findById(purchase.sellerId);
    if (seller) {
      seller.walletBalance = Math.max(0, Number(seller.walletBalance || 0) - Number(purchase.sellerEarnings || 0));
      await seller.save();
    }

    dispute.refundIssued = true;
  } else {
    purchase.status = 'completed';
    dispute.refundIssued = false;
  }

  await Promise.all([purchase.save(), dispute.save()]);

  console.log(`[DISPUTE_RESOLVED] dispute=${dispute._id} refundIssued=${dispute.refundIssued}`);

  return dispute;
};

module.exports = {
  raiseDispute,
  respondToDispute,
  resolveDispute,
};
