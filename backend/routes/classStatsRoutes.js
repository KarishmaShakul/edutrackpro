const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middlewares');
const classStatsService = require('../services/classStatsService');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * @route   GET /api/classes/stats
 * @desc    Class module statistics (computation layer)
 * @access  Private/Admin
 */
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const data = await classStatsService.getClassStats();
    return successResponse(res, 'Class stats retrieved', data);
  } catch (error) {
    console.error('Class stats error:', error);
    return errorResponse(res, 'Server error', 500);
  }
});

module.exports = router;
