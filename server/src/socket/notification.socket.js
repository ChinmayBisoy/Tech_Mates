const notificationService = require('../services/notification.service');

module.exports = (io, socket) => {
  socket.on('notification:read', async (notificationId) => {
    if (!notificationId) {
      return;
    }

    try {
      await notificationService.markAsRead(notificationId, socket.user._id);
      socket.emit('notification:updated', { notificationId, isRead: true });
    } catch (error) {
      socket.emit('notification:error', { message: error.message });
    }
  });

  socket.on('notification:read_all', async () => {
    try {
      await notificationService.markAllAsRead(socket.user._id);
      socket.emit('notification:all_read');
    } catch (error) {
      socket.emit('notification:error', { message: error.message });
    }
  });
};
