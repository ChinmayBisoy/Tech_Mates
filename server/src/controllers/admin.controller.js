const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const adminService = require('../services/admin.service');
const listingService = require('../services/listing.service');
const disputeService = require('../services/dispute.service');

const getAllUsers = asyncHandler(async (req, res) => {
  const result = await adminService.getAllUsers(req.query, req.query);
  res.json(new ApiResponse(200, result, 'Users fetched successfully'));
});

const banUser = asyncHandler(async (req, res) => {
  const { reason } = req.validatedBody || req.body;
  const user = await adminService.banUser(req.params.id, req.user._id, reason);
  res.json(new ApiResponse(200, user, 'User banned successfully'));
});

const unbanUser = asyncHandler(async (req, res) => {
  const user = await adminService.unbanUser(req.params.id, req.user._id);
  res.json(new ApiResponse(200, user, 'User unbanned successfully'));
});

const verifyUser = asyncHandler(async (req, res) => {
  const user = await adminService.verifyUser(req.params.id, req.user._id);
  res.json(new ApiResponse(200, user, 'User verified successfully'));
});

const deleteUser = asyncHandler(async (req, res) => {
  const result = await adminService.deleteUser(req.params.id, req.user._id);
  res.json(new ApiResponse(200, result, 'User deleted successfully'));
});

const getPendingListings = asyncHandler(async (req, res) => {
  const result = await listingService.getPendingListings(req.query);
  res.json(new ApiResponse(200, result, 'Pending listings fetched successfully'));
});

const approveListing = asyncHandler(async (req, res) => {
  const listing = await adminService.approveListingAdmin(req.params.id, req.user._id);
  res.json(new ApiResponse(200, listing, 'Listing approved successfully'));
});

const rejectListing = asyncHandler(async (req, res) => {
  const { reason } = req.validatedBody || req.body;
  const listing = await adminService.rejectListingAdmin(req.params.id, req.user._id, reason);
  res.json(new ApiResponse(200, listing, 'Listing rejected successfully'));
});

const getAllDisputes = asyncHandler(async (req, res) => {
  const result = await adminService.getAllDisputes(req.query, req.query);
  res.json(new ApiResponse(200, result, 'Disputes fetched successfully'));
});

const getDisputeById = asyncHandler(async (req, res) => {
  const dispute = await adminService.getDisputeById(req.params.id);
  res.json(new ApiResponse(200, dispute, 'Dispute detail fetched successfully'));
});

const resolveDispute = asyncHandler(async (req, res) => {
  const { resolution, refundBuyer } = req.body;
  const dispute = await disputeService.resolveDispute(req.params.id, req.user._id, resolution, refundBuyer);
  res.json(new ApiResponse(200, dispute, 'Dispute resolved successfully'));
});

const getPlatformAnalytics = asyncHandler(async (req, res) => {
  const { period } = req.validatedQuery || req.query;
  const analytics = await adminService.getPlatformAnalytics(period || 'month');
  res.json(new ApiResponse(200, analytics, 'Platform analytics fetched successfully'));
});

const getRevenueChart = asyncHandler(async (req, res) => {
  const period = req.query.period || 'month';
  const chart = await adminService.getRevenueChart(period);
  res.json(new ApiResponse(200, chart, 'Revenue chart fetched successfully'));
});

module.exports = {
  getAllUsers,
  banUser,
  unbanUser,
  verifyUser,
  deleteUser,
  getPendingListings,
  approveListing,
  rejectListing,
  getAllDisputes,
  getDisputeById,
  resolveDispute,
  getPlatformAnalytics,
  getRevenueChart,
};
