// Accounts router: exposes endpoints for account info and balance retrieval
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { getAccountData } = require('./accounts.service');

router.get('/me', authenticate, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const result = await getAccountData({ userId: req.userId, page, limit });
        res.status(200).json(result);
    } catch (err) {
        if (err.code === 'USER_NOT_FOUND') {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
