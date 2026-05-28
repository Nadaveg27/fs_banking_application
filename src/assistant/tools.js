'use strict';

const { tool } = require('@langchain/core/tools');
const { z } = require('zod');
const { getAccountData } = require('../accounts/accounts.service');
const User = require('../models/user.model');

const getBalanceTool = tool(
    async (_input, config) => {
        const userId = config?.configurable?.userId;
        if (!userId) return 'Error: userId not found in config';
        const data = await getAccountData({ userId });
        return `Your current balance is $${data.balance.toFixed(2)}`;
    },
    {
        name: 'getBalance',
        description: 'Get the current account balance for the authenticated user',
        schema: z.object({}),
    }
);

const getRecentTransactionsTool = tool(
    async (input, config) => {
        const userId = config?.configurable?.userId;
        if (!userId) return 'Error: userId not found in config';
        const limit = input.limit || 5;
        const data = await getAccountData({ userId, limit });
        if (data.transactions.length === 0) return 'No transactions found.';
        const list = data.transactions.map(tx => {
            const dir = tx.amount > 0 ? 'Received' : 'Sent';
            const sign = tx.amount > 0 ? 'from' : 'to';
            return `${dir} $${Math.abs(tx.amount).toFixed(2)} ${sign} ${tx.counterpartyEmail}${tx.reason ? ` (${tx.reason})` : ''} on ${new Date(tx.date).toLocaleDateString()}`;
        }).join('\n');
        return `Recent transactions:\n${list}`;
    },
    {
        name: 'getRecentTransactions',
        description: 'Get recent transactions for the authenticated user',
        schema: z.object({
            limit: z.number().optional().describe('Number of transactions to return (default 5)'),
        }),
    }
);

const findUserTool = tool(
    async (input, _config) => {
        const user = await User.findOne({ email: input.email }).select('email');
        return JSON.stringify(user ? { exists: true, email: user.email } : { exists: false, email: input.email });
    },
    {
        name: 'findUser',
        description: 'Find a user by email address to check if they exist in the system',
        schema: z.object({
            email: z.string().describe('The email address to search for'),
        }),
    }
);

const prepareTransferTool = tool(
    async (input, config) => {
        const userId = config?.configurable?.userId;
        if (!userId) return JSON.stringify({ valid: false, reason: 'auth_error', message: 'Authentication error' });

        if (typeof input.amount !== 'number' || input.amount <= 0) {
            return JSON.stringify({ valid: false, reason: 'invalid_amount', message: 'Amount must be a positive number' });
        }

        const sender = await User.findById(userId).select('email');
        if (!sender) {
            return JSON.stringify({ valid: false, reason: 'sender_not_found', message: 'Sender not found' });
        }

        if (sender.email === input.recipientEmail) {
            return JSON.stringify({ valid: false, reason: 'self_transfer', message: 'Cannot transfer to yourself' });
        }

        const recipient = await User.findOne({ email: input.recipientEmail }).select('email');
        if (!recipient) {
            return JSON.stringify({ valid: false, reason: 'recipient_not_found', message: `No user found with email ${input.recipientEmail}` });
        }

        return JSON.stringify({
            valid: true,
            recipientEmail: input.recipientEmail,
            amount: input.amount,
            reason: input.reason || null,
            message: `Transfer of $${input.amount.toFixed(2)} to ${input.recipientEmail}${input.reason ? ` for "${input.reason}"` : ''} is ready to execute.`,
        });
    },
    {
        name: 'prepareTransfer',
        description: 'Validate a transfer before execution. Always call this before executeTransfer.',
        schema: z.object({
            recipientEmail: z.string().describe('Email of the recipient'),
            amount: z.number().describe('Amount to transfer (must be positive)'),
            reason: z.string().optional().describe('Reason for the transfer'),
        }),
    }
);


module.exports = { getBalanceTool, getRecentTransactionsTool, findUserTool, prepareTransferTool };
