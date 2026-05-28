// Auth router: exposes /register, /verify, /login, and /logout endpoints
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { registerUser, verifyAccount, loginUser } = require('./auth.service');
const { sendVerificationEmail, sendAlreadyRegisteredEmail } = require('../email/email.service');

const setAuthCookie = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 24 * 60 * 60 * 1000
    });
};

router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: 'Name, email, password and phone are required' });
  }
  try {
    const verificationToken = await registerUser({ name, email, password, phone });
    await sendVerificationEmail(email, verificationToken);
    res.status(201).json({ message: `Verification email sent to ${email}` });
  } catch (err) {
    if (err.code === 'DUPLICATE_EMAIL') {
      await sendAlreadyRegisteredEmail(email);
      return res.status(201).json({ message: `Verification email sent to ${email}` });
    }
    if (err.message.includes('Invalid')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  try {
    const result = await loginUser({ email, password });
    setAuthCookie(res, result.userId);
    res.status(200).json({ user: result.user });
  } catch (err) {
    if (err.code === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (err.code === 'NOT_VERIFIED') {
      return res.status(403).json({ message: 'Please verify your email before logging in' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/verify', async (req, res) => {
  const { token } = req.query;
  try {
    const result = await verifyAccount({ token });
    setAuthCookie(res, result.user.id);
    res.status(200).json({ user: result.user });
  } catch (err) {
    if (err.code === 'INVALID_TOKEN') {
      return res.status(400).json({ message: 'Invalid verification token' });
    }
    if (err.code === 'TOKEN_EXPIRED') {
      return res.status(400).json({ message: 'Verification link has expired' });
    }
    if (err.code === 'TOKEN_NOT_FOUND') {
      return res.status(404).json({ message: 'No user found for this token' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
