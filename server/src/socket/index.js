const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake?.auth?.token;

      if (!token) {
        return next(new Error('Authentication token is required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded._id).select('_id name role avatar');

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = String(socket.user._id);
    socket.join(userId);

    console.log(`[SOCKET_CONNECTED] user=${userId}`);

    require('./chat.socket')(io, socket);
    require('./notification.socket')(io, socket);

    socket.on('disconnect', () => {
      console.log(`[SOCKET_DISCONNECTED] user=${userId}`);
    });
  });

  return io;
};

module.exports = {
  initSocket,
};
