'use strict';

const { runGraph } = require('./graph');

// Per-thread state: tracks pending transfer and confirmation status server-side
const threadStates = new Map();

async function processMessage({ message, userId, threadId }) {
    const state = threadStates.get(threadId) || { awaitingConfirmation: false, pendingTransfer: null };

    const result = await runGraph({
        message,
        userId,
        threadId,
        awaitingConfirmation: state.awaitingConfirmation,
        pendingTransfer: state.pendingTransfer,
    });

    threadStates.set(threadId, {
        awaitingConfirmation: result.awaitingConfirmation,
        pendingTransfer: result.pendingTransfer,
    });

    return { reply: result.reply, awaitingConfirmation: result.awaitingConfirmation };
}

module.exports = { processMessage };
