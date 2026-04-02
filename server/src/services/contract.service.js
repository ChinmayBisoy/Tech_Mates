const Contract = require('../models/contract.model');
const Proposal = require('../models/proposal.model');
const Requirement = require('../models/requirement.model');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const { calculateCommission } = require('./commission.service');
const notificationService = require('./notification.service');
const emailService = require('./email.service');

const normalizePagination = (pagination = {}) => {
  const parsedPage = Number.parseInt(pagination.page, 10);
  const parsedLimit = Number.parseInt(pagination.limit, 10);

  const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const limit = Number.isNaN(parsedLimit) || parsedLimit < 1 ? 10 : Math.min(parsedLimit, 50);

  return { page, limit, skip: (page - 1) * limit };
};

const createContractFromProposal = async (proposalInput) => {
  const proposal = await Proposal.findOne({
    _id: proposalInput._id || proposalInput,
    isDeleted: false,
  }).lean();

  if (!proposal) {
    throw new ApiError(404, 'Proposal not found');
  }

  const requirement = await Requirement.findById(proposal.requirementId).lean();
  if (!requirement || requirement.isDeleted) {
    throw new ApiError(404, 'Requirement not found');
  }

  const developer = await User.findById(proposal.developerId);
  if (!developer) {
    throw new ApiError(404, 'Developer not found');
  }

  const { platformFee, developerEarnings, rate } = calculateCommission(proposal.proposedPrice, developer);

  const milestones = (proposal.milestones || []).map((milestone) => ({
    title: milestone.title,
    description: milestone.description,
    amount: milestone.amount,
    dueDate: milestone.dueDate,
    status: 'pending',
  }));

  const contract = await Contract.create({
    requirementId: proposal.requirementId,
    proposalId: proposal._id,
    clientId: requirement.postedBy,
    developerId: proposal.developerId,
    title: requirement.title,
    totalAmount: proposal.proposedPrice,
    platformFee,
    developerEarnings,
    commissionRate: rate,
    milestones,
    status: 'active',
  });

  return contract;
};

const getContracts = async (userId, role, pagination = {}) => {
  const { page, limit, skip } = normalizePagination(pagination);

  const query = { isDeleted: false };
  if (role === 'client' || role === 'user') {
    query.clientId = userId;
  } else if (role === 'developer') {
    query.developerId = userId;
  } else {
    throw new ApiError(403, 'Invalid role for contract access');
  }

  if (pagination.status) {
    query.status = pagination.status;
  }

  const [items, total] = await Promise.all([
    Contract.find(query)
      .populate('clientId', 'name avatar')
      .populate('developerId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Contract.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

const getContractById = async (contractId, userId) => {
  const contract = await Contract.findOne({
    _id: contractId,
    isDeleted: false,
  })
    .populate('clientId', 'name avatar')
    .populate('developerId', 'name avatar');

  if (!contract) {
    throw new ApiError(404, 'Contract not found');
  }

  const isClient = String(contract.clientId._id || contract.clientId) === String(userId);
  const isDeveloper = String(contract.developerId._id || contract.developerId) === String(userId);

  if (!isClient && !isDeveloper) {
    throw new ApiError(403, 'You are not allowed to view this contract');
  }

  return contract;
};

const submitMilestone = async (contractId, developerId, milestoneId, submissionNote) => {
  const contract = await Contract.findOne({ _id: contractId, isDeleted: false });

  if (!contract) {
    throw new ApiError(404, 'Contract not found');
  }

  if (String(contract.developerId) !== String(developerId)) {
    throw new ApiError(403, 'You are not allowed to submit this milestone');
  }

  const milestone = contract.milestones.id(milestoneId);
  if (!milestone) {
    throw new ApiError(404, 'Milestone not found');
  }

  if (milestone.status !== 'pending') {
    throw new ApiError(400, 'Only pending milestones can be submitted');
  }

  milestone.status = 'submitted';
  milestone.submittedAt = new Date();
  milestone.submissionNote = submissionNote || '';

  await contract.save();

  return contract;
};

const approveMilestone = async (contractId, clientId, milestoneId) => {
  const contract = await Contract.findOne({ _id: contractId, isDeleted: false });

  if (!contract) {
    throw new ApiError(404, 'Contract not found');
  }

  if (String(contract.clientId) !== String(clientId)) {
    throw new ApiError(403, 'You are not allowed to approve this milestone');
  }

  const milestone = contract.milestones.id(milestoneId);
  if (!milestone) {
    throw new ApiError(404, 'Milestone not found');
  }

  if (milestone.status !== 'submitted') {
    throw new ApiError(400, 'Only submitted milestones can be approved');
  }

  milestone.status = 'approved';
  milestone.approvedAt = new Date();

  const developer = await User.findById(contract.developerId);
  if (!developer) {
    throw new ApiError(404, 'Developer not found');
  }

  const totalAmount = Number(contract.totalAmount || 0);
  const milestoneAmount = Number(milestone.amount || 0);
  const developerEarnings = Number(contract.developerEarnings || 0);

  const payout = totalAmount > 0
    ? Math.round((developerEarnings * milestoneAmount) / totalAmount)
    : 0;

  developer.walletBalance = Number(developer.walletBalance || 0) + payout;
  developer.totalEarnings = Number(developer.totalEarnings || 0) + payout;

  const allApproved = contract.milestones.every((item) => item.status === 'approved');
  if (allApproved && contract.status !== 'completed') {
    contract.status = 'completed';
    contract.completedAt = new Date();
    developer.totalContractsCompleted = Number(developer.totalContractsCompleted || 0) + 1;

    const client = await User.findById(contract.clientId);

    if (client?.email) {
      await emailService.sendEmail(
        client.email,
        'Contract completed - Leave your review',
        `Your contract "${contract.title}" is completed. Please leave a review for your developer.`,
        `<p>Your contract <strong>${contract.title}</strong> is completed. Please leave a review for your developer.</p>`
      );
    }

    if (developer?.email) {
      await emailService.sendEmail(
        developer.email,
        'Contract completed - Leave your review',
        `Your contract "${contract.title}" is completed. Please leave a review for your client.`,
        `<p>Your contract <strong>${contract.title}</strong> is completed. Please leave a review for your client.</p>`
      );
    }

    await notificationService.createNotification(
      contract.clientId,
      'review_received',
      'Leave a Review',
      'Your contract is completed. Please leave a review for the developer.',
      { contractId: contract._id }
    );

    await notificationService.createNotification(
      contract.developerId,
      'review_received',
      'Leave a Review',
      'Your contract is completed. Please leave a review for the client.',
      { contractId: contract._id }
    );
  }

  if (typeof developer.recalculateTier === 'function') {
    developer.recalculateTier();
  }

  await Promise.all([contract.save(), developer.save()]);

  await notificationService.notifyMilestoneApproved(contract.developerId, milestone, payout);

  return contract;
};

const requestRevision = async (contractId, clientId, milestoneId, revisionNote) => {
  const contract = await Contract.findOne({ _id: contractId, isDeleted: false });

  if (!contract) {
    throw new ApiError(404, 'Contract not found');
  }

  if (String(contract.clientId) !== String(clientId)) {
    throw new ApiError(403, 'You are not allowed to request revision for this milestone');
  }

  const milestone = contract.milestones.id(milestoneId);
  if (!milestone) {
    throw new ApiError(404, 'Milestone not found');
  }

  if (milestone.status !== 'submitted') {
    throw new ApiError(400, 'Only submitted milestones can be moved to revision request');
  }

  milestone.status = 'revision_requested';
  milestone.revisionNote = revisionNote || '';

  await contract.save();

  return contract;
};

const disputeMilestone = async (contractId, clientId, milestoneId) => {
  const contract = await Contract.findOne({ _id: contractId, isDeleted: false });

  if (!contract) {
    throw new ApiError(404, 'Contract not found');
  }

  if (String(contract.clientId) !== String(clientId)) {
    throw new ApiError(403, 'You are not allowed to dispute this milestone');
  }

  const milestone = contract.milestones.id(milestoneId);
  if (!milestone) {
    throw new ApiError(404, 'Milestone not found');
  }

  milestone.status = 'disputed';
  contract.status = 'disputed';

  await contract.save();

  return contract;
};

module.exports = {
  createContractFromProposal,
  getContracts,
  getContractById,
  submitMilestone,
  approveMilestone,
  requestRevision,
  disputeMilestone,
};
