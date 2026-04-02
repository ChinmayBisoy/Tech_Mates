const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const purchaseService = require('../services/purchase.service');
const deliveryService = require('../services/delivery.service');
const disputeService = require('../services/dispute.service');

const initiatePurchase = asyncHandler(async (req, res) => {
  const { listingId } = req.validatedBody || req.body;

  const result = await purchaseService.initiatePurchase(req.user._id, listingId);

  res.json(new ApiResponse(200, result, 'Purchase initiated successfully'));
});

const getMyPurchases = asyncHandler(async (req, res) => {
  const result = await purchaseService.getMyPurchases(req.user._id, req.query);

  res.json(new ApiResponse(200, result, 'Purchases fetched successfully'));
});

const getPurchaseById = asyncHandler(async (req, res) => {
  const purchase = await purchaseService.getPurchaseById(req.params.id, req.user._id);

  res.json(new ApiResponse(200, purchase, 'Purchase fetched successfully'));
});

const getDownloadLink = asyncHandler(async (req, res) => {
  const result = await deliveryService.getDownloadLink(req.params.id, req.user._id);

  res.json(new ApiResponse(200, result, 'Download link fetched successfully'));
});

const raiseDispute = asyncHandler(async (req, res) => {
  const { purchaseId, reason, description } = req.validatedBody || req.body;

  const dispute = await disputeService.raiseDispute(purchaseId, req.user._id, reason, description);

  res.json(new ApiResponse(200, dispute, 'Dispute raised successfully'));
});

const respondToDispute = asyncHandler(async (req, res) => {
  const { response } = req.validatedBody || req.body;

  const dispute = await disputeService.respondToDispute(req.params.id, req.user._id, response);

  res.json(new ApiResponse(200, dispute, 'Dispute response submitted successfully'));
});

const resolveDispute = asyncHandler(async (req, res) => {
  const { resolution, refundBuyer } = req.validatedBody || req.body;

  const dispute = await disputeService.resolveDispute(req.params.id, req.user._id, resolution, refundBuyer);

  res.json(new ApiResponse(200, dispute, 'Dispute resolved successfully'));
});

module.exports = {
  initiatePurchase,
  getMyPurchases,
  getPurchaseById,
  getDownloadLink,
  raiseDispute,
  respondToDispute,
  resolveDispute,
};
