const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middlewares');
const marksStatsService = require('../services/marksStatsService');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * @route   GET /api/marks/stats
 * @desc    Marks module statistics (computation layer, aggregation)
 * @access  Private/Admin
 */
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const data = await marksStatsService.getMarksStats();
    return successResponse(res, 'Marks stats retrieved', data);
  } catch (error) {
    console.error('Marks stats error:', error);
    return errorResponse(res, 'Server error', 500);
  }
});

module.exports = router;
