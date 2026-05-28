// Defines the Transaction schema and model for MongoDB persistence
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    perspectiveUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    counterpartyEmail: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    reason: {
        type: String,
        default: null,
        maxlength: 200,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Transaction', transactionSchema);