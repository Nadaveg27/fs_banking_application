// Auth service: handles user registration, login, and JWT issuance
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

async function registerUser({ name, email, password, phone }) {
    email = email.toLowerCase();
    if (!name || !name.trim()) {
        throw new Error('Invalid name');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Invalid email format');
    }
    if (!/^\d{7,15}$/.test(phone)) {
        throw new Error('Invalid phone format: must be 7–15 digits');
    }

    const existing = await User.findOne({ email });
    if (existing) {
        const err = new Error('An account with this email already exists');
        err.code = 'DUPLICATE_EMAIL';
        throw err;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const balance = Math.round((Math.random() * 9000 + 1000) * 100) / 100;
    const verificationToken = jwt.sign(
        { email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    await User.create({
        name,
        email,
        passwordHash,
        phone,
        balance,
        verificationToken,
        isVerified: false,
    });

    return verificationToken;
}

async function verifyAccount({ token }) {
    if (!token || typeof token !== 'string') {
        const err = new Error('Invalid verification token');
        err.code = 'INVALID_TOKEN';
        throw err;
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        const err = new Error(
            e.name === 'TokenExpiredError'
                ? 'Verification link has expired'
                : 'Invalid verification token'
        );
        err.code = e.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN';
        throw err;
    }

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
        const err = new Error('No user found for this token');
        err.code = 'TOKEN_NOT_FOUND';
        throw err;
    }

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    return { user: { id: user.id, name: user.name, email: user.email, balance: user.balance } };
}

async function loginUser({ email, password }) {
    email = email.toLowerCase();
    const user = await User.findOne({ email });
    if (!user) {
        const err = new Error('Invalid email or password');
        err.code = 'INVALID_CREDENTIALS';
        throw err;
    }

    if (!user.isVerified) {
        const err = new Error('Please verify your email before logging in');
        err.code = 'NOT_VERIFIED';
        throw err;
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
        const err = new Error('Invalid email or password');
        err.code = 'INVALID_CREDENTIALS';
        throw err;
    }

    return { user: { id: user.id, name: user.name, email: user.email, balance: user.balance }, userId: user.id };
}

module.exports = { registerUser, verifyAccount, loginUser };