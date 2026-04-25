const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware that verifies the Bearer JWT in the Authorization header.
 * Attaches the authenticated user object to req.user on success.
 * Returns HTTP 401 for missing, invalid, or expired tokens.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');

    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email'],
    });

    if (!user) {
      return res.status(401).json({ error: 'User account not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token. Please log in again.' });
    }
    next(error);
  }
};

module.exports = { authenticate };
