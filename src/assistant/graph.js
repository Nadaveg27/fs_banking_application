'use strict';
const { StateGraph, END, MemorySaver, Annotation, interrupt, Command } = require('@langchain/langgraph');
const { ToolNode } = require('@langchain/langgraph/prebuilt');
const { ChatGroq } = require('@langchain/groq');
const { HumanMessage } = require('@langchain/core/messages');
const { transferMoney } = require('../transactions/transactions.service');
const { getAccountData } = require('../accounts/accounts.service');
const { getBalanceTool, getRecentTransactionsTool, findUserTool, prepareTransferTool } = require('./tools');

const SYSTEM_PROMPT = `You are a banking assistant for Maccabim Bank.
You can check balances, view transactions, find users, and transfer money.

For transfers:
- Always use prepareTransfer first to validate the transfer details
- After prepareTransfer succeeds, the system will handle confirmation and execution
- Never attempt to execute transfers directly

Be concise and helpful.`;

const StateAnnotation = Annotation.Root({
    messages: Annotation({
        reducer: (state, update) => state.concat(Array.isArray(update) ? update : [update]),
        default: () => [],
    }),
    userId: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => '' }),
    intent: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => null }),
    pendingTransfer: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => null }),
    riskLevel: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => null }),
    transactionResult: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => null }),
    cancelled: Annotation({ reducer: (x, y) => (y !== undefined ? y : x), default: () => false }),
});

const allTools = [getBalanceTool, getRecentTransactionsTool, findUserTool, prepareTransferTool];
const model = new ChatGroq({ model: 'llama-3.3-70b-versatile' }).bindTools(allTools);
const toolNode = new ToolNode(allTools);
const checkpointer = new MemorySaver();

async function agentNode(state, config) {
    const response = await model.invoke(
        [{ role: 'system', content: SYSTEM_PROMPT }, ...state.messages],
        config
    );
    return { messages: [response] };
}

function shouldContinue(state) {
    const last = state.messages[state.messages.length - 1];
    return last.tool_calls && last.tool_calls.length > 0 ? 'tools' : 'intentNode';
}

function intentNode(state) {
    if (state.transactionResult !== null) {
        return { intent: 'general', pendingTransfer: null, transactionResult: null };
    }
    const msgList = state.messages;
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
                    return {
                        intent: 'transfer',
                        pendingTransfer: {
                            recipientEmail: parsed.recipientEmail,
                            amount: parsed.amount,
                            reason: parsed.reason,
                        },
                    };
                }
            } catch (_) {
                // non-JSON content, skip
            }
        }
    }

    return { intent: 'general', pendingTransfer: null, transactionResult: null };
}

function intentRouter(state) {
    return state.intent === 'transfer' ? 'risk' : END;
}

async function riskNode(state) {
    const data = await getAccountData({ userId: state.userId });
    const ratio = state.pendingTransfer.amount / data.balance;
    const level = ratio >= 0.5 ? 'high' : 'low';

    const { amount, recipientEmail } = state.pendingTransfer;
    let confirmMsg;
    if (level === 'high') {
        const pct = Math.round(ratio * 100);
        confirmMsg = `Warning: $${amount} is ${pct}% of your balance ($${data.balance.toFixed(2)}). Are you sure?`;
    } else {
        confirmMsg = `Ready to transfer $${amount} to ${recipientEmail}. Please confirm.`;
    }

    const answer = await interrupt({ message: confirmMsg, pendingTransfer: state.pendingTransfer });
    const normalized = (typeof answer === 'string' ? answer : '').trim().toLowerCase();
    const isConfirmed = normalized === 'yes';
    return {
        riskLevel: level,
        intent: isConfirmed ? 'confirm' : null,
        cancelled: !isConfirmed,
        pendingTransfer: isConfirmed ? state.pendingTransfer : null,
    };
}

function confirmationRouter(state) {
    if (state.intent === 'confirm') return 'execute';
    return END;
}

async function executeNode(state) {
    const { recipientEmail, amount, reason } = state.pendingTransfer;
    try {
        const result = await transferMoney({ senderId: state.userId, recipientEmail, amount, reason });
        return {
            transactionResult: { success: true, newBalance: result.newBalance },
            intent: null,
            pendingTransfer: null,
            cancelled: false,
        };
    } catch (err) {
        return {
            transactionResult: { success: false, error: err.message },
            intent: null,
            pendingTransfer: null,
            cancelled: false,
        };
    }
}

const graph = new StateGraph(StateAnnotation)
    .addNode('agent', agentNode)
    .addNode('tools', toolNode)
    .addNode('intentNode', intentNode)
    .addNode('risk', riskNode)
    .addNode('execute', executeNode)
    .addEdge('__start__', 'agent')
    .addConditionalEdges('agent', shouldContinue)
    .addEdge('tools', 'agent')
    .addConditionalEdges('intentNode', intentRouter)
    .addConditionalEdges('risk', confirmationRouter)
    .addEdge('execute', END)
    .compile({ checkpointer });

async function runGraph({ message, userId, threadId }) {
    const config = { configurable: { thread_id: threadId, userId } };

    const currentState = await graph.getState(config);
    const isInterrupted = currentState.next && currentState.next.includes('risk');
    const isResuming = isInterrupted && currentState.values.cancelled;

    const input = isResuming ? new Command({ resume: message }) : { messages: [new HumanMessage(message)], userId };

    const result = await graph.invoke(input, config);

    if (result.__interrupt__ && result.__interrupt__.length > 0) {
        return {
            reply: result.__interrupt__[0].value.message,
            awaitingConfirmation: true,
        };
    }

    if (result.cancelled) {
        return { reply: 'Transfer cancelled.', awaitingConfirmation: false };
    }

    if (result.transactionResult) {
        if (result.transactionResult.success) {
            return {
                reply: `Transfer successful! Your new balance is $${result.transactionResult.newBalance.toFixed(2)}.`,
                awaitingConfirmation: false,
            };
        } else {
            return {
                reply: `Transfer failed: ${result.transactionResult.error}`,
                awaitingConfirmation: false,
            };
        }
    }

    const lastMsg = result.messages[result.messages.length - 1];
    const reply = typeof lastMsg.content === 'string'
        ? lastMsg.content
        : Array.isArray(lastMsg.content)
            ? lastMsg.content.map(c => (typeof c === 'string' ? c : c.text || '')).join('')
            : String(lastMsg.content);

    return { reply, awaitingConfirmation: false };
}

module.exports = { runGraph };
