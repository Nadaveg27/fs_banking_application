'use strict';
const { runGraph } = require('./graph');

async function processMessage({ message, userId, threadId }) {
    const result = await runGraph({ message, userId, threadId });
    return { reply: result.reply, awaitingConfirmation: result.awaitingConfirmation };
}

module.exports = { processMessage };
