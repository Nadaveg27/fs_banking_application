// Builds and exports the configured Express app — no listening, no DB connection.
// Lets tests (and server.js) import a ready-to-use app without starting a real server.
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./auth/auth.routes');
const accountsRoutes = require('./accounts/accounts.routes');
const transactionsRoutes = require('./transactions/transactions.routes');
const assistantRoutes = require('./assistant/assistant.routes');

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

module.exports = app;