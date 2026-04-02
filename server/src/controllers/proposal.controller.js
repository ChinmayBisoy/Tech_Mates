const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const proposalService = require('../services/proposal.service');

const isClientRole = (role) => role === 'client' || role === 'user';

const sendProposal = asyncHandler(async (req, res) => {
  if (req.user.role !== 'developer') {
    throw new ApiError(403, 'Only developers can send proposals');
  }

  const proposal = await proposalService.sendProposal(req.user._id, req.validatedBody);

  res.json(new ApiResponse(201, proposal, 'Proposal sent successfully'));
});

const getProposalsForRequirement = asyncHandler(async (req, res) => {
  if (!isClientRole(req.user.role)) {
    throw new ApiError(403, 'Only clients can view requirement proposals');
  }

  const proposals = await proposalService.getProposalsForRequirement(req.params.requirementId, req.user._id);

  res.json(new ApiResponse(200, proposals, 'Proposals fetched successfully'));
});

const getMyProposals = asyncHandler(async (req, res) => {
  if (req.user.role !== 'developer') {
    throw new ApiError(403, 'Only developers can view their proposals');
  }

  const result = await proposalService.getMyProposals(req.user._id, {
    page: req.query.page,
    limit: req.query.limit,
  });

  res.json(new ApiResponse(200, result.items, 'My proposals fetched successfully', result.pagination));
});

const updateProposal = asyncHandler(async (req, res) => {
  if (req.user.role !== 'developer') {
    throw new ApiError(403, 'Only developers can update proposals');
  }

  const proposal = await proposalService.updateProposal(req.params.id, req.user._id, req.validatedBody);

  res.json(new ApiResponse(200, proposal, 'Proposal updated successfully'));
});

const withdrawProposal = asyncHandler(async (req, res) => {
  if (req.user.role !== 'developer') {
    throw new ApiError(403, 'Only developers can withdraw proposals');
  }

  const proposal = await proposalService.withdrawProposal(req.params.id, req.user._id);

  res.json(new ApiResponse(200, proposal, 'Proposal withdrawn successfully'));
});

const shortlistProposal = asyncHandler(async (req, res) => {
  if (!isClientRole(req.user.role)) {
    throw new ApiError(403, 'Only clients can shortlist proposals');
  }

  const proposal = await proposalService.shortlistProposal(req.params.id, req.user._id);

  res.json(new ApiResponse(200, proposal, 'Proposal shortlisted successfully'));
});

const rejectProposal = asyncHandler(async (req, res) => {
  if (!isClientRole(req.user.role)) {
    throw new ApiError(403, 'Only clients can reject proposals');
  }

  const proposal = await proposalService.rejectProposal(req.params.id, req.user._id);

  res.json(new ApiResponse(200, proposal, 'Proposal rejected successfully'));
});

const acceptProposal = asyncHandler(async (req, res) => {
  if (!isClientRole(req.user.role)) {
    throw new ApiError(403, 'Only clients can accept proposals');
  }

  const result = await proposalService.acceptProposal(req.params.id, req.user._id);

  res.json(new ApiResponse(200, result, 'Proposal accepted and contract created successfully'));
});

module.exports = {
  sendProposal,
  getProposalsForRequirement,
  getMyProposals,
  updateProposal,
  withdrawProposal,
  shortlistProposal,
  rejectProposal,
  acceptProposal,
};
