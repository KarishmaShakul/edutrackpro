const userStatsService = require('./userStatsService');
const classStatsService = require('./classStatsService');
const attendanceStatsService = require('./attendanceStatsService');
const marksStatsService = require('./marksStatsService');
const assignmentStatsService = require('./assignmentStatsService');

const getRelativeTime = (date) => {
  const d = date ? new Date(date) : null;
  if (!d || Number.isNaN(d.getTime())) return null;
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hours ago`;
  if (diffDay < 7) return `${diffDay} days ago`;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

/**
 * Dashboard = Aggregation layer only.
 * Calls module stats services and combines; no direct DB computation here.
 */
const getDashboardData = async () => {
  const [userStats, classStats, attendanceStats, marksStats, assignmentStats] = await Promise.all([
    userStatsService.getUserStats(),
    classStatsService.getClassStats(),
    attendanceStatsService.getAttendanceStats(),
    marksStatsService.getMarksStats(),
    assignmentStatsService.getAssignmentStats()
  ]);

  const totals = {
    students: userStats.totalStudents,
    faculty: userStats.totalFaculty,
    admins: userStats.totalAdmins,
    activeUsers: userStats.activeUsers,
    totalClasses: classStats.totalClasses,
    activeCourses: classStats.activeCourses,
    averageAttendance: attendanceStats.averageAttendance,
    pendingAssignments: assignmentStats.pendingAssignments,
    overallPassRate: marksStats.overallPassRate
  };

  const userDistribution = {
    students: userStats.totalStudents,
    teachers: userStats.totalFaculty,
    admins: userStats.totalAdmins
  };

  const performance = marksStats.subjectPerformance || [];

  const alerts = {
    classesWithoutTeacher: {
      count: classStats.classesWithoutTeacher?.length ?? 0,
      items: (classStats.classesWithoutTeacher || []).map((c) => ({
        classname: c.classname,
        timeAgo: getRelativeTime(c.createdAt)
      }))
    },
    assignmentsPastDue: {
      count: assignmentStats.overdueAssignments?.length ?? 0,
      items: (assignmentStats.overdueAssignments || []).map((a) => ({
        title: a.title,
        dueDate: a.dueDate,
        timeAgo: getRelativeTime(a.dueDate)
      }))
    },
    lowAttendance: {
      count: attendanceStats.lowAttendanceCount ?? 0,
      items: attendanceStats.lowAttendanceItems || []
    }
  };

  return {
    totals,
    userDistribution,
    performance,
    alerts
  };
};

module.exports = { getDashboardData };
