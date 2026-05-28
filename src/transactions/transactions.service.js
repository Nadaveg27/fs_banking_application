// Transactions service: business logic for processing and recording transactions
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const { getIo } = require('../socket');

async function getTransactions({ userId, page = 1, limit = 10, counterpartyEmail, startDate, endDate, sortBy = 'date', sortOrder = 'desc' }) {
  limit = Math.min(limit, 50);
  const skip = (page - 1) * limit;

  const filter = { perspectiveUserId: userId };
  if (counterpartyEmail) {
    filter.counterpartyEmail = counterpartyEmail;
  }

  if (startDate) {
    const start = new Date(startDate);
    if (!isNaN(start)) {
      filter.date = { ...filter.date, $gte: start };
    }
  }

  if (endDate) {
    const end = new Date(endDate);
    if (!isNaN(end)) {
      end.setHours(23, 59, 59, 999);
      filter.date = { ...filter.date, $lte: end };
    }
  }

  const total = await Transaction.countDocuments(filter);
  let transactions;

  if (sortBy === 'amount') {
    const order = sortOrder === 'asc' ? 1 : -1;
    const all = await Transaction.find(filter);
    all.sort((a, b) => (Math.abs(a.amount) - Math.abs(b.amount)) * order);
    transactions = all.slice(skip, skip + limit);
  } else {
    const order = sortOrder === 'asc' ? 1 : -1;
    transactions = await Transaction.find(filter).sort({ date: order }).skip(skip).limit(limit);
  }

  return { transactions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function transferMoney({ senderId, recipientEmail, amount, reason }) {
  if (typeof amount !== 'number' || amount <= 0) {
    const err = new Error('Amount must be a positive number');
    err.code = 'INVALID_AMOUNT';
    throw err;
  }

  const sender = await User.findById(senderId);
  if (!sender) {
    const err = new Error('Sender not found');
    err.code = 'USER_NOT_FOUND';
    throw err;
  }

  const recipient = await User.findOne({ email: recipientEmail });
  if (!recipient) {
    const err = new Error('No user found with that email');
    err.code = 'RECIPIENT_NOT_FOUND';
    throw err;
  }

  if (sender.email === recipientEmail) {
    const err = new Error('Cannot transfer to yourself');
    err.code = 'SELF_TRANSFER';
    throw err;
  }

  if (sender.balance < amount) {
    const err = new Error('Insufficient funds');
    err.code = 'INSUFFICIENT_BALANCE';
    throw err;
  }

  await User.findByIdAndUpdate(senderId, { $inc: { balance: -amount } });
  await User.findByIdAndUpdate(recipient._id, { $inc: { balance: amount } });

  const now = new Date();
  const [senderTx] = await Transaction.insertMany([
    {
      perspectiveUserId: senderId,
      counterpartyEmail: recipientEmail,
      amount: -amount,
      reason: reason || null,
      date: now,
    },
    {
      perspectiveUserId: recipient._id,
      counterpartyEmail: sender.email,
      amount: amount,
      reason: reason || null,
      date: now,
    },
  ]);

  getIo().to(recipient._id.toString()).emit('transfer_received', {
      from: sender.email,
      amount,
      reason: reason || null,
      date: new Date()
  });

  const updatedSender = await User.findById(senderId);

  return {
    message: 'Transfer successful',
    newBalance: updatedSender.balance,
    transaction: senderTx,
  };
}

module.exports = { getTransactions, transferMoney };
