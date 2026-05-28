// Auth middleware: verifies JWT on protected routes and attaches user to request
const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        next(); // passes control to the route handler 
    } catch {
        res.status(401).json({ message: 'Unauthorized' });
    }
}

module.exports = { authenticate };
