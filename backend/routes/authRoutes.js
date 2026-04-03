const express = require('express');
const router = express.Router();
const { authController } = require('../controllers');
const { auth } = require('../middlewares');

/**
 * @route   POST /api/user/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/user/logout
 * @desc    Logout user
 * @access  Private
 */
router.get('/logout', auth, authController.logout);
router.post('/logout', auth, authController.logout);

/**
 * @route   ALL /api/user/validate
 * @desc    Validate token
 * @access  Private
 */
router.all('/validate', auth, authController.validateToken);

/**
 * @route   POST /api/user/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', authController.refreshAccessToken);

/**
 * @route   GET /api/user/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', auth, authController.getProfile);

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', auth, authController.updateProfile);

/**
 * @route   PUT /api/user/change-password
 * @desc    Change password
 * @access  Private
 */
router.put('/change-password', auth, authController.changePassword);

module.exports = router;
