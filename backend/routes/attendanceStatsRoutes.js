const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middlewares');
const attendanceStatsService = require('../services/attendanceStatsService');
const { successResponse, errorResponse } = require('../utils/helpers');

/**
 * @route   GET /api/attendance/stats
 * @desc    Attendance module statistics (computation layer, aggregation)
 * @access  Private/Admin
 */
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    const data = await attendanceStatsService.getAttendanceStats();
    return successResponse(res, 'Attendance stats retrieved', data);
  } catch (error) {
    console.error('Attendance stats error:', error);
    return errorResponse(res, 'Server error', 500);
  }
});

module.exports = router;
