// Entry point: configures Express app, connects to MongoDB, mounts routers, and starts the server
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { setIo } = require('./src/socket');
const authRoutes = require('./src/auth/auth.routes');
const accountsRoutes = require('./src/accounts/accounts.routes');
const transactionsRoutes = require('./src/transactions/transactions.routes');
const assistantRoutes = require('./src/assistant/assistant.routes');

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/assistant', assistantRoutes);

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

