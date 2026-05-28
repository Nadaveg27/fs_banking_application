// Accounts service: business logic for retrieving and managing account data
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');

async function getAccountData({ userId, page = 1, limit = 10 }) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  limit = Math.min(limit, 50);
  const skip = (page - 1) * limit;
  const total = await Transaction.countDocuments({ perspectiveUserId: userId });
  const transactions = await Transaction.find({ perspectiveUserId: userId })
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    balance: user.balance,
    transactions,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

module.exports = { getAccountData };
