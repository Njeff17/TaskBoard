const express = require('express');

const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
} = require('../validators/auth.validator');

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/profile', authenticate, authController.getProfile);
router.patch('/profile', authenticate, validateUpdateProfile, authController.updateProfile);

module.exports = router;
