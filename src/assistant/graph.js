'use strict';

const { StateGraph, END, MemorySaver, Annotation } = require('@langchain/langgraph');
const { ToolNode } = require('@langchain/langgraph/prebuilt');
const { ChatGroq } = require('@langchain/groq');
const { HumanMessage } = require('@langchain/core/messages');
const { transferMoney } = require('../transactions/transactions.service');
const { getBalanceTool, getRecentTransactionsTool, findUserTool, prepareTransferTool } = require('./tools');

const SYSTEM_PROMPT = `You are a banking assistant for Maccabim Bank.
You can check balances, view transactions, find users, and transfer money.

For transfers:
- Always use prepareTransfer first to validate the transfer details
- After prepareTransfer succeeds, ask the user to explicitly confirm the transfer (yes/no)
- Only call executeTransfer after the user has explicitly confirmed with "yes"
- Never call executeTransfer without prior user confirmation

Be concise and helpful.`;

const allTools = [getBalanceTool, getRecentTransactionsTool, findUserTool, prepareTransferTool];

const model = new ChatGroq({ model: 'llama-3.3-70b-versatile' }).bindTools(allTools);
const toolNode = new ToolNode(allTools);
const checkpointer = new MemorySaver();

const StateAnnotation = Annotation.Root({
    messages: Annotation({
        reducer: (state, update) => state.concat(Array.isArray(update) ? update : [update]),
        default: () => [],
    }),
    userId: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => '' }),
    pendingTransfer: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => null }),
    awaitingConfirmation: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => false }),
});

async function agentNode(state, config) {
    const response = await model.invoke(
        [{ role: 'system', content: SYSTEM_PROMPT }, ...state.messages],
        config
    );
    return { messages: [response] };
}

function shouldContinue(state) {
    const last = state.messages[state.messages.length - 1];
    return last.tool_calls && last.tool_calls.length > 0 ? 'tools' : END;
}

const graph = new StateGraph(StateAnnotation)
    .addNode('agent', agentNode)
    .addNode('tools', toolNode)
    .addEdge('__start__', 'agent')
    .addConditionalEdges('agent', shouldContinue)
    .addEdge('tools', 'agent')
    .compile({ checkpointer });

async function runGraph({ message, userId, threadId, pendingTransfer, awaitingConfirmation }) {
    // Code-level confirmation gate: handle yes/no without touching the graph
    if (awaitingConfirmation) {
        const answer = message.trim().toLowerCase();
        if (answer === 'no') {
            return { reply: 'Transfer cancelled.', awaitingConfirmation: false, pendingTransfer: null };
        }
        if (answer === 'yes') {
            if (!pendingTransfer) {
                return { reply: 'No pending transfer found.', awaitingConfirmation: false, pendingTransfer: null };
            }
            try {
                const result = await transferMoney({
                    senderId: userId,
                    recipientEmail: pendingTransfer.recipientEmail,
                    amount: pendingTransfer.amount,
                    reason: pendingTransfer.reason || null,
                });
                return {
                    reply: `Transfer successful! $${pendingTransfer.amount.toFixed(2)} sent to ${pendingTransfer.recipientEmail}. New balance: $${result.newBalance.toFixed(2)}`,
                    awaitingConfirmation: false,
                    pendingTransfer: null,
                };
            } catch (err) {
                return {
                    reply: `Transfer failed: ${err.message}`,
                    awaitingConfirmation: false,
                    pendingTransfer: null,
                };
            }
        }
    }

    const config = { configurable: { thread_id: threadId, userId } };
    const result = await graph.invoke({ messages: [new HumanMessage(message)] }, config);

    const lastMsg = result.messages[result.messages.length - 1];
    const reply = typeof lastMsg.content === 'string'
        ? lastMsg.content
        : Array.isArray(lastMsg.content)
            ? lastMsg.content.map(c => (typeof c === 'string' ? c : c.text || '')).join('')
            : String(lastMsg.content);

    // Detect if prepareTransfer was called with valid=true in this turn
    let newAwaitingConfirmation = false;
    let newPendingTransfer = null;

    // Only inspect messages added after the human message we just sent
    const msgList = result.messages;
    let lastHumanIdx = -1;
    for (let i = msgList.length - 1; i >= 0; i--) {
        if (typeof msgList[i]._getType === 'function' && msgList[i]._getType() === 'human') {
            lastHumanIdx = i;
            break;
        }
    }
    const recentMsgs = lastHumanIdx >= 0 ? msgList.slice(lastHumanIdx + 1) : msgList;

    for (const msg of recentMsgs) {
        if (msg.name === 'prepareTransfer' && msg.tool_call_id) {
            try {
                const parsed = JSON.parse(msg.content);
                if (parsed.valid === true) {
                    newAwaitingConfirmation = true;
                    newPendingTransfer = {
                        recipientEmail: parsed.recipientEmail,
                        amount: parsed.amount,
                        reason: parsed.reason,
                    };
                }
            } catch (_) {
                // non-JSON content, skip
            }
        }
    }

    return { reply, awaitingConfirmation: newAwaitingConfirmation, pendingTransfer: newPendingTransfer };
}

module.exports = { runGraph };
