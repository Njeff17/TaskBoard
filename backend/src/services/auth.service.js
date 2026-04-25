const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Generates a signed JWT for a given user ID.
 * @param {number} userId
 * @returns {string} JWT token
 */
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET || 'dev_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/**
 * Registers a new user and returns an auth token.
 */
const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    const error = new Error('An account with this email already exists');
    error.status = 409;
    throw error;
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user.id);

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  };
};

/**
 * Authenticates a user and returns an auth token.
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  const token = generateToken(user.id);
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  };
};

/**
 * Returns the public profile of a user.
 */
const getProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'name', 'email', 'createdAt'],
  });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  return user;
};

/**
 * Updates the name of a user.
 */
const updateProfile = async (userId, { name }) => {
  const user = await User.findByPk(userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  await user.update({ name });
  return { id: user.id, name: user.name, email: user.email };
};

module.exports = { register, login, getProfile, updateProfile, generateToken };
