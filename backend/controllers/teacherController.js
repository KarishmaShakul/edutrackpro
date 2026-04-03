const mongoose = require('mongoose');
const { User, Class, Quiz, Assignment, Material, Marks } = require('../models');
const { successResponse, errorResponse, getPagination, getPaginationMeta, calculatePercentage } = require('../utils/helpers');

/**
 * @desc    Get teacher dashboard
 * @route   GET /api/teacher/dashboard
 * @access  Private/Teacher
 */
const getDashboard = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // Get assigned classes
    const classes = await Class.find({ teacher: teacherId })
      .populate('students', 'name email');

    const classIds = classes.map(c => c._id);

    // Get statistics
    const [totalQuizzes, totalAssignments, totalMaterials] = await Promise.all([
      Quiz.countDocuments({ classId: { $in: classIds } }),
      Assignment.countDocuments({ classId: { $in: classIds } }),
      Material.countDocuments({ classId: { $in: classIds } })
    ]);

    // Get pending submissions
    const pendingAssignments = await Assignment.find({
      classId: { $in: classIds },
      'submissions.status': 'pending'
    }).select('title classId submissions').populate('classId', 'classname');

    const totalStudents = classes.reduce((sum, c) => sum + (c.students?.length || 0), 0);

    return successResponse(res, 'Dashboard retrieved', {
      statistics: {
        totalClasses: classes.length,
        totalStudents,
        totalQuizzes,
        totalAssignments,
        totalMaterials
      },
      classes,
      pendingSubmissions: pendingAssignments.length
    });

  } catch (error) {
    console.error('Teacher dashboard error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Get teacher's classes
 * @route   GET /api/teacher/classes
 * @access  Private/Teacher
 */
const getMyClasses = async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.user._id })
      .populate('students', 'name email');

    return successResponse(res, 'Classes retrieved', { classes });

  } catch (error) {
    console.error('Get classes error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Add quiz
 * @route   POST /api/teacher/addquiz
 * @access  Private/Teacher
 */
const addQuiz = async (req, res) => {
  try {
    const { classId, title, description, questions, timeLimit, startDate, endDate, allowRetake, shuffleQuestions } = req.body;

    if (!classId || !title || !questions || !questions.length) {
      return errorResponse(res, 'Class ID, title, and questions are required', 400);
    }

    // Verify teacher owns this class
    const classDoc = await Class.findOne({ _id: classId, teacher: req.user._id });
    if (!classDoc) {
      return errorResponse(res, 'Class not found or not assigned to you', 404);
    }

    const quiz = await Quiz.create({
      classId,
      title,
      description: description || '',
      questions,
      timeLimit: timeLimit || 30,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      allowRetake: allowRetake || false,
      shuffleQuestions: shuffleQuestions || false,
      isPublished: true,
      createdBy: req.user._id
    });

    return successResponse(res, 'Quiz created successfully', { quiz }, 201);

  } catch (error) {
    console.error('Add quiz error:', error);
    return errorResponse(res, error.message || 'Server error', 500);
  }
};

/**
 * @desc    Delete quiz
 * @route   DELETE /api/teacher/quiz/:id
 * @access  Private/Teacher
 */
const deleteQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return errorResponse(res, 'Invalid quiz ID', 400);
    }

    const quiz = await Quiz.findById(quizId).populate('classId');

    if (!quiz) {
      return errorResponse(res, 'Quiz not found', 404);
    }

    // Verify teacher owns this class
    if (quiz.classId.teacher.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized', 403);
    }

    await Quiz.findByIdAndDelete(quizId);

    return successResponse(res, 'Quiz deleted successfully');

  } catch (error) {
    console.error('Delete quiz error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Get quizzes for teacher's classes
 * @route   GET /api/teacher/quizzes
 * @access  Private/Teacher
 */
const getQuizzes = async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.user._id }).select('_id');
    const classIds = classes.map(c => c._id);

    const quizzes = await Quiz.find({ classId: { $in: classIds } })
      .populate('classId', 'classname')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Quizzes retrieved', { quizzes });

  } catch (error) {
    console.error('Get quizzes error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Add assignment
 * @route   POST /api/teacher/addassign
 * @access  Private/Teacher
 */
const addAssignment = async (req, res) => {
  try {
    const { classId, title, description, dueDate, totalMarks, allowLateSubmission } = req.body;

    if (!classId || !title || !description || !dueDate) {
      return errorResponse(res, 'Class ID, title, description, and due date are required', 400);
    }

    // Verify teacher owns this class
    const classDoc = await Class.findOne({ _id: classId, teacher: req.user._id });
    if (!classDoc) {
      return errorResponse(res, 'Class not found or not assigned to you', 404);
    }

    const fileUrl = req.file ? `/uploads/assignments/${req.file.filename}` : null;

    const assignment = await Assignment.create({
      classId,
      title,
      description,
      fileUrl,
      fileName: req.file?.originalname || null,
      dueDate: new Date(dueDate),
      totalMarks: totalMarks || 100,
      allowLateSubmission: allowLateSubmission !== false,
      createdBy: req.user._id
    });

    return successResponse(res, 'Assignment created successfully', { assignment }, 201);

  } catch (error) {
    console.error('Add assignment error:', error);
    return errorResponse(res, error.message || 'Server error', 500);
  }
};

/**
 * @desc    View assignments with submissions
 * @route   GET /api/teacher/viewattassign
 * @access  Private/Teacher
 */
const viewAssignmentsWithSubmissions = async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.user._id }).select('_id classname');
    const classIds = classes.map(c => c._id);

    const assignments = await Assignment.find({ classId: { $in: classIds } })
      .populate('classId', 'classname')
      .populate('submissions.studentId', 'name email')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Assignments retrieved', {
      teacher: req.user.name,
      totalAssignments: assignments.length,
      assignments
    });

  } catch (error) {
    console.error('View assignments error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Get student's assignment submission file
 * @route   GET /api/teacher/assign/:id
 * @access  Private/Teacher
 */
const getAssignmentSubmission = async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const { studentId } = req.query;

    if (!studentId) {
      return errorResponse(res, 'Student ID is required', 400);
    }

    if (!mongoose.Types.ObjectId.isValid(assignmentId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      return errorResponse(res, 'Invalid IDs', 400);
    }

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return errorResponse(res, 'Assignment not found', 404);
    }

    const submission = assignment.submissions.find(
      s => s.studentId.toString() === studentId
    );

    if (!submission) {
      return errorResponse(res, 'Submission not found', 404);
    }

    return successResponse(res, 'Submission retrieved', { submission });

  } catch (error) {
    console.error('Get submission error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Add material
 * @route   POST /api/teacher/addmat
 * @access  Private/Teacher
 */
const addMaterial = async (req, res) => {
  try {
    const { classId, title, description, type, topic, weekNumber } = req.body;

    if (!classId || !title) {
      return errorResponse(res, 'Class ID and title are required', 400);
    }

    if (!req.file) {
      return errorResponse(res, 'File is required', 400);
    }

    // Verify teacher owns this class
    const classDoc = await Class.findOne({ _id: classId, teacher: req.user._id });
    if (!classDoc) {
      return errorResponse(res, 'Class not found or not assigned to you', 404);
    }

    const material = await Material.create({
      classId,
      title,
      description: description || '',
      fileUrl: `/uploads/materials/${req.file.filename}`,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      uploadedBy: req.user._id,
      type: type || 'document',
      topic: topic || null,
      weekNumber: weekNumber || null
    });

    return successResponse(res, 'Material uploaded successfully', { material }, 201);

  } catch (error) {
    console.error('Add material error:', error);
    return errorResponse(res, error.message || 'Server error', 500);
  }
};

/**
 * @desc    Delete material
 * @route   DELETE /api/teacher/material/:id
 * @access  Private/Teacher
 */
const deleteMaterial = async (req, res) => {
  try {
    const materialId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(materialId)) {
      return errorResponse(res, 'Invalid material ID', 400);
    }

    const material = await Material.findById(materialId);

    if (!material) {
      return errorResponse(res, 'Material not found', 404);
    }

    // Verify teacher uploaded this material
    if (material.uploadedBy.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized', 403);
    }

    await Material.findByIdAndDelete(materialId);

    return successResponse(res, 'Material deleted successfully');

  } catch (error) {
    console.error('Delete material error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Add marks
 * @route   POST /api/teacher/addmarks
 * @access  Private/Teacher
 */
const addMarks = async (req, res) => {
  try {
    const { studentId, classId, type, title, marks, totalMarks, feedback } = req.body;

    if (!studentId || !classId || !type || !title || marks === undefined || !totalMarks) {
      return errorResponse(res, 'All fields are required', 400);
    }

    if (marks < 0 || marks > totalMarks) {
      return errorResponse(res, `Marks must be between 0 and ${totalMarks}`, 400);
    }

    // Verify teacher owns this class
    const classDoc = await Class.findOne({ _id: classId, teacher: req.user._id });
    if (!classDoc) {
      return errorResponse(res, 'Class not found or not assigned to you', 404);
    }

    // Verify student is in this class
    if (!classDoc.students.includes(studentId)) {
      return errorResponse(res, 'Student not in this class', 400);
    }

    const marksRecord = await Marks.create({
      studentId,
      classId,
      type,
      title,
      marks,
      totalMarks,
      feedback: feedback || null,
      gradedBy: req.user._id
    });

    return successResponse(res, 'Marks added successfully', { marks: marksRecord }, 201);

  } catch (error) {
    console.error('Add marks error:', error);
    return errorResponse(res, error.message || 'Server error', 500);
  }
};

/**
 * @desc    Update marks
 * @route   PUT /api/teacher/marks/:id
 * @access  Private/Teacher
 */
const updateMarks = async (req, res) => {
  try {
    const marksId = req.params.id;
    const { marks, feedback } = req.body;

    if (!mongoose.Types.ObjectId.isValid(marksId)) {
      return errorResponse(res, 'Invalid marks ID', 400);
    }

    const marksRecord = await Marks.findById(marksId);

    if (!marksRecord) {
      return errorResponse(res, 'Marks record not found', 404);
    }

    if (marks !== undefined) {
      if (marks < 0 || marks > marksRecord.totalMarks) {
        return errorResponse(res, `Marks must be between 0 and ${marksRecord.totalMarks}`, 400);
      }
      marksRecord.marks = marks;
    }

    if (feedback !== undefined) {
      marksRecord.feedback = feedback;
    }

    marksRecord.gradedBy = req.user._id;
    marksRecord.gradedAt = new Date();

    await marksRecord.save();

    return successResponse(res, 'Marks updated successfully', { marks: marksRecord });

  } catch (error) {
    console.error('Update marks error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Delete marks
 * @route   DELETE /api/teacher/marks/:id
 * @access  Private/Teacher
 */
const deleteMarks = async (req, res) => {
  try {
    const marksId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(marksId)) {
      return errorResponse(res, 'Invalid marks ID', 400);
    }

    const marksRecord = await Marks.findById(marksId);

    if (!marksRecord) {
      return errorResponse(res, 'Marks record not found', 404);
    }

    await Marks.findByIdAndDelete(marksId);

    return successResponse(res, 'Marks deleted successfully');

  } catch (error) {
    console.error('Delete marks error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Grade assignment submission
 * @route   PUT /api/teacher/assignment/:assignmentId/grade/:studentId
 * @access  Private/Teacher
 */
const gradeAssignment = async (req, res) => {
  try {
    const { assignmentId, studentId } = req.params;
    const { marks, feedback } = req.body;

    if (marks === undefined) {
      return errorResponse(res, 'Marks are required', 400);
    }

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return errorResponse(res, 'Assignment not found', 404);
    }

    const submissionIndex = assignment.submissions.findIndex(
      s => s.studentId.toString() === studentId
    );

    if (submissionIndex === -1) {
      return errorResponse(res, 'Submission not found', 404);
    }

    if (marks < 0 || marks > assignment.totalMarks) {
      return errorResponse(res, `Marks must be between 0 and ${assignment.totalMarks}`, 400);
    }

    assignment.submissions[submissionIndex].marks = marks;
    assignment.submissions[submissionIndex].feedback = feedback || null;
    assignment.submissions[submissionIndex].status = 'graded';

    await assignment.save();

    return successResponse(res, 'Assignment graded successfully', {
      submission: assignment.submissions[submissionIndex]
    });

  } catch (error) {
    console.error('Grade assignment error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Get class students with marks
 * @route   GET /api/teacher/class/:id/students
 * @access  Private/Teacher
 */
const getClassStudents = async (req, res) => {
  try {
    const classId = req.params.id;

    const classDoc = await Class.findOne({ _id: classId, teacher: req.user._id })
      .populate('students', 'name email');

    if (!classDoc) {
      return errorResponse(res, 'Class not found or not assigned to you', 404);
    }

    // Get marks for all students
    const studentMarks = await Marks.find({
      classId,
      studentId: { $in: classDoc.students.map(s => s._id) }
    });

    const studentsWithMarks = classDoc.students.map(student => {
      const marks = studentMarks.filter(m => m.studentId.toString() === student._id.toString());
      const totalObtained = marks.reduce((sum, m) => sum + m.marks, 0);
      const totalPossible = marks.reduce((sum, m) => sum + m.totalMarks, 0);

      return {
        ...student.toObject(),
        marksCount: marks.length,
        totalObtained,
        totalPossible,
        percentage: calculatePercentage(totalObtained, totalPossible)
      };
    });

    return successResponse(res, 'Students retrieved', { students: studentsWithMarks });

  } catch (error) {
    console.error('Get students error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    View quizzes with submitted answers
 * @route   GET /api/teacher/viewattquiz
 * @access  Private/Teacher
 */
const viewQuizzesWithSubmissions = async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.user._id }).select('_id classname');
    const classIds = classes.map(c => c._id);

    const quizzes = await Quiz.find({ classId: { $in: classIds } })
      .populate('classId', 'classname')
      .populate('submissions.studentId', 'name email')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Quizzes retrieved', {
      teacher: req.user.name,
      totalQuizzes: quizzes.length,
      quizzes
    });

  } catch (error) {
    console.error('View quizzes error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Get specific quiz with answers for correction
 * @route   GET /api/teacher/quiz/:id
 * @access  Private/Teacher
 */
const getQuizById = async (req, res) => {
  try {
    const quizId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return errorResponse(res, 'Invalid quiz ID', 400);
    }

    const quiz = await Quiz.findById(quizId)
      .populate('classId', 'classname teacher')
      .populate('submissions.studentId', 'name email');

    if (!quiz) {
      return errorResponse(res, 'Quiz not found', 404);
    }

    // Verify teacher owns this class
    if (quiz.classId.teacher.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized', 403);
    }

    return successResponse(res, 'Quiz retrieved', { quiz });

  } catch (error) {
    console.error('Get quiz error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Get all materials for teacher's classes
 * @route   GET /api/teacher/materials
 * @access  Private/Teacher
 */
const getMaterials = async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.user._id }).select('_id classname');
    const classIds = classes.map(c => c._id);

    const materials = await Material.find({ classId: { $in: classIds } })
      .populate('classId', 'classname')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Materials retrieved', {
      totalMaterials: materials.length,
      materials
    });

  } catch (error) {
    console.error('Get materials error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

module.exports = {
  getDashboard,
  getMyClasses,
  addQuiz,
  deleteQuiz,
  getQuizzes,
  addAssignment,
  viewAssignmentsWithSubmissions,
  getAssignmentSubmission,
  addMaterial,
  deleteMaterial,
  addMarks,
  updateMarks,
  deleteMarks,
  gradeAssignment,
  getClassStudents,
  viewQuizzesWithSubmissions,
  getQuizById,
  getMaterials
};
