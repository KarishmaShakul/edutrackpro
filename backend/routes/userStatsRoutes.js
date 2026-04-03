const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middlewares');
const userStatsService = require('../services/userStatsService');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * @route   GET /api/users/stats
 * @desc    User module statistics (computation layer)
 * @access  Private/Admin
 */
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const data = await userStatsService.getUserStats();
    return successResponse(res, 'User stats retrieved', data);
  } catch (error) {
    console.error('User stats error:', error);
    return errorResponse(res, 'Server error', 500);
  }
});

module.exports = router;
