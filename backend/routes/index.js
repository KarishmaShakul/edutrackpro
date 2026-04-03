// Export all routes
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const teacherRoutes = require('./teacherRoutes');
const studentRoutes = require('./studentRoutes');
const headRoutes = require('./headRoutes');
const indexRoutes = require('./indexRoutes');
const userStatsRoutes = require('./userStatsRoutes');
const classStatsRoutes = require('./classStatsRoutes');
const attendanceStatsRoutes = require('./attendanceStatsRoutes');
const marksStatsRoutes = require('./marksStatsRoutes');
const assignmentStatsRoutes = require('./assignmentStatsRoutes');

module.exports = {
  authRoutes,
  adminRoutes,
  teacherRoutes,
  studentRoutes,
  headRoutes,
  indexRoutes,
  userStatsRoutes,
  classStatsRoutes,
  attendanceStatsRoutes,
  marksStatsRoutes,
  assignmentStatsRoutes
};
