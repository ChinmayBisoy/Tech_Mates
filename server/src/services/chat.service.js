const ChatRoom = require('../models/chatroom.model');
const Message = require('../models/message.model');
const ApiError = require('../utils/ApiError');

const normalizePagination = (pagination = {}) => {
  const parsedPage = Number.parseInt(pagination.page, 10);
  const parsedLimit = Number.parseInt(pagination.limit, 10);

  const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const limit = Number.isNaN(parsedLimit) || parsedLimit < 1 ? 30 : Math.min(parsedLimit, 100);

  return { page, limit, skip: (page - 1) * limit };
};

const getOrCreateRoom = async (user1Id, user2Id, contractId = null, purchaseId = null) => {
  if (String(user1Id) === String(user2Id)) {
    throw new ApiError(400, 'Cannot create chat room with the same user');
  }

  const existingRoom = await ChatRoom.findOne({
    participants: {
      $all: [user1Id, user2Id],
      $size: 2,
    },
    isActive: true,
  });

  if (existingRoom) {
    return existingRoom;
  }

  return ChatRoom.create({
    participants: [user1Id, user2Id],
    contractId: contractId || null,
    purchaseId: purchaseId || null,
  });
};

const getRooms = async (userId) => {
  return ChatRoom.find({
    participants: userId,
    isActive: true,
  })
    .populate('participants', 'name avatar role')
    .sort({ lastMessageAt: -1, updatedAt: -1 });
};

const getMessages = async (roomId, userId, pagination = {}) => {
  const room = await ChatRoom.findById(roomId);

  if (!room || !room.isActive) {
    throw new ApiError(404, 'Chat room not found');
  }

  if (!room.participants.some((id) => String(id) === String(userId))) {
    throw new ApiError(403, 'You are not a participant of this room');
  }

  const { page, limit, skip } = normalizePagination(pagination);

  const query = {
    roomId,
    isDeleted: false,
    hiddenFor: { $ne: userId },
  };

  const [messages, total] = await Promise.all([
    Message.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('senderId', 'name avatar role'),
    Message.countDocuments(query),
  ]);

  await Message.updateMany(
    {
      roomId,
      senderId: { $ne: userId },
      readBy: { $ne: userId },
      isDeleted: false,
      hiddenFor: { $ne: userId },
    },
    {
      $addToSet: { readBy: userId },
    }
  );

  return {
    messages: messages.reverse(),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
};

const sendMessage = async (roomId, senderId, content, type = 'text', fileUrl = null) => {
  if (!content || !String(content).trim()) {
    throw new ApiError(400, 'Message content is required');
  }

  const room = await ChatRoom.findById(roomId);
  if (!room || !room.isActive) {
    throw new ApiError(404, 'Chat room not found');
  }

  if (!room.participants.some((id) => String(id) === String(senderId))) {
    throw new ApiError(403, 'You are not a participant of this room');
  }

  const message = await Message.create({
    roomId,
    senderId,
    content: String(content).trim(),
    type,
    fileUrl,
    readBy: [senderId],
  });

  room.lastMessage = message.content;
  room.lastMessageAt = message.createdAt;
  room.lastMessageBy = senderId;
  await room.save();

  return Message.findById(message._id).populate('senderId', 'name avatar role');
};

const deleteMessage = async (messageId, senderId) => {
  const message = await Message.findOne({ _id: messageId, isDeleted: false });

  if (!message) {
    throw new ApiError(404, 'Message not found');
  }

  if (String(message.senderId) !== String(senderId)) {
    throw new ApiError(403, 'You can only delete your own message');
  }

  message.isDeleted = true;
  message.deletedAt = new Date();
  await message.save();

  return { success: true, messageId: String(message._id), roomId: String(message.roomId) };
};

const deleteMessageForMe = async (messageId, userId) => {
  const message = await Message.findOne({ _id: messageId, isDeleted: false });

  if (!message) {
    throw new ApiError(404, 'Message not found');
  }

  const room = await ChatRoom.findById(message.roomId);
  if (!room || !room.isActive) {
    throw new ApiError(404, 'Chat room not found');
  }

  if (!room.participants.some((id) => String(id) === String(userId))) {
    throw new ApiError(403, 'You are not a participant of this room');
  }

  await Message.updateOne(
    { _id: messageId },
    {
      $addToSet: { hiddenFor: userId },
    }
  );

  return {
    success: true,
    messageId: String(message._id),
    roomId: String(message.roomId),
  };
};

const clearRoomMessages = async (roomId, userId) => {
  const room = await ChatRoom.findById(roomId);

  if (!room || !room.isActive) {
    throw new ApiError(404, 'Chat room not found');
  }

  if (!room.participants.some((id) => String(id) === String(userId))) {
    throw new ApiError(403, 'You are not a participant of this room');
  }

  const result = await Message.updateMany(
    {
      roomId,
      isDeleted: false,
    },
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    }
  );

  room.lastMessage = '';
  room.lastMessageAt = null;
  room.lastMessageBy = null;
  await room.save();

  return {
    success: true,
    clearedCount: result.modifiedCount || 0,
    roomId: String(roomId),
  };
};

module.exports = {
  getOrCreateRoom,
  getRooms,
  getMessages,
  sendMessage,
  deleteMessage,
  deleteMessageForMe,
  clearRoomMessages,
};
