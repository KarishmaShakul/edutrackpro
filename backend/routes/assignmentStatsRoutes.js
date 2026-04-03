const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middlewares');
const assignmentStatsService = require('../services/assignmentStatsService');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * @route   GET /api/assignments/stats
 * @desc    Assignment module statistics (computation layer)
 * @access  Private/Admin
 */
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const data = await assignmentStatsService.getAssignmentStats();
    return successResponse(res, 'Assignment stats retrieved', data);
  } catch (error) {
    console.error('Assignment stats error:', error);
    return errorResponse(res, 'Server error', 500);
  }
});

module.exports = router;
