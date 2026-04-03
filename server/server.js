require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require("./src/app");
const connectToDB = require("./src/config/db");
const { initSocket } = require('./src/socket/index');


connectToDB();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = initSocket(server);
global.io = io;

let isShuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`[SHUTDOWN] Received ${signal}. Closing server...`);

  server.close(async () => {
    try {
      await mongoose.connection.close();
      console.log('[SHUTDOWN] MongoDB connection closed.');
      console.log('[SHUTDOWN] Shutdown complete.');
      process.exit(0);
    } catch (error) {
      console.error('[SHUTDOWN] Error during shutdown:', error);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] Unhandled promise rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('[FATAL] Uncaught exception:', error);
  process.exit(1);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});