const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');

const emitToUser = (userId, eventName, payload) => {
  if (global.io) {
    global.io.to(String(userId)).emit(eventName, payload);
  }
};

const createNotification = async (userId, type, title, message, data = {}) => {
  const notification = await Notification.create({
    userId,
    type,
    title,
    message,
    data,
  });

  emitToUser(userId, 'notification:new', notification);
  return notification;
};

const notifyNewRequirement = async (requirement, clientId = null) => {
  const developerQuery = {
    role: 'developer',
    isDeleted: false,
    isBanned: false,
    status: 'active',
  };

  if (clientId) {
    developerQuery._id = { $ne: clientId };
  }

  const developers = await User.find(developerQuery).select('_id');

  if (!developers.length) {
    return { success: true, count: 0 };
  }

  await Promise.all(
    developers.map((developer) =>
      createNotification(
        developer._id,
        'new_requirement',
        'New Requirement Posted',
        `A client posted a new requirement: ${requirement.title}`,
        {
          requirementId: requirement._id,
        }
      )
    )
  );

  return { success: true, count: developers.length };
};

const notifyProposalReceived = async (clientId, proposal, requirement) => {
  return createNotification(
    clientId,
    'proposal_received',
    'New Proposal Received',
    `A developer submitted a proposal on your requirement: ${requirement.title}`,
    {
      proposalId: proposal._id,
      requirementId: requirement._id,
    }
  );
};

const notifyProposalAccepted = async (developerId, proposal) => {
  return createNotification(
    developerId,
    'proposal_accepted',
    'Your Proposal Was Accepted!',
    'Your proposal has been accepted. A contract has been created.',
    {
      proposalId: proposal._id,
      requirementId: proposal.requirementId,
    }
  );
};

const notifyMilestoneSubmitted = async (clientId, milestone, contract) => {
  return createNotification(
    clientId,
    'milestone_submitted',
    'Milestone Submitted',
    `A milestone has been submitted for contract: ${contract.title}`,
    {
      contractId: contract._id,
      milestoneId: milestone._id,
    }
  );
};

const notifyMilestoneApproved = async (developerId, milestone, earnings) => {
  return createNotification(
    developerId,
    'milestone_approved',
    'Milestone Approved',
    `Your milestone "${milestone.title}" was approved. Earnings credited: ${earnings} paise.`,
    {
      milestoneId: milestone._id,
      earnings,
    }
  );
};

const notifyPaymentReleased = async (developerId, amount) => {
  return createNotification(
    developerId,
    'payment_released',
    'Payment Released',
    `Your payment of ${amount} paise has been released.`,
    {
      amount,
    }
  );
};

const notifyListingApproved = async (sellerId, listing) => {
  return createNotification(
    sellerId,
    'listing_approved',
    'Listing Approved',
    `Your listing "${listing.title}" is now live.`,
    {
      listingId: listing._id,
      slug: listing.slug,
    }
  );
};

const notifyListingRejected = async (sellerId, listing, reason) => {
  return createNotification(
    sellerId,
    'listing_rejected',
    'Listing Rejected',
    `Your listing "${listing.title}" was rejected. Reason: ${reason}`,
    {
      listingId: listing._id,
      reason,
    }
  );
};

const notifyPurchaseCompleted = async (buyerId, sellerId, listing) => {
  await createNotification(
    buyerId,
    'purchase_completed',
    'Purchase Completed',
    `Your purchase for "${listing.title}" has been completed successfully.`,
    {
      listingId: listing._id,
    }
  );

  await createNotification(
    sellerId,
    'purchase_completed',
    'Sale Completed',
    `Your listing "${listing.title}" was purchased successfully.`,
    {
      listingId: listing._id,
    }
  );
};

const notifyDisputeRaised = async (sellerId, adminId, dispute) => {
  await createNotification(
    sellerId,
    'dispute_raised',
    'Dispute Raised',
    'A dispute has been raised against one of your transactions.',
    {
      disputeId: dispute._id,
      purchaseId: dispute.purchaseId,
      adminId,
    }
  );

  const admins = await User.find({ role: 'admin' }).select('_id');
  for (const admin of admins) {
    await createNotification(
      admin._id,
      'dispute_raised',
      'New Dispute Raised',
      'A new dispute requires review.',
      {
        disputeId: dispute._id,
        purchaseId: dispute.purchaseId,
      }
    );
  }
};

const notifyNewMessage = async (recipientId, senderName, roomId) => {
  return createNotification(
    recipientId,
    'new_message',
    'New Message',
    `You received a new message from ${senderName}.`,
    {
      roomId,
    }
  );
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({ _id: notificationId, userId });

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  return notification;
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    {
      userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    }
  );

  return { success: true };
};

const deleteAllNotifications = async (userId) => {
  const result = await Notification.deleteMany({ userId });
  return { success: true, deletedCount: result.deletedCount };
};

const getNotifications = async (userId, pagination = {}) => {
  const parsedPage = Number.parseInt(pagination.page, 10);
  const parsedLimit = Number.parseInt(pagination.limit, 10);

  const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const limit = Number.isNaN(parsedLimit) || parsedLimit < 1 ? 20 : Math.min(parsedLimit, 50);
  const skip = (page - 1) * limit;

  const [notifications, unreadCount, total] = await Promise.all([
    Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ userId, isRead: false }),
    Notification.countDocuments({ userId }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

module.exports = {
  createNotification,
  notifyNewRequirement,
  notifyProposalReceived,
  notifyProposalAccepted,
  notifyMilestoneSubmitted,
  notifyMilestoneApproved,
  notifyPaymentReleased,
  notifyListingApproved,
  notifyListingRejected,
  notifyPurchaseCompleted,
  notifyDisputeRaised,
  notifyNewMessage,
  markAsRead,
  markAllAsRead,
  deleteAllNotifications,
  getNotifications,
};
