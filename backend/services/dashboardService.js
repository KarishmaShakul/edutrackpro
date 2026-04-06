const { Class, Assignment, Marks } = require('../models');
const userStatsService = require('./userStatsService');

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

const calculateLiveAttendanceAverage = async () => {
  const classes = await Class.find({ isActive: true })
    .select('attendanceRecords students attendanceAverage');
  
  if (!classes.length) return 0;
  
  let totalPresent = 0;
  let totalRecords = 0;
  
  classes.forEach(cls => {
    (cls.attendanceRecords || []).forEach(dayRecord => {
      (dayRecord.records || []).forEach(r => {
        totalRecords++;
        if (r.status === 'present' || r.status === 'late') {
          totalPresent++;
        }
      });
    });
  });
  
  if (totalRecords === 0) {
    const avg = classes.reduce((sum, c) => sum + (c.attendanceAverage || 0), 0) / classes.length;
    return Math.round(avg * 10) / 10;
  }
  
  return Math.round((totalPresent / totalRecords) * 1000) / 10;
};

const getSubjectPerformance = async () => {
  const classes = await Class.find({ isActive: true })
    .select('classname _id students');
  
  const performance = [];
  
  for (const cls of classes) {
    const marks = await Marks.find({ classId: cls._id })
      .select('marks totalMarks studentId');
    
    if (!marks.length) continue;
    
    const avgMarks = marks.reduce((sum, m) => sum + (m.marks / m.totalMarks * 100), 0) / marks.length;
    const passed = marks.filter(m => (m.marks / m.totalMarks * 100) >= 50).length;
    const passPercentage = (passed / marks.length) * 100;
    
    performance.push({
      subjectName: cls.classname,
      averageMarks: Math.round(avgMarks * 10) / 10,
      passPercentage: Math.round(passPercentage * 10) / 10,
      totalStudents: cls.students.length,
      marksCount: marks.length
    });
  }
  
  return performance;
};

const getDashboardData = async () => {
  const userStats = await userStatsService.getUserStats();

  const activeCourses = await Class.countDocuments({ isActive: true });
  const averageAttendance = await calculateLiveAttendanceAverage();
  const performance = await getSubjectPerformance();

  const classesWithoutTeacher = await Class.find({ 
    isActive: true, 
    $or: [{ teacher: null }, { teacher: { $exists: false } }]
  }).select('classname createdAt');

  const assignmentsPastDue = await Assignment.find({
    isPublished: true,
    dueDate: { $lt: new Date() }
  }).select('title dueDate classId');

  const lowAttendanceClasses = await Class.find({
    isActive: true,
    attendanceAverage: { $lt: 75 }
  }).select('classname attendanceAverage');

  const totals = {
    students: userStats.totalStudents,
    faculty: userStats.totalFaculty,
    admins: userStats.totalAdmins,
    activeUsers: userStats.activeUsers,
    activeCourses: activeCourses,
    averageAttendance: averageAttendance
  };

  const userDistribution = {
    students: userStats.totalStudents,
    teachers: userStats.totalFaculty,
    admins: userStats.totalAdmins
  };

  const alerts = {
    classesWithoutTeacher: {
      count: classesWithoutTeacher.length,
      items: classesWithoutTeacher.map(c => ({
        classname: c.classname,
        timeAgo: getRelativeTime(c.createdAt)
      }))
    },
    assignmentsPastDue: {
      count: assignmentsPastDue.length,
      items: assignmentsPastDue.map(a => ({
        title: a.title,
        dueDate: a.dueDate,
        timeAgo: getRelativeTime(a.dueDate)
      }))
    },
    lowAttendance: {
      count: lowAttendanceClasses.length,
      items: lowAttendanceClasses.map(c => ({
        classname: c.classname,
        attendanceAverage: c.attendanceAverage
      }))
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
