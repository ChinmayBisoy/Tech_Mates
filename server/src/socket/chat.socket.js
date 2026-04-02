const ChatRoom = require('../models/chatroom.model');
const chatService = require('../services/chat.service');
const notificationService = require('../services/notification.service');

module.exports = (io, socket) => {
  socket.on('chat:join', (roomId) => {
    if (roomId) {
      socket.join(String(roomId));
    }
  });

  socket.on('chat:leave', (roomId) => {
    if (roomId) {
      socket.leave(String(roomId));
    }
  });

  socket.on('chat:message', async (payload = {}) => {
    try {
      const { roomId, content, type = 'text', fileUrl = null } = payload;
      if (!roomId || !content) {
        return;
      }

      const message = await chatService.sendMessage(roomId, socket.user._id, content, type, fileUrl);
      io.to(String(roomId)).emit('chat:message', message);

      const room = await ChatRoom.findById(roomId).select('participants');
      if (room) {
        const recipients = room.participants.filter(
          (participantId) => String(participantId) !== String(socket.user._id)
        );

        for (const recipientId of recipients) {
          await notificationService.notifyNewMessage(recipientId, socket.user.name, roomId);
        }
      }
    } catch (error) {
      socket.emit('chat:error', { message: error.message });
    }
  });

  socket.on('chat:typing', ({ roomId } = {}) => {
    if (!roomId) {
      return;
    }

    socket.to(String(roomId)).emit('chat:typing', { userId: String(socket.user._id) });
  });

  socket.on('chat:stop_typing', ({ roomId } = {}) => {
    if (!roomId) {
      return;
    }

    socket.to(String(roomId)).emit('chat:stop_typing', { userId: String(socket.user._id) });
  });
};
