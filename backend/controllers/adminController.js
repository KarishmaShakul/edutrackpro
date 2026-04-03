const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Class, Quiz, Assignment, Material, Marks } = require('../models');
const { successResponse, errorResponse, getPagination, getPaginationMeta } = require('../utils/helpers');
const dashboardService = require('../services/dashboardService');

const formatAcademicYear = (value) => {
  if (!value) return null;
  return String(value).trim();
};

const parseSemesterNumber = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(1, Math.min(8, Math.trunc(n)));
};

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
 * @desc    Get admin dashboard (aggregation layer – calls module stats, no direct DB)
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
const getDashboard = async (req, res) => {
  try {
    const data = await dashboardService.getDashboardData();
    return successResponse(res, 'Dashboard data retrieved', data);
  } catch (error) {
    console.error('Dashboard error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Get advanced admin dashboard (academic term aware)
 * @route   GET /api/admin/dashboard-advanced
 * @access  Private/Admin
 */
const getAdvancedDashboard = async (req, res) => {
  try {
    const academicYear = formatAcademicYear(req.query.academicYear) || '2025\u20132026';
    const semesterType = req.query.semesterType === 'Even' ? 'Even' : 'Odd';
    const semesterNumber = parseSemesterNumber(req.query.semesterNumber) || (semesterType === 'Odd' ? 5 : 6);

    const departmentName = 'Department of Computer Science & Engineering';

    const classFilter = {
      academicYear,
      semesterType,
      semesterNumber,
      isActive: true
    };

    const classes = await Class.find(classFilter)
      .select('_id classname teacher students attendanceAverage createdAt')
      .populate('teacher', 'name email')
      .sort({ createdAt: -1 });

    const classIds = classes.map(c => c._id);

    const prevSemesterNumber = Math.max(1, semesterNumber - 1);
    const prevSemesterType = prevSemesterNumber % 2 === 0 ? 'Even' : 'Odd';
    const prevClassFilter = {
      academicYear,
      semesterType: prevSemesterType,
      semesterNumber: prevSemesterNumber,
      isActive: true
    };

    const [
      totalStudents,
      totalTeachers,
      totalHeads,
      totalAdmins,
      prevClassesCount,
      prevSubjectsDistinct,
      currentAssignments,
      prevAssignmentsCount,
      prevPendingAssignmentsCount,
      prevQuizSubmissionsAgg,
      currentQuizSubmissionsAgg,
      recentStudents,
      recentClasses,
      recentAssignmentSubmissions,
      alertsPastDueAssignments,
      alertsClassesWithoutTeacher,
      lowAttendanceClasses,
      performanceByClassAgg
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'head' }),
      User.countDocuments({ role: 'admin' }),
      Class.countDocuments(prevClassFilter),

      // Distinct subjects in previous term (for comparison)
      (async () => {
        const prevClasses = await Class.find(prevClassFilter).select('classname');
        return Array.from(new Set(prevClasses.map(c => c.classname))).length;
      })(),

      // Assignments for current term
      Assignment.find({ classId: { $in: classIds }, isPublished: true })
        .select('_id title dueDate classId submissions createdAt')
        .sort({ createdAt: -1 }),

      // Assignments count for previous term (for comparison)
      (async () => {
        const prevClasses = await Class.find(prevClassFilter).select('_id');
        return Assignment.countDocuments({ classId: { $in: prevClasses.map(c => c._id) }, isPublished: true });
      })(),

      // Pending assignments (previous term) for comparison
      (async () => {
        const prevClasses = await Class.find(prevClassFilter).select('_id');
        return Assignment.countDocuments({
          classId: { $in: prevClasses.map(c => c._id) },
          isPublished: true,
          dueDate: { $gte: new Date() }
        });
      })(),

      // Previous term quiz submissions (aggregation)
      (async () => {
        const prevClasses = await Class.find(prevClassFilter).select('_id');
        const prevClassIds = prevClasses.map(c => c._id);
        if (prevClassIds.length === 0) return [{ total: 0 }];
        return Quiz.aggregate([
          { $match: { classId: { $in: prevClassIds }, isPublished: true } },
          { $project: { subCount: { $size: { $ifNull: ['$submissions', []] } } } },
          { $group: { _id: null, total: { $sum: '$subCount' } } }
        ]);
      })(),

      // Current term quiz submissions (aggregation)
      classIds.length === 0
        ? [{ total: 0 }]
        : Quiz.aggregate([
            { $match: { classId: { $in: classIds }, isPublished: true } },
            { $project: { subCount: { $size: { $ifNull: ['$submissions', []] } } } },
            { $group: { _id: null, total: { $sum: '$subCount' } } }
          ]),

      // Recent registered students
      User.find({ role: 'student' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email createdAt'),

      // Recent created classes (current term)
      Class.find(classFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('teacher', 'name')
        .select('classname teacher createdAt students attendanceAverage'),

      // Recent assignment submissions (last 5 across current term)
      classIds.length === 0
        ? []
        : Assignment.aggregate([
            { $match: { classId: { $in: classIds }, isPublished: true } },
            { $unwind: '$submissions' },
            { $sort: { 'submissions.submittedAt': -1 } },
            { $limit: 5 },
            {
              $project: {
                assignmentId: '$_id',
                assignmentTitle: '$title',
                classId: '$classId',
                studentId: '$submissions.studentId',
                submittedAt: '$submissions.submittedAt',
                status: '$submissions.status',
                isLate: '$submissions.isLate'
              }
            },
            {
              $lookup: {
                from: 'users',
                localField: 'studentId',
                foreignField: '_id',
                as: 'student'
              }
            },
            { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: 'classes',
                localField: 'classId',
                foreignField: '_id',
                as: 'classInfo'
              }
            },
            { $unwind: { path: '$classInfo', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                assignmentId: 1,
                assignmentTitle: 1,
                classId: 1,
                submittedAt: 1,
                status: 1,
                isLate: 1,
                student: {
                  id: '$student._id',
                  name: '$student.name',
                  email: '$student.email'
                },
                class: {
                  id: '$classInfo._id',
                  classname: '$classInfo.classname'
                }
              }
            }
          ]),

      // Past due assignments (alerts)
      classIds.length === 0
        ? []
        : Assignment.find({ classId: { $in: classIds }, isPublished: true, dueDate: { $lt: new Date() } })
            .sort({ dueDate: 1 })
            .limit(10)
            .select('title dueDate classId'),

      // Classes without teacher (alerts)
      Class.find({ ...classFilter, teacher: null })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('classname createdAt'),

      // Low attendance (alerts)
      Class.find({ ...classFilter, attendanceAverage: { $lt: 75 } })
        .sort({ attendanceAverage: 1 })
        .limit(10)
        .select('classname attendanceAverage'),

      // Performance per class (avg marks & pass %) using Marks
      classIds.length === 0
        ? []
        : Marks.aggregate([
            { $match: { classId: { $in: classIds } } },
            {
              $group: {
                _id: '$classId',
                avgPercentage: { $avg: '$percentage' },
                totalEntries: { $sum: 1 },
                passCount: {
                  $sum: {
                    $cond: [{ $gte: ['$percentage', 50] }, 1, 0]
                  }
                }
              }
            },
            {
              $lookup: {
                from: 'classes',
                localField: '_id',
                foreignField: '_id',
                as: 'classInfo'
              }
            },
            { $unwind: '$classInfo' },
            {
              $project: {
                classId: '$_id',
                classname: '$classInfo.classname',
                avgPercentage: { $round: ['$avgPercentage', 1] },
                passPercentage: {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ['$passCount', { $cond: [{ $eq: ['$totalEntries', 0] }, 1, '$totalEntries'] }] },
                        100
                      ]
                    },
                    1
                  ]
                }
              }
            },
            { $sort: { avgPercentage: -1 } }
          ])
    ]);

    const currentQuizSubmissions = (currentQuizSubmissionsAgg[0]?.total) || 0;
    const prevQuizSubmissions = (prevQuizSubmissionsAgg[0]?.total) || 0;

    const totalActiveCourses = classes.length;
    const totalActiveSubjects = new Set(classes.map(c => c.classname)).size;

    const pendingAssignments = currentAssignments.filter(a => a.dueDate >= new Date()).length;
    const submissionCountThisSemester = currentAssignments.reduce((sum, a) => sum + (a.submissions?.length || 0), 0);

    const attendanceValues = classes
      .map(c => c.attendanceAverage)
      .filter(v => typeof v === 'number' && Number.isFinite(v));
    const avgAttendance = attendanceValues.length
      ? Number((attendanceValues.reduce((a, b) => a + b, 0) / attendanceValues.length).toFixed(1))
      : null;

    const comparedToLastSemester = {
      label: `Compared to last semester (Sem ${prevSemesterNumber}, ${prevSemesterType})`,
      activeCoursesDelta: totalActiveCourses - prevClassesCount,
      activeSubjectsDelta: totalActiveSubjects - prevSubjectsDistinct,
      assignmentsDelta: currentAssignments.length - prevAssignmentsCount,
      pendingAssignmentsDelta: pendingAssignments - prevPendingAssignmentsCount,
      quizSubmissionsDelta: currentQuizSubmissions - prevQuizSubmissions
    };

    const recentActivity = {
      students: recentStudents.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
        timeAgo: getRelativeTime(u.createdAt)
      })),
      classes: recentClasses.map(c => ({
        id: c._id,
        classname: c.classname,
        teacher: c.teacher ? c.teacher.name : null,
        students: c.students?.length || 0,
        attendanceAverage: c.attendanceAverage ?? null,
        createdAt: c.createdAt,
        timeAgo: getRelativeTime(c.createdAt)
      })),
      assignmentSubmissions: recentAssignmentSubmissions.map(s => ({
        ...s,
        timeAgo: getRelativeTime(s.submittedAt)
      }))
    };

    const alerts = {
      classesWithoutAssignedTeacher: {
        count: alertsClassesWithoutTeacher.length,
        items: alertsClassesWithoutTeacher.map(c => ({ classname: c.classname, timeAgo: getRelativeTime(c.createdAt) }))
      },
      assignmentsPastDue: {
        count: alertsPastDueAssignments.length,
        items: alertsPastDueAssignments.map(a => ({ title: a.title, dueDate: a.dueDate, timeAgo: getRelativeTime(a.dueDate) }))
      },
      lowAttendance: {
        count: lowAttendanceClasses.length,
        items: lowAttendanceClasses.map(c => ({ classname: c.classname, attendanceAverage: c.attendanceAverage }))
      }
    };

    return successResponse(res, 'Advanced dashboard data retrieved', {
      academicYear,
      semesterType,
      semesterNumber,
      header: `Academic Year: ${academicYear} | ${semesterType} Semester`,
      departmentName,
      totals: {
        users: {
          students: totalStudents,
          teachers: totalTeachers,
          heads: totalHeads,
          admins: totalAdmins
        },
        totalActiveCoursesThisSemester: totalActiveCourses,
        totalActiveSubjects: totalActiveSubjects,
        totalAssignmentsThisSemester: currentAssignments.length,
        totalPendingAssignments: pendingAssignments,
        averageStudentAttendancePercentage: avgAttendance,
        totalQuizSubmissionsThisSemester: currentQuizSubmissions,
        totalAssignmentSubmissionsThisSemester: submissionCountThisSemester
      },
      comparison: comparedToLastSemester,
      performance: {
        byClass: performanceByClassAgg
      },
      recentActivity,
      alerts
    });
  } catch (error) {
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Add new teacher
 * @route   POST /api/admin/addteacher
 * @access  Private/Admin
 */
const addTeacher = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Name, email, and password are required', 400);
    }

    // Check if email exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 'Email already exists', 400);
    }

    // Create teacher
    const teacher = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'teacher',
      phone: phone || null,
      address: address || null
    });

    return successResponse(res, 'Teacher added successfully', { 
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role
      }
    }, 201);

  } catch (error) {
    console.error('Add teacher error:', error);
    return errorResponse(res, error.message || 'Server error', 500);
  }
};

/**
 * @desc    Update teacher
 * @route   PUT /api/admin/teachers/:id
 * @access  Private/Admin
 */
const updateTeacher = async (req, res) => {
  try {
    const teacherId = req.params.id;
    const { name, email, password } = req.body;

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return errorResponse(res, 'Invalid teacher ID', 400);
    }

    const teacher = await User.findOne({ _id: teacherId, role: 'teacher' });
    if (!teacher) {
      return errorResponse(res, 'Teacher not found', 404);
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) {
      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: teacherId } });
      if (existingUser) {
        return errorResponse(res, 'Email already exists', 400);
      }
      updateData.email = email.toLowerCase();
    }
    if (password && password.trim()) {
      const salt = await bcrypt.genSalt(12);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedTeacher = await User.findByIdAndUpdate(
      teacherId,
      updateData,
      { new: true, runValidators: true }
    )
      .select('-password')
      .populate('assignedClasses', 'classname');

    return successResponse(res, 'Teacher updated successfully', { teacher: updatedTeacher });
  } catch (error) {
    console.error('Update teacher error:', error);
    return errorResponse(res, error.message || 'Server error', 500);
  }
};

/**
 * @desc    Add new student
 * @route   POST /api/admin/addstudent
 * @access  Private/Admin
 */
const addStudent = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Name, email, and password are required', 400);
    }

    // Check if email exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 'Email already exists', 400);
    }

    // Create student
    const student = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'student',
      phone: phone || null,
      address: address || null
    });

    return successResponse(res, 'Student added successfully', { 
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: student.role
      }
    }, 201);

  } catch (error) {
    console.error('Add student error:', error);
    return errorResponse(res, error.message || 'Server error', 500);
  }
};

/**
 * @desc    Update student
 * @route   PUT /api/admin/students/:id
 * @access  Private/Admin
 */
const updateStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const { name, email, password } = req.body;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return errorResponse(res, 'Invalid student ID', 400);
    }

    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) {
      return errorResponse(res, 'Student not found', 404);
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) {
      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: studentId } });
      if (existingUser) {
        return errorResponse(res, 'Email already exists', 400);
      }
      updateData.email = email.toLowerCase();
    }
    if (password && password.trim()) {
      const salt = await bcrypt.genSalt(12);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedStudent = await User.findByIdAndUpdate(
      studentId,
      updateData,
      { new: true, runValidators: true }
    )
      .select('-password')
      .populate('assignedClasses', 'classname');

    return successResponse(res, 'Student updated successfully', { student: updatedStudent });
  } catch (error) {
    console.error('Update student error:', error);
    return errorResponse(res, error.message || 'Server error', 500);
  }
};

/**
 * @desc    Add new class
 * @route   POST /api/admin/addclass
 * @access  Private/Admin
 */
const addClass = async (req, res) => {
  try {
    const {
      classname,
      description,
      maxStudents,
      semester, // legacy
      academicYear,
      semesterType,
      semesterNumber
    } = req.body;

    if (!classname) {
      return errorResponse(res, 'Class name is required', 400);
    }

    const newClass = await Class.create({
      classname,
      description: description || '',
      maxStudents: maxStudents || 50,
      semester: semester || null,
      academicYear: academicYear || undefined,
      semesterType: semesterType || null,
      semesterNumber: semesterNumber ?? null
    });

    return successResponse(res, 'Class created successfully', { class: newClass }, 201);

  } catch (error) {
    console.error('Add class error:', error);
    return errorResponse(res, error.message || 'Server error', 500);
  }
};

/**
 * @desc    Delete teacher
 * @route   DELETE /api/admin/teacher/:id
 * @access  Private/Admin
 */
const deleteTeacher = async (req, res) => {
  try {
    const teacherId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return errorResponse(res, 'Invalid teacher ID', 400);
    }

    const teacher = await User.findOne({ _id: teacherId, role: 'teacher' });

    if (!teacher) {
      return errorResponse(res, 'Teacher not found', 404);
    }

    // Remove teacher from all classes
    await Class.updateMany(
      { teacher: teacherId },
      { $unset: { teacher: '' } }
    );

    // Delete teacher
    await User.findByIdAndDelete(teacherId);

    return successResponse(res, 'Teacher deleted successfully');

  } catch (error) {
    console.error('Delete teacher error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Delete student
 * @route   DELETE /api/admin/student/:id
 * @access  Private/Admin
 */
const deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return errorResponse(res, 'Invalid student ID', 400);
    }

    const student = await User.findOne({ _id: studentId, role: 'student' });

    if (!student) {
      return errorResponse(res, 'Student not found', 404);
    }

    // Remove student from all classes
    await Class.updateMany(
      { students: studentId },
      { $pull: { students: studentId } }
    );

    // Delete student
    await User.findByIdAndDelete(studentId);

    return successResponse(res, 'Student deleted successfully');

  } catch (error) {
    console.error('Delete student error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Delete class
 * @route   DELETE /api/admin/class/:id
 * @access  Private/Admin
 */
const deleteClass = async (req, res) => {
  try {
    const classId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return errorResponse(res, 'Invalid class ID', 400);
    }

    const classDoc = await Class.findById(classId);

    if (!classDoc) {
      return errorResponse(res, 'Class not found', 404);
    }

    // Remove class reference from teacher
    if (classDoc.teacher) {
      await User.updateOne(
        { _id: classDoc.teacher },
        { $pull: { assignedClasses: classId } }
      );
    }

    // Remove class reference from students
    if (classDoc.students && classDoc.students.length > 0) {
      await User.updateMany(
        { _id: { $in: classDoc.students } },
        { $pull: { assignedClasses: classId } }
      );
    }

    // Delete related content
    await Promise.all([
      Quiz.deleteMany({ classId }),
      Assignment.deleteMany({ classId }),
      Material.deleteMany({ classId }),
      Marks.deleteMany({ classId })
    ]);

    // Delete class
    await Class.findByIdAndDelete(classId);

    return successResponse(res, 'Class deleted successfully');

  } catch (error) {
    console.error('Delete class error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Update class
 * @route   PUT /api/admin/class/:id
 * @access  Private/Admin
 */
const updateClass = async (req, res) => {
  try {
    const classId = req.params.id;
    const {
      classname,
      description,
      teacher,
      students,
      maxStudents,
      semester, // legacy
      academicYear,
      semesterType,
      semesterNumber,
      isActive
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return errorResponse(res, 'Invalid class ID', 400);
    }

    const existingClass = await Class.findById(classId);

    if (!existingClass) {
      return errorResponse(res, 'Class not found', 404);
    }

    // Build update object
    const updateData = {};
    if (classname !== undefined) updateData.classname = classname;
    if (description !== undefined) updateData.description = description;
    if (teacher !== undefined) updateData.teacher = teacher;
    if (students !== undefined) updateData.students = students;
    if (maxStudents !== undefined) updateData.maxStudents = maxStudents;
    if (semester !== undefined) updateData.semester = semester;
    if (academicYear !== undefined) updateData.academicYear = academicYear;
    if (semesterType !== undefined) updateData.semesterType = semesterType;
    if (semesterNumber !== undefined) updateData.semesterNumber = semesterNumber;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('teacher', 'name email')
    .populate('students', 'name email');

    return successResponse(res, 'Class updated successfully', { class: updatedClass });

  } catch (error) {
    console.error('Update class error:', error);
    return errorResponse(res, error.message || 'Server error', 500);
  }
};

/**
 * @desc    Assign teacher to class
 * @route   PUT /api/admin/assignteacher/:id
 * @access  Private/Admin
 */
const assignTeacher = async (req, res) => {
  try {
    const classId = req.params.id;
    const { teacherId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(classId) || !mongoose.Types.ObjectId.isValid(teacherId)) {
      return errorResponse(res, 'Invalid class or teacher ID', 400);
    }

    const [classDoc, teacher] = await Promise.all([
      Class.findById(classId),
      User.findOne({ _id: teacherId, role: 'teacher' })
    ]);

    if (!classDoc) {
      return errorResponse(res, 'Class not found', 404);
    }

    if (!teacher) {
      return errorResponse(res, 'Teacher not found', 404);
    }

    // Remove class from previous teacher if exists
    if (classDoc.teacher) {
      await User.updateOne(
        { _id: classDoc.teacher },
        { $pull: { assignedClasses: classId } }
      );
    }

    // Assign new teacher
    classDoc.teacher = teacherId;
    await classDoc.save();

    // Add class to teacher's assigned classes
    await User.updateOne(
      { _id: teacherId },
      { $addToSet: { assignedClasses: classId } }
    );

    const updatedClass = await Class.findById(classId)
      .populate('teacher', 'name email')
      .populate('students', 'name email');

    return successResponse(res, 'Teacher assigned successfully', { class: updatedClass });

  } catch (error) {
    console.error('Assign teacher error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Assign students to class
 * @route   PUT /api/admin/assignstudent/:id
 * @access  Private/Admin
 */
const assignStudents = async (req, res) => {
  try {
    const classId = req.params.id;
    let { studentId, studentIds } = req.body;

    // Normalize to array
    let studentsToAssign = [];
    if (Array.isArray(studentIds) && studentIds.length > 0) {
      studentsToAssign = studentIds;
    } else if (studentId) {
      studentsToAssign = [studentId];
    } else {
      return errorResponse(res, 'Provide studentId or studentIds', 400);
    }

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return errorResponse(res, 'Invalid class ID', 400);
    }

    // Validate student IDs
    const invalidId = studentsToAssign.some(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidId) {
      return errorResponse(res, 'One or more invalid student IDs', 400);
    }

    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return errorResponse(res, 'Class not found', 404);
    }

    // Find valid students
    const validStudents = await User.find({
      _id: { $in: studentsToAssign },
      role: 'student'
    }).select('_id');

    if (!validStudents.length) {
      return errorResponse(res, 'No valid students found', 404);
    }

    const validIds = validStudents.map(s => s._id);

    // Add students to class
    await Class.updateOne(
      { _id: classId },
      { $addToSet: { students: { $each: validIds } } }
    );

    // Add class to students' assigned classes
    await User.updateMany(
      { _id: { $in: validIds } },
      { $addToSet: { assignedClasses: classId } }
    );

    const updatedClass = await Class.findById(classId)
      .populate('students', 'name email')
      .populate('teacher', 'name email');

    return successResponse(res, 'Students assigned successfully', {
      class: updatedClass,
      studentsAssigned: validIds.length
    });

  } catch (error) {
    console.error('Assign students error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Remove student from class
 * @route   DELETE /api/admin/class/:classId/student/:studentId
 * @access  Private/Admin
 */
const removeStudentFromClass = async (req, res) => {
  try {
    const { classId, studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(classId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      return errorResponse(res, 'Invalid IDs', 400);
    }

    // Remove student from class
    await Class.updateOne(
      { _id: classId },
      { $pull: { students: studentId } }
    );

    // Remove class from student's assigned classes
    await User.updateOne(
      { _id: studentId },
      { $pull: { assignedClasses: classId } }
    );

    return successResponse(res, 'Student removed from class');

  } catch (error) {
    console.error('Remove student error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Get all teachers
 * @route   GET /api/admin/teachers
 * @access  Private/Admin
 */
const getAllTeachers = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page || 1, req.query.limit || 500);

    const [teachers, total] = await Promise.all([
      User.find({ role: 'teacher' })
        .populate('assignedClasses', 'classname')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments({ role: 'teacher' })
    ]);

    return successResponse(res, 'Teachers retrieved', {
      teachers
    }, 200, getPaginationMeta(total, page, limit));

  } catch (error) {
    console.error('Get teachers error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Get all students
 * @route   GET /api/admin/students
 * @access  Private/Admin
 */
const getAllStudents = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page || 1, req.query.limit || 500);

    const [students, total] = await Promise.all([
      User.find({ role: 'student' })
        .populate('assignedClasses', 'classname')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments({ role: 'student' })
    ]);

    return successResponse(res, 'Students retrieved', {
      students
    }, 200, getPaginationMeta(total, page, limit));

  } catch (error) {
    console.error('Get students error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Get all classes
 * @route   GET /api/admin/classes
 * @access  Private/Admin
 */
const getAllClasses = async (req, res) => {
  try {
    const { page, limit } = getPagination(req.query.page, req.query.limit);

    const [classes, total] = await Promise.all([
      Class.find()
        .populate('teacher', 'name email')
        .populate('students', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Class.countDocuments()
    ]);

    return successResponse(res, 'Classes retrieved', {
      classes
    }, 200, getPaginationMeta(total, page, limit));

  } catch (error) {
    console.error('Get classes error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Get single class details
 * @route   GET /api/admin/class/:id
 * @access  Private/Admin
 */
const getClassById = async (req, res) => {
  try {
    const classId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return errorResponse(res, 'Invalid class ID', 400);
    }

    const classDoc = await Class.findById(classId)
      .populate('teacher', 'name email')
      .populate('students', 'name email');

    if (!classDoc) {
      return errorResponse(res, 'Class not found', 404);
    }

    // Get related statistics
    const [quizCount, assignmentCount, materialCount] = await Promise.all([
      Quiz.countDocuments({ classId }),
      Assignment.countDocuments({ classId }),
      Material.countDocuments({ classId })
    ]);

    return successResponse(res, 'Class retrieved', {
      class: classDoc,
      statistics: {
        quizzes: quizCount,
        assignments: assignmentCount,
        materials: materialCount,
        students: classDoc.students.length
      }
    });

  } catch (error) {
    console.error('Get class error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

module.exports = {
  getDashboard,
  getAdvancedDashboard,
  addTeacher,
  addStudent,
  updateTeacher,
  updateStudent,
  addClass,
  deleteTeacher,
  deleteStudent,
  deleteClass,
  updateClass,
  assignTeacher,
  assignStudents,
  removeStudentFromClass,
  getAllTeachers,
  getAllStudents,
  getAllClasses,
  getClassById
};
