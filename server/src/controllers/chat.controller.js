const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const chatService = require('../services/chat.service');

const getRooms = asyncHandler(async (req, res) => {
  const rooms = await chatService.getRooms(req.user._id);
  res.json(new ApiResponse(200, rooms, 'Chat rooms fetched successfully'));
});

const getMessages = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const result = await chatService.getMessages(roomId, req.user._id, req.query);
  res.json(new ApiResponse(200, result, 'Messages fetched successfully'));
});

const createRoom = asyncHandler(async (req, res) => {
  const { userId, contractId = null, purchaseId = null } = req.body;

  if (!userId) {
    throw new ApiError(400, 'userId is required');
  }

  const room = await chatService.getOrCreateRoom(req.user._id, userId, contractId, purchaseId);
  res.json(new ApiResponse(200, room, 'Chat room ready'));
});

const deleteMessage = asyncHandler(async (req, res) => {
  const result = await chatService.deleteMessage(req.params.messageId, req.user._id);

  if (global.io && result?.roomId && result?.messageId) {
    global.io.to(String(result.roomId)).emit('chat:message_deleted', {
      roomId: String(result.roomId),
      messageId: String(result.messageId),
      deletedBy: String(req.user._id),
      scope: 'everyone',
    });
  }

  res.json(new ApiResponse(200, result, 'Message deleted successfully'));
});

const deleteMessageForMe = asyncHandler(async (req, res) => {
  const result = await chatService.deleteMessageForMe(req.params.messageId, req.user._id);
  res.json(new ApiResponse(200, result, 'Message deleted for you successfully'));
});

const clearRoomMessages = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const result = await chatService.clearRoomMessages(roomId, req.user._id);

  if (global.io) {
    global.io.to(String(roomId)).emit('chat:cleared', {
      roomId: String(roomId),
      clearedBy: String(req.user._id),
    });
  }

  res.json(new ApiResponse(200, result, 'Chat cleared successfully'));
});

module.exports = {
  getRooms,
  getMessages,
  createRoom,
  deleteMessage,
  deleteMessageForMe,
  clearRoomMessages,
};
