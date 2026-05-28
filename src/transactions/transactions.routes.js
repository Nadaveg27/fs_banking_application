// Transactions router: exposes endpoints for transfers and transaction history
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { getTransactions, transferMoney } = require('./transactions.service');

router.get('/', authenticate, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { counterparty: counterpartyEmail, startDate, endDate, sortBy, sortOrder } = req.query;
  try {
    const result = await getTransactions({ userId: req.userId, page, limit, counterpartyEmail, startDate, endDate, sortBy, sortOrder });
    res.status(200).json(result);
  } catch (err) {
    if (err.code === 'INVALID_PAGINATION') {
      return res.status(400).json({ message: 'Invalid pagination parameters' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', authenticate, async (req, res) => {
  const { recipientEmail, amount, reason } = req.body;
  if (!recipientEmail || amount === undefined || amount === null) {
    return res.status(400).json({ message: 'Recipient email and amount are required' });
  }
  try {
    const result = await transferMoney({ senderId: req.userId, recipientEmail, amount, reason });
    res.status(201).json(result);
  } catch (err) {
    if (err.code === 'REASON_TOO_LONG') {
      return res.status(400).json({ message: 'Reason must be 200 characters or fewer' });
    }
    if (err.code === 'INVALID_AMOUNT') {
      return res.status(400).json({ message: err.message });
    }
    if (err.code === 'INSUFFICIENT_BALANCE') {
      return res.status(400).json({ message: 'Insufficient funds' });
    }
    if (err.code === 'RECIPIENT_NOT_FOUND') {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    if (err.code === 'SELF_TRANSFER') {
      return res.status(400).json({ message: 'Cannot transfer to yourself' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
