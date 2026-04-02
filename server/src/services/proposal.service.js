const Proposal = require('../models/proposal.model');
const Requirement = require('../models/requirement.model');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const { createContractFromProposal } = require('./contract.service');
const notificationService = require('./notification.service');
const emailService = require('./email.service');

const formatINRFromPaise = (paise = 0) => {
  const rupees = Number(paise || 0) / 100;
  return `₹${rupees.toLocaleString('en-IN')}`;
};

const normalizePagination = (pagination = {}) => {
  const parsedPage = Number.parseInt(pagination.page, 10);
  const parsedLimit = Number.parseInt(pagination.limit, 10);

  const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const limit = Number.isNaN(parsedLimit) || parsedLimit < 1 ? 10 : Math.min(parsedLimit, 50);

  return { page, limit, skip: (page - 1) * limit };
};

const sendProposal = async (developerId, data) => {
  const requirement = await Requirement.findOne({
    _id: data.requirementId,
    isDeleted: false,
    status: 'open',
  });

  if (!requirement) {
    throw new ApiError(404, 'Requirement not found or not open for proposals');
  }

  const existingProposal = await Proposal.findOne({
    requirementId: data.requirementId,
    developerId,
    isDeleted: false,
  });

  if (existingProposal) {
    throw new ApiError(409, 'You have already submitted a proposal for this requirement');
  }

  const developer = await User.findById(developerId);
  if (!developer) {
    throw new ApiError(404, 'Developer not found');
  }

  const isPro = Boolean(developer.isPro);
  const activeProposalCount = Number(developer.activeProposalCount || 0);

  if (!isPro && activeProposalCount >= 5) {
    throw new ApiError(403, 'Free plan limit reached. Upgrade to Pro to submit more proposals');
  }

  const proposal = await Proposal.create({
    requirementId: data.requirementId,
    developerId,
    coverLetter: data.coverLetter,
    proposedPrice: data.proposedPrice,
    deliveryDays: data.deliveryDays,
    milestones: data.milestones || [],
    portfolioLinks: data.portfolioLinks || [],
  });

  requirement.proposals.push(proposal._id);
  await requirement.save();

  if (!isPro) {
    developer.activeProposalCount = activeProposalCount + 1;
    await developer.save();
  }

  try {
    await notificationService.notifyProposalReceived(requirement.postedBy, proposal, requirement);
  } catch (error) {
    console.error('Failed to create proposal received notification:', error);
  }

  try {
    const client = await User.findById(requirement.postedBy).select('email name');

    if (client?.email) {
      const formattedPrice = formatINRFromPaise(proposal.proposedPrice);
      const subject = `New proposal received for ${requirement.title || 'your requirement'}`;
      const text = `Hi ${client.name || 'Client'},\n\nYou received a new proposal from ${developer.name || 'a developer'} for your requirement ${requirement.title || ''}.\n\nProposed price: ${formattedPrice}\nDelivery timeline: ${proposal.deliveryDays} day(s)\n\nPlease login to TechMates to review and take action.\n\nRegards,\nTechMates`;
      const html = `
        <p>Hi ${client.name || 'Client'},</p>
        <p>You received a new proposal from <strong>${developer.name || 'a developer'}</strong> for your requirement <strong>${requirement.title || 'Requirement'}</strong>.</p>
        <p><strong>Proposed price:</strong> ${formattedPrice}<br/>
        <strong>Delivery timeline:</strong> ${proposal.deliveryDays} day(s)</p>
        <p>Please login to TechMates to review and take action.</p>
        <p>Regards,<br/>TechMates</p>
      `;

      await emailService.sendEmail(client.email, subject, text, html);
    }
  } catch (error) {
    console.error('Failed to send proposal received email:', error);
  }

  return proposal;
};

const getProposalsForRequirement = async (requirementId, clientId) => {
  const requirement = await Requirement.findOne({ _id: requirementId, isDeleted: false });

  if (!requirement) {
    throw new ApiError(404, 'Requirement not found');
  }

  if (String(requirement.postedBy) !== String(clientId)) {
    throw new ApiError(403, 'You are not allowed to view these proposals');
  }

  const proposals = await Proposal.find({ requirementId, isDeleted: false }).populate(
    'developerId',
    'name avatar tier isPro avgRating portfolioLinks'
  );

  await Proposal.updateMany(
    {
      requirementId,
      clientViewed: false,
      isDeleted: false,
    },
    {
      $set: { clientViewed: true },
    }
  );

  return proposals;
};

const getMyProposals = async (developerId, pagination = {}) => {
  const { page, limit, skip } = normalizePagination(pagination);

  const query = { developerId, isDeleted: false };

  const [items, total] = await Promise.all([
    Proposal.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('requirementId'),
    Proposal.countDocuments(query),
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

const updateProposal = async (proposalId, developerId, data) => {
  const proposal = await Proposal.findOne({ _id: proposalId, isDeleted: false });

  if (!proposal) {
    throw new ApiError(404, 'Proposal not found');
  }

  if (String(proposal.developerId) !== String(developerId)) {
    throw new ApiError(403, 'You are not allowed to update this proposal');
  }

  if (!['pending', 'shortlisted'].includes(proposal.status)) {
    throw new ApiError(400, 'Only pending or shortlisted proposals can be edited');
  }

  proposal.coverLetter = data.coverLetter;
  proposal.proposedPrice = data.proposedPrice;
  proposal.deliveryDays = data.deliveryDays;
  proposal.milestones = data.milestones || proposal.milestones;
  proposal.portfolioLinks = data.portfolioLinks || proposal.portfolioLinks;

  await proposal.save();

  return proposal;
};

const withdrawProposal = async (proposalId, developerId) => {
  const proposal = await Proposal.findOne({ _id: proposalId, isDeleted: false });

  if (!proposal) {
    throw new ApiError(404, 'Proposal not found');
  }

  if (String(proposal.developerId) !== String(developerId)) {
    throw new ApiError(403, 'You are not allowed to withdraw this proposal');
  }

  if (!['pending', 'shortlisted'].includes(proposal.status)) {
    throw new ApiError(400, 'Only pending or shortlisted proposals can be withdrawn');
  }

  proposal.status = 'withdrawn';
  await proposal.save();

  const developer = await User.findById(developerId);
  if (developer && !developer.isPro) {
    const count = Number(developer.activeProposalCount || 0);
    developer.activeProposalCount = Math.max(0, count - 1);
    await developer.save();
  }

  return proposal;
};

const shortlistProposal = async (proposalId, clientId) => {
  const proposal = await Proposal.findOne({ _id: proposalId, isDeleted: false });

  if (!proposal) {
    throw new ApiError(404, 'Proposal not found');
  }

  const requirement = await Requirement.findById(proposal.requirementId);

  if (!requirement || requirement.isDeleted) {
    throw new ApiError(404, 'Requirement not found');
  }

  if (String(requirement.postedBy) !== String(clientId)) {
    throw new ApiError(403, 'You are not allowed to shortlist this proposal');
  }

  proposal.status = 'shortlisted';
  await proposal.save();

  return proposal;
};

const rejectProposal = async (proposalId, clientId) => {
  const proposal = await Proposal.findOne({ _id: proposalId, isDeleted: false });

  if (!proposal) {
    throw new ApiError(404, 'Proposal not found');
  }

  const requirement = await Requirement.findById(proposal.requirementId);

  if (!requirement || requirement.isDeleted) {
    throw new ApiError(404, 'Requirement not found');
  }

  if (String(requirement.postedBy) !== String(clientId)) {
    throw new ApiError(403, 'You are not allowed to reject this proposal');
  }

  proposal.status = 'rejected';
  await proposal.save();

  const developer = await User.findById(proposal.developerId);
  if (developer && !developer.isPro) {
    const count = Number(developer.activeProposalCount || 0);
    developer.activeProposalCount = Math.max(0, count - 1);
    await developer.save();
  }

  return proposal;
};

const acceptProposal = async (proposalId, clientId) => {
  const proposal = await Proposal.findOne({ _id: proposalId, isDeleted: false });

  if (!proposal) {
    throw new ApiError(404, 'Proposal not found');
  }

  const requirement = await Requirement.findById(proposal.requirementId);

  if (!requirement || requirement.isDeleted) {
    throw new ApiError(404, 'Requirement not found');
  }

  if (String(requirement.postedBy) !== String(clientId)) {
    throw new ApiError(403, 'You are not allowed to accept this proposal');
  }

  proposal.status = 'accepted';
  await proposal.save();

  const otherProposals = await Proposal.find({
    requirementId: proposal.requirementId,
    _id: { $ne: proposal._id },
    status: { $nin: ['rejected', 'withdrawn'] },
    isDeleted: false,
  });

  for (const otherProposal of otherProposals) {
    otherProposal.status = 'rejected';
    await otherProposal.save();

    const developer = await User.findById(otherProposal.developerId);
    if (developer && !developer.isPro) {
      const count = Number(developer.activeProposalCount || 0);
      developer.activeProposalCount = Math.max(0, count - 1);
      await developer.save();
    }
  }

  requirement.status = 'in_progress';
  requirement.selectedProposal = proposal._id;
  await requirement.save();

  const contract = await createContractFromProposal(proposal);

  await notificationService.notifyProposalAccepted(proposal.developerId, proposal);

  try {
    const [developer, client] = await Promise.all([
      User.findById(proposal.developerId).select('email name'),
      User.findById(clientId).select('name'),
    ]);

    if (developer?.email) {
      const subject = `Your proposal was accepted for ${requirement.title || 'a requirement'}`;
      const text = `Hi ${developer.name || 'Developer'},\n\nGreat news! ${client?.name || 'A client'} accepted your proposal for ${requirement.title || 'a requirement'}.\n\nPlease login to TechMates to view the contract and next steps.\n\nRegards,\nTechMates`;
      const html = `
        <p>Hi ${developer.name || 'Developer'},</p>
        <p>Great news! <strong>${client?.name || 'A client'}</strong> accepted your proposal for <strong>${requirement.title || 'a requirement'}</strong>.</p>
        <p>Please login to TechMates to view the contract and next steps.</p>
        <p>Regards,<br/>TechMates</p>
      `;

      await emailService.sendEmail(developer.email, subject, text, html);
    }
  } catch (error) {
    console.error('Failed to send proposal accepted email:', error);
  }

  return { proposal, contract };
};

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
