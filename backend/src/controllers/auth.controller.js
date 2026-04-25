const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ message: 'Registration successful', ...result });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json({ message: 'Login successful', ...result });
  } catch (error) {
    next(error);
  }
};

// JWT is stateless — logout is handled client-side by discarding the token.
const logout = (_req, res) => {
  res.json({ message: 'Logged out successfully' });
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, getProfile, updateProfile };
