// Entry point: connects to MongoDB, sets up Socket.IO, and starts the server
require('dotenv').config();
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { setIo } = require('./src/socket');
const app = require('./src/app');

const PORT = process.env.PORT || 3000;
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: process.env.FRONTEND_URL, credentials: true } });
setIo(io);
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`Socket joined room: ${userId}`);
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });