const { Class } = require('../models');
const { getCurrentAcademicTerm } = require('../utils/academicTerm');

const LOW_ATTENDANCE_THRESHOLD = 75;

/**
 * Attendance module – computation layer (aggregation on Class.attendanceAverage).
 * GET /api/attendance/stats uses this.
 */
const getAttendanceStats = async () => {
  const { academicYear, semesterType, semesterNumber } = getCurrentAcademicTerm();

  const match = {
    academicYear,
    semesterType,
    semesterNumber,
    isActive: true,
    attendanceAverage: { $ne: null, $gte: 0, $lte: 100 }
  };

  const [avgResult, lowCount, lowItems] = await Promise.all([
    Class.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          averageAttendance: { $avg: '$attendanceAverage' }
        }
      },
      {
        $project: {
          _id: 0,
          averageAttendance: { $round: ['$averageAttendance', 1] }
        }
      }
    ]),
    Class.countDocuments({
      ...match,
      attendanceAverage: { $lt: LOW_ATTENDANCE_THRESHOLD }
    }),
    Class.find({
      ...match,
      attendanceAverage: { $lt: LOW_ATTENDANCE_THRESHOLD }
    })
      .sort({ attendanceAverage: 1 })
      .limit(10)
      .select('classname attendanceAverage')
      .lean()
  ]);

  const averageAttendance = avgResult[0]?.averageAttendance ?? null;

  return {
    averageAttendance,
    lowAttendanceCount: lowCount,
    lowAttendanceItems: lowItems.map((c) => ({
      classname: c.classname,
      attendanceAverage: c.attendanceAverage
    }))
  };
};

module.exports = { getAttendanceStats };
