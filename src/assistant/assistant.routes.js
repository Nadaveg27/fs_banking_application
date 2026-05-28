'use strict';

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { processMessage } = require('./assistant.service');

router.post('/chat', authenticate, async (req, res) => {
    const { message, threadId } = req.body;
    if (!message || !threadId) {
        return res.status(400).json({ message: 'message and threadId are required' });
    }
    try {
        const result = await processMessage({ message, userId: req.userId, threadId });
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: 'Assistant error' });
    }
});

module.exports = router;
