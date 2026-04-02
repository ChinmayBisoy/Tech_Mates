const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const contractService = require('../services/contract.service');

const isClientRole = (role) => role === 'client' || role === 'user';

const getContracts = asyncHandler(async (req, res) => {
  if (!isClientRole(req.user.role) && req.user.role !== 'developer') {
    throw new ApiError(403, 'Only clients and developers can access contracts');
  }

  const result = await contractService.getContracts(req.user._id, req.user.role, {
    page: req.query.page,
    limit: req.query.limit,
    status: req.query.status,
  });

  res.json(new ApiResponse(200, result.items, 'Contracts fetched successfully', result.pagination));
});

const getContractById = asyncHandler(async (req, res) => {
  if (!isClientRole(req.user.role) && req.user.role !== 'developer') {
    throw new ApiError(403, 'Only clients and developers can access contracts');
  }

  const contract = await contractService.getContractById(req.params.id, req.user._id);

  res.json(new ApiResponse(200, contract, 'Contract fetched successfully'));
});

const submitMilestone = asyncHandler(async (req, res) => {
  if (req.user.role !== 'developer') {
    throw new ApiError(403, 'Only developers can submit milestones');
  }

  const contract = await contractService.submitMilestone(
    req.params.id,
    req.user._id,
    req.params.milestoneId,
    req.body.submissionNote
  );

  res.json(new ApiResponse(200, contract, 'Milestone submitted successfully'));
});

const approveMilestone = asyncHandler(async (req, res) => {
  if (!isClientRole(req.user.role)) {
    throw new ApiError(403, 'Only clients can approve milestones');
  }

  const contract = await contractService.approveMilestone(req.params.id, req.user._id, req.params.milestoneId);

  res.json(new ApiResponse(200, contract, 'Milestone approved successfully'));
});

const requestRevision = asyncHandler(async (req, res) => {
  if (!isClientRole(req.user.role)) {
    throw new ApiError(403, 'Only clients can request milestone revisions');
  }

  const contract = await contractService.requestRevision(
    req.params.id,
    req.user._id,
    req.params.milestoneId,
    req.body.revisionNote
  );

  res.json(new ApiResponse(200, contract, 'Milestone marked for revision successfully'));
});

const disputeMilestone = asyncHandler(async (req, res) => {
  if (!isClientRole(req.user.role)) {
    throw new ApiError(403, 'Only clients can dispute milestones');
  }

  const contract = await contractService.disputeMilestone(req.params.id, req.user._id, req.params.milestoneId);

  res.json(new ApiResponse(200, contract, 'Milestone disputed successfully'));
});

module.exports = {
  getContracts,
  getContractById,
  submitMilestone,
  approveMilestone,
  requestRevision,
  disputeMilestone,
};
