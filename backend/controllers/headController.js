const mongoose = require('mongoose');
const { User, Class, Quiz, Assignment, Material, Marks } = require('../models');
const { successResponse, errorResponse, calculatePercentage, calculateStandardDeviation } = require('../utils/helpers');

/**
 * @desc    Get head dashboard with statistics
 * @route   GET /api/head/
 * @access  Private/Head
 */
const getDashboard = async (req, res) => {
  try {
    // Get all classes (head can view all)
    const classes = await Class.find({ isActive: true })
      .populate('teacher', 'name email')
      .populate('students', 'name email')
      .lean();

    if (!classes.length) {
      return successResponse(res, 'Dashboard data retrieved', {
        statistics: {
          totalClasses: 0,
          totalStudents: 0,
          totalTeachers: 0,
          totalQuizzes: 0,
          totalAssignments: 0,
          averageProgress: 0
        },
        classes: [],
        progressData: []
      });
    }

    const classIds = classes.map(c => c._id);

    // Get all quizzes and assignments
    const [quizzes, assignments, teachers] = await Promise.all([
      Quiz.find({ classId: { $in: classIds } }).lean(),
      Assignment.find({ classId: { $in: classIds } }).lean(),
      User.countDocuments({ role: 'teacher' })
    ]);

    // Calculate statistics
    const totalClasses = classes.length;
    const totalStudents = classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0);
    const totalQuizzes = quizzes.length;
    const totalAssignments = assignments.length;

    // Calculate progress for each class
    const progressData = classes.map(cls => {
      const classQuizzes = quizzes.filter(q => q.classId.toString() === cls._id.toString());
      const classAssignments = assignments.filter(a => a.classId.toString() === cls._id.toString());

      const totalSubmissions =
        classQuizzes.reduce((sum, q) => sum + (q.submissions?.length || 0), 0) +
        classAssignments.reduce((sum, a) => sum + (a.submissions?.length || 0), 0);

      const totalAssessments = classQuizzes.length + classAssignments.length;
      const expectedSubmissions = totalAssessments * (cls.students?.length || 0);
      const completionRate = expectedSubmissions > 0
        ? calculatePercentage(totalSubmissions, expectedSubmissions)
        : 0;

      return {
        classId: cls._id,
        classname: cls.classname,
        teacher: cls.teacher?.name || 'Not Assigned',
        studentCount: cls.students?.length || 0,
        quizCount: classQuizzes.length,
        assignmentCount: classAssignments.length,
        completionRate
      };
    });

    const averageProgress = progressData.length > 0
      ? parseFloat((progressData.reduce((sum, p) => sum + p.completionRate, 0) / progressData.length).toFixed(2))
      : 0;

    return successResponse(res, 'Dashboard data retrieved', {
      statistics: {
        totalClasses,
        totalStudents,
        totalTeachers: teachers,
        totalQuizzes,
        totalAssignments,
        averageProgress
      },
      classOverview: progressData,
      progressData
    });

  } catch (error) {
    console.error('Head dashboard error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Get class result summary
 * @route   GET /api/head/results/class/:id
 * @access  Private/Head
 */
const getClassResults = async (req, res) => {
  try {
    const classId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return errorResponse(res, 'Invalid class ID', 400);
    }

    const classDoc = await Class.findById(classId)
      .populate('students', 'name email')
      .populate('teacher', 'name email');

    if (!classDoc) {
      return errorResponse(res, 'Class not found', 404);
    }

    const studentIds = classDoc.students.map(s => s._id);

    if (!studentIds.length) {
      return successResponse(res, 'No students in this class', {
        classId: classDoc._id,
        classname: classDoc.classname,
        teacher: classDoc.teacher,
        classStats: null,
        students: []
      });
    }

    // Get all marks for this class
    const marks = await Marks.find({ classId });

    if (!marks.length) {
      return successResponse(res, 'No marks found', {
        classId: classDoc._id,
        classname: classDoc.classname,
        teacher: classDoc.teacher,
        classStats: {
          totalStudents: studentIds.length,
          totalMarkEntries: 0
        },
        students: classDoc.students.map(s => ({
          studentId: s._id,
          name: s.name,
          email: s.email,
          totalMarks: 0,
          averageMarks: 0,
          subjectsCount: 0
        }))
      });
    }

    // Calculate class statistics
    const scores = marks.map(m => m.percentage);
    const classStats = {
      totalStudents: studentIds.length,
      totalMarkEntries: marks.length,
      highestPercentage: Math.max(...scores),
      lowestPercentage: Math.min(...scores),
      averagePercentage: parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)),
      standardDeviation: calculateStandardDeviation(scores)
    };

    // Per-student summary
    const studentSummaries = await Promise.all(
      classDoc.students.map(async student => {
        const studentMarks = marks.filter(m => m.studentId.toString() === student._id.toString());
        const totalObtained = studentMarks.reduce((acc, m) => acc + m.marks, 0);
        const totalPossible = studentMarks.reduce((acc, m) => acc + m.totalMarks, 0);
        const averagePercentage = studentMarks.length
          ? parseFloat((studentMarks.reduce((acc, m) => acc + m.percentage, 0) / studentMarks.length).toFixed(2))
          : 0;

        return {
          studentId: student._id,
          name: student.name,
          email: student.email,
          totalObtained,
          totalPossible,
          averagePercentage,
          assessmentCount: studentMarks.length,
          grade: getGradeFromPercentage(averagePercentage)
        };
      })
    );

    return successResponse(res, 'Class result summary', {
      classId: classDoc._id,
      classname: classDoc.classname,
      teacher: classDoc.teacher,
      classStats,
      students: studentSummaries.sort((a, b) => b.averagePercentage - a.averagePercentage)
    });

  } catch (error) {
    console.error('Get class results error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Get all materials across classes
 * @route   GET /api/head/material
 * @access  Private/Head
 */
const getAllMaterials = async (req, res) => {
  try {
    const materials = await Material.find()
      .populate('classId', 'classname')
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Materials retrieved', {
      count: materials.length,
      materials
    });

  } catch (error) {
    console.error('Get materials error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Get progress graph data
 * @route   GET /api/head/graph
 * @access  Private/Head
 */
const getProgressGraph = async (req, res) => {
  try {
    const { studentId, classId, startDate, endDate } = req.query;

    let marksFilter = {};

    if (studentId) {
      marksFilter.studentId = studentId;
    }

    if (classId) {
      const classDoc = await Class.findById(classId);
      if (!classDoc) {
        return errorResponse(res, 'Class not found', 404);
      }
      marksFilter.classId = classId;
    }

    if (startDate || endDate) {
      marksFilter.createdAt = {};
      if (startDate) marksFilter.createdAt.$gte = new Date(startDate);
      if (endDate) marksFilter.createdAt.$lte = new Date(endDate);
    }

    const marks = await Marks.find(marksFilter)
      .populate('studentId', 'name email')
      .populate('classId', 'classname')
      .sort({ createdAt: 1 });

    if (!marks.length) {
      return errorResponse(res, 'No marks data found', 404);
    }

    // Group by student
    const studentProgressMap = {};

    marks.forEach(mark => {
      const studentKey = mark.studentId._id.toString();

      if (!studentProgressMap[studentKey]) {
        studentProgressMap[studentKey] = {
          studentId: mark.studentId._id,
          studentName: mark.studentId.name,
          studentEmail: mark.studentId.email,
          progressData: [],
          totalMarks: 0,
          averageMarks: 0,
          highestMark: 0,
          lowestMark: 100,
          trend: 'stable'
        };
      }

      studentProgressMap[studentKey].progressData.push({
        marks: mark.marks,
        totalMarks: mark.totalMarks,
        percentage: mark.percentage,
        type: mark.type,
        title: mark.title,
        className: mark.classId?.classname || 'Unknown',
        date: mark.createdAt,
        formattedDate: new Date(mark.createdAt).toLocaleDateString()
      });

      studentProgressMap[studentKey].totalMarks += mark.percentage;

      if (mark.percentage > studentProgressMap[studentKey].highestMark) {
        studentProgressMap[studentKey].highestMark = mark.percentage;
      }
      if (mark.percentage < studentProgressMap[studentKey].lowestMark) {
        studentProgressMap[studentKey].lowestMark = mark.percentage;
      }
    });

    // Calculate trends
    const graphData = Object.values(studentProgressMap).map(student => {
      const dataPoints = student.progressData;
      student.averageMarks = parseFloat((student.totalMarks / dataPoints.length).toFixed(2));

      if (dataPoints.length >= 2) {
        const midPoint = Math.floor(dataPoints.length / 2);
        const firstHalf = dataPoints.slice(0, midPoint);
        const secondHalf = dataPoints.slice(midPoint);

        const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.percentage, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.percentage, 0) / secondHalf.length;

        const trendDifference = secondHalfAvg - firstHalfAvg;

        if (trendDifference > 5) student.trend = 'improving';
        else if (trendDifference < -5) student.trend = 'declining';
        else student.trend = 'stable';

        student.trendPercentage = parseFloat(((trendDifference / firstHalfAvg) * 100).toFixed(2));
      }

      return student;
    });

    // Create chart data
    const allDates = new Set();
    graphData.forEach(student => {
      student.progressData.forEach(data => allDates.add(data.formattedDate));
    });

    const chartLabels = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));

    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

    const chartData = {
      labels: chartLabels,
      datasets: graphData.map((student, index) => ({
        label: student.studentName,
        data: chartLabels.map(date => {
          const entry = student.progressData.find(d => d.formattedDate === date);
          return entry ? entry.percentage : null;
        }),
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '33',
        fill: false,
        tension: 0.1
      }))
    };

    // Overall statistics
    const overallStats = {
      totalStudents: graphData.length,
      classAverage: parseFloat((graphData.reduce((sum, s) => sum + s.averageMarks, 0) / graphData.length).toFixed(2)),
      highestOverall: Math.max(...graphData.map(s => s.highestMark)),
      lowestOverall: Math.min(...graphData.map(s => s.lowestMark)),
      studentsImproving: graphData.filter(s => s.trend === 'improving').length,
      studentsDeclining: graphData.filter(s => s.trend === 'declining').length,
      studentsStable: graphData.filter(s => s.trend === 'stable').length
    };

    return successResponse(res, 'Graph data generated', {
      overallStats,
      chartData,
      studentDetails: graphData,
      graphConfig: {
        type: 'line',
        title: 'Student Progress Over Time',
        xAxisLabel: 'Date',
        yAxisLabel: 'Percentage'
      }
    });

  } catch (error) {
    console.error('Get graph error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Get individual student graph
 * @route   GET /api/head/graph/student/:studentId
 * @access  Private/Head
 */
const getStudentGraph = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId);
    if (!student) {
      return errorResponse(res, 'Student not found', 404);
    }

    const marks = await Marks.find({ studentId })
      .populate('classId', 'classname')
      .sort({ createdAt: 1 });

    if (!marks.length) {
      return errorResponse(res, 'No marks found', 404);
    }

    const progressData = marks.map(mark => ({
      marks: mark.marks,
      totalMarks: mark.totalMarks,
      percentage: mark.percentage,
      type: mark.type,
      title: mark.title,
      className: mark.classId?.classname || 'Unknown',
      date: mark.createdAt,
      formattedDate: new Date(mark.createdAt).toLocaleDateString()
    }));

    const percentages = marks.map(m => m.percentage);
    const stats = {
      totalEntries: marks.length,
      averagePercentage: parseFloat((percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(2)),
      highestPercentage: Math.max(...percentages),
      lowestPercentage: Math.min(...percentages),
      standardDeviation: calculateStandardDeviation(percentages)
    };

    // Calculate trend
    let trend = 'stable';
    let trendPercentage = 0;

    if (progressData.length >= 2) {
      const midPoint = Math.floor(progressData.length / 2);
      const firstHalfAvg = progressData.slice(0, midPoint).reduce((sum, d) => sum + d.percentage, 0) / midPoint;
      const secondHalfAvg = progressData.slice(midPoint).reduce((sum, d) => sum + d.percentage, 0) / (progressData.length - midPoint);

      trendPercentage = parseFloat((((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100).toFixed(2));

      if (trendPercentage > 5) trend = 'improving';
      else if (trendPercentage < -5) trend = 'declining';
    }

    const chartData = {
      labels: progressData.map(d => d.formattedDate),
      datasets: [
        {
          label: `${student.name}'s Progress`,
          data: progressData.map(d => d.percentage),
          borderColor: '#36A2EB',
          backgroundColor: '#36A2EB33',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Average Line',
          data: progressData.map(() => stats.averagePercentage),
          borderColor: '#FF6384',
          borderDash: [5, 5],
          fill: false
        }
      ]
    };

    return successResponse(res, 'Student graph generated', {
      student: {
        id: student._id,
        name: student.name,
        email: student.email
      },
      stats,
      trend,
      trendPercentage,
      progressData,
      chartData
    });

  } catch (error) {
    console.error('Get student graph error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Get all classes overview
 * @route   GET /api/head/classes
 * @access  Private/Head
 */
const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('teacher', 'name email')
      .populate('students', 'name email')
      .sort({ createdAt: -1 });

    // Calculate quiz count and avg score for each class
    const classesWithStats = await Promise.all(
      classes.map(async (cls) => {
        const quizCount = await Quiz.countDocuments({ classId: cls._id });
        const marks = await Marks.find({ classId: cls._id });
        const avgScore = marks.length > 0
          ? parseFloat((marks.reduce((sum, m) => sum + m.percentage, 0) / marks.length).toFixed(2))
          : 0;

        return {
          ...cls.toObject(),
          quizCount,
          avgScore
        };
      })
    );

    return successResponse(res, 'Classes retrieved', { classes: classesWithStats });

  } catch (error) {
    console.error('Get classes error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Get all results across all classes
 * @route   GET /api/head/results
 * @access  Private/Head
 */
const getAllResults = async (req, res) => {
  try {
    const marks = await Marks.find()
      .populate('studentId', 'name email')
      .populate('classId', 'classname')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate overall stats
    const percentages = marks.map(m => m.percentage);
    const stats = {
      avgScore: percentages.length > 0
        ? parseFloat((percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(2))
        : 0,
      highestScore: percentages.length > 0 ? Math.max(...percentages) : 0,
      lowestScore: percentages.length > 0 ? Math.min(...percentages) : 0,
      passRate: percentages.length > 0
        ? parseFloat(((percentages.filter(p => p >= 50).length / percentages.length) * 100).toFixed(2))
        : 0,
      gradeA: percentages.filter(p => p >= 90).length,
      gradeB: percentages.filter(p => p >= 80 && p < 90).length,
      gradeC: percentages.filter(p => p >= 70 && p < 80).length,
      gradeD: percentages.filter(p => p >= 60 && p < 70).length,
      gradeF: percentages.filter(p => p < 60).length
    };

    // Format results with proper structure
    const results = marks.map(m => ({
      ...m,
      student: m.studentId,
      grade: getGradeFromPercentage(m.percentage)
    }));

    return successResponse(res, 'Results retrieved', { results, stats });

  } catch (error) {
    console.error('Get all results error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Get all teachers
 * @route   GET /api/head/teachers
 * @access  Private/Head
 */
const getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .select('-password')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Teachers retrieved', { teachers });

  } catch (error) {
    console.error('Get teachers error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Get all students
 * @route   GET /api/head/students
 * @access  Private/Head
 */
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Students retrieved', { students });

  } catch (error) {
    console.error('Get students error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

// Helper function
function getGradeFromPercentage(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 85) return 'A';
  if (percentage >= 80) return 'A-';
  if (percentage >= 75) return 'B+';
  if (percentage >= 70) return 'B';
  if (percentage >= 65) return 'B-';
  if (percentage >= 60) return 'C+';
  if (percentage >= 55) return 'C';
  if (percentage >= 50) return 'C-';
  if (percentage >= 45) return 'D';
  return 'F';
}

module.exports = {
  getDashboard,
  getClassResults,
  getAllMaterials,
  getProgressGraph,
  getStudentGraph,
  getAllClasses,
  getAllResults,
  getAllTeachers,
  getAllStudents
};
