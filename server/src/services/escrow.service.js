const Contract = require('../models/contract.model');
const Transaction = require('../models/transaction.model');
const User = require('../models/user.model');
const Wallet = require('../models/wallet.model');
const ApiError = require('../utils/ApiError');
const { calculateCommission } = require('./commission.service');
const stripeService = require('./stripe.service');

const notifyDeveloperPaymentReleased = async (developer, contract, milestone, amount) => {
  const developerName = developer?.name || 'Developer';
  const contractTitle = contract?.title || 'Contract';
  const milestoneTitle = milestone?.title || 'Milestone';

  console.log(
    `[PAYMENT_RELEASED] ${developerName} has a released milestone payment of ${amount} paise for "${milestoneTitle}" in "${contractTitle}".`
  );
};

const findMilestone = (contract, milestoneId) => {
  const milestone = contract.milestones.id(milestoneId);
  if (!milestone) {
    throw new ApiError(404, 'Milestone not found');
  }

  return milestone;
};

const fundMilestone = async (contractId, milestoneId, clientId) => {
  const contract = await Contract.findOne({ _id: contractId, isDeleted: false });
  if (!contract) {
    throw new ApiError(404, 'Contract not found');
  }

  if (String(contract.clientId) !== String(clientId)) {
    throw new ApiError(403, 'Only contract client can fund this milestone');
  }

  const milestone = findMilestone(contract, milestoneId);
  if (milestone.status !== 'pending') {
    throw new ApiError(400, 'Only pending milestones can be funded');
  }

  const developer = await User.findById(contract.developerId);
  if (!developer) {
    throw new ApiError(404, 'Developer not found');
  }

  const milestoneAmount = Number(milestone.amount || 0);
  if (!Number.isInteger(milestoneAmount) || milestoneAmount <= 0) {
    throw new ApiError(400, 'Milestone amount must be a positive integer in paise');
  }

  const { platformFee, developerEarnings, rate } = calculateCommission(milestoneAmount, developer);

  const { clientSecret, paymentIntentId } = await stripeService.createPaymentIntent(
    milestoneAmount,
    'inr',
    {
      contractId: String(contractId),
      milestoneId: String(milestoneId),
      clientId: String(clientId),
      developerId: String(contract.developerId),
    }
  );

  const transaction = await Transaction.create({
    contractId: contract._id,
    milestoneId: String(milestone._id),
    clientId: contract.clientId,
    developerId: contract.developerId,
    amount: milestoneAmount,
    platformFee,
    developerEarnings,
    commissionRate: rate,
    stripePaymentIntentId: paymentIntentId,
    status: 'held',
    type: 'milestone_payment',
  });

  return {
    clientSecret,
    transaction,
  };
};

const releaseMilestone = async (contractId, milestoneId, clientId) => {
  const contract = await Contract.findOne({ _id: contractId, isDeleted: false });
  if (!contract) {
    throw new ApiError(404, 'Contract not found');
  }

  if (String(contract.clientId) !== String(clientId)) {
    throw new ApiError(403, 'Only contract client can release this milestone payment');
  }

  const milestone = findMilestone(contract, milestoneId);
  if (milestone.status !== 'approved') {
    throw new ApiError(400, 'Only approved milestones can be released');
  }

  const transaction = await Transaction.findOne({
    contractId: contract._id,
    milestoneId: String(milestone._id),
    status: 'held',
    isDeleted: false,
  });

  if (!transaction) {
    throw new ApiError(404, 'Held transaction not found for this milestone');
  }

  transaction.status = 'released';
  transaction.type = 'milestone_release';
  await transaction.save();

  const developer = await User.findById(contract.developerId);
  if (!developer) {
    throw new ApiError(404, 'Developer not found');
  }

  developer.walletBalance = Number(developer.walletBalance || 0) + Number(transaction.developerEarnings || 0);
  developer.totalEarnings = Number(developer.totalEarnings || 0) + Number(transaction.developerEarnings || 0);

  await developer.save();

  const wallet = await Wallet.findOne({ userId: contract.developerId });
  if (wallet) {
    wallet.balance = Number(wallet.balance || 0) + Number(transaction.developerEarnings || 0);
    wallet.totalEarnings = Number(wallet.totalEarnings || 0) + Number(transaction.developerEarnings || 0);
    await wallet.save();
  }

  await notifyDeveloperPaymentReleased(
    developer,
    contract,
    milestone,
    Number(transaction.developerEarnings || 0)
  );

  return {
    transaction,
    developerEarnings: Number(transaction.developerEarnings || 0),
  };
};

const refundMilestone = async (contractId, milestoneId) => {
  const transaction = await Transaction.findOne({
    contractId,
    milestoneId: String(milestoneId),
    isDeleted: false,
  }).sort({ createdAt: -1 });

  if (!transaction) {
    throw new ApiError(404, 'Transaction not found for milestone');
  }

  if (!transaction.stripePaymentIntentId) {
    throw new ApiError(400, 'Stripe payment intent not found for transaction');
  }

  const refund = await stripeService.createRefund(transaction.stripePaymentIntentId);

  transaction.status = 'refunded';
  transaction.type = 'refund';
  await transaction.save();

  return refund;
};

module.exports = {
  fundMilestone,
  releaseMilestone,
  refundMilestone,
};
