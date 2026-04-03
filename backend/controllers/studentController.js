const mongoose = require('mongoose');
const { User, Class, Quiz, Assignment, Material, Marks } = require('../models');
const { successResponse, errorResponse, calculatePercentage } = require('../utils/helpers');

/**
 * @desc    Get student dashboard
 * @route   GET /api/student/dashboard
 * @access  Private/Student
 */
const getDashboard = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Get enrolled classes
    const student = await User.findById(studentId).populate('assignedClasses', 'classname teacher');
    const classIds = student.assignedClasses.map(c => c._id);

    // Get statistics
    const [totalQuizzes, totalAssignments, totalMaterials] = await Promise.all([
      Quiz.countDocuments({ classId: { $in: classIds }, isPublished: true }),
      Assignment.countDocuments({ classId: { $in: classIds }, isPublished: true }),
      Material.countDocuments({ classId: { $in: classIds }, isPublished: true })
    ]);

    // Get pending quizzes (not attempted)
    const quizzes = await Quiz.find({ classId: { $in: classIds }, isPublished: true });
    const pendingQuizzes = quizzes.filter(q => !q.hasStudentSubmitted(studentId)).length;

    // Get pending assignments
    const assignments = await Assignment.find({ 
      classId: { $in: classIds },
      isPublished: true,
      dueDate: { $gte: new Date() }
    });
    const pendingAssignments = assignments.filter(a => !a.hasStudentSubmitted(studentId)).length;

    // Get recent marks
    const recentMarks = await Marks.find({ studentId })
      .populate('classId', 'classname')
      .sort({ createdAt: -1 })
      .limit(5);

    return successResponse(res, 'Dashboard retrieved', {
      statistics: {
        enrolledClasses: student.assignedClasses.length,
        totalQuizzes,
        totalAssignments,
        totalMaterials,
        pendingQuizzes,
        pendingAssignments
      },
      enrolledClasses: student.assignedClasses,
      recentMarks
    });

  } catch (error) {
    console.error('Student dashboard error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Get enrolled classes
 * @route   GET /api/student/classes
 * @access  Private/Student
 */
const getMyClasses = async (req, res) => {
  try {
    const student = await User.findById(req.user._id)
      .populate({
        path: 'assignedClasses',
        populate: { path: 'teacher', select: 'name email' }
      });

    return successResponse(res, 'Classes retrieved', { classes: student.assignedClasses });

  } catch (error) {
    console.error('Get classes error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Get materials for enrolled classes
 * @route   GET /api/student/material
 * @access  Private/Student
 */
const getMaterials = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    
    if (!student.assignedClasses || student.assignedClasses.length === 0) {
      return successResponse(res, 'No classes assigned', { materials: [] });
    }

    const materials = await Material.find({
      classId: { $in: student.assignedClasses },
      isPublished: true
    })
    .populate('classId', 'classname')
    .populate('uploadedBy', 'name')
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
 * @desc    Get specific material by ID
 * @route   GET /api/student/material/:id
 * @access  Private/Student
 */
const getMaterialById = async (req, res) => {
  try {
    const materialId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(materialId)) {
      return errorResponse(res, 'Invalid material ID', 400);
    }

    const material = await Material.findById(materialId)
      .populate('classId', 'classname')
      .populate('uploadedBy', 'name');

    if (!material) {
      return errorResponse(res, 'Material not found', 404);
    }

    // Verify student is enrolled in this class
    const student = await User.findById(req.user._id);
    if (!student.assignedClasses.includes(material.classId._id.toString())) {
      return errorResponse(res, 'Not enrolled in this class', 403);
    }

    // Increment view count
    await material.incrementView();

    return successResponse(res, 'Material retrieved', { material });

  } catch (error) {
    console.error('Get material error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    View quizzes for a class
 * @route   POST /api/student/viewquiz
 * @access  Private/Student
 */
const viewQuizzes = async (req, res) => {
  try {
    const { classId } = req.body;
    const studentId = req.user._id;

    if (!classId) {
      return errorResponse(res, 'Class ID is required', 400);
    }

    // Verify student is enrolled
    const student = await User.findById(studentId);
    if (!student.assignedClasses.map(c => c.toString()).includes(classId)) {
      return errorResponse(res, 'Not enrolled in this class', 403);
    }

    const quizzes = await Quiz.find({ classId, isPublished: true })
      .select('title description questions submissions timeLimit startDate endDate createdAt')
      .sort({ createdAt: -1 });

    const processedQuizzes = quizzes.map(quiz => {
      const submission = quiz.getStudentSubmission(studentId);
      
      return {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        totalQuestions: quiz.questions.length,
        timeLimit: quiz.timeLimit,
        status: submission ? 'attempted' : 'not attempted',
        marks: submission?.marks || null,
        percentage: submission?.percentage || null,
        attemptedAt: submission?.submittedAt || null,
        createdAt: quiz.createdAt
      };
    });

    return successResponse(res, 'Quizzes retrieved', {
      classId,
      quizzes: processedQuizzes
    });

  } catch (error) {
    console.error('View quizzes error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Attempt quiz
 * @route   POST /api/student/attemptquiz/:id
 * @access  Private/Student
 */
const attemptQuiz = async (req, res) => {
  try {
    const quizId = req.params.id;
    const { answers } = req.body;
    const studentId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return errorResponse(res, 'Invalid quiz ID', 400);
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return errorResponse(res, 'Quiz not found', 404);
    }

    if (!quiz.isPublished) {
      return errorResponse(res, 'Quiz is not available', 400);
    }

    // Check if already attempted
    if (quiz.hasStudentSubmitted(studentId) && !quiz.allowRetake) {
      return errorResponse(res, 'Quiz already attempted', 400);
    }

    // Verify student is enrolled in the class
    const student = await User.findById(studentId);
    if (!student.assignedClasses.map(c => c.toString()).includes(quiz.classId.toString())) {
      return errorResponse(res, 'Not enrolled in this class', 403);
    }

    // Grade the quiz
    let correctCount = 0;
    const gradedAnswers = quiz.questions.map((question, index) => {
      const studentAnswer = answers[index]?.selectedAnswer || '';
      const isCorrect = studentAnswer.toLowerCase().trim() === question.answer.toLowerCase().trim();
      
      if (isCorrect) correctCount++;

      return {
        questionId: question._id,
        selectedAnswer: studentAnswer,
        isCorrect
      };
    });

    const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const earnedPoints = quiz.questions.reduce((sum, q, i) => {
      return sum + (gradedAnswers[i].isCorrect ? (q.points || 1) : 0);
    }, 0);

    const percentage = calculatePercentage(earnedPoints, totalPoints);

    // Create submission
    const submission = {
      studentId,
      answers: gradedAnswers,
      marks: earnedPoints,
      totalPoints,
      percentage,
      submittedAt: new Date()
    };

    // Remove old submission if retake allowed
    if (quiz.allowRetake) {
      quiz.submissions = quiz.submissions.filter(
        s => s.studentId.toString() !== studentId.toString()
      );
    }

    quiz.submissions.push(submission);
    await quiz.save();

    return successResponse(res, 'Quiz submitted successfully', {
      marks: earnedPoints,
      totalPoints,
      percentage,
      correctAnswers: correctCount,
      totalQuestions: quiz.questions.length
    });

  } catch (error) {
    console.error('Attempt quiz error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Get assignments for enrolled classes
 * @route   GET /api/student/assignments
 * @access  Private/Student
 */
const getAssignments = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);

    const assignments = await Assignment.find({
      classId: { $in: student.assignedClasses },
      isPublished: true
    })
    .populate('classId', 'classname')
    .sort({ dueDate: 1 });

    const processedAssignments = assignments.map(assignment => {
      const submission = assignment.getStudentSubmission(req.user._id);
      
      return {
        ...assignment.toObject(),
        hasSubmitted: !!submission,
        submission: submission || null,
        isOverdue: new Date() > assignment.dueDate
      };
    });

    return successResponse(res, 'Assignments retrieved', { assignments: processedAssignments });

  } catch (error) {
    console.error('Get assignments error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Submit assignment
 * @route   POST /api/student/submitassign/:id
 * @access  Private/Student
 */
const submitAssignment = async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const studentId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return errorResponse(res, 'Invalid assignment ID', 400);
    }

    if (!req.file) {
      return errorResponse(res, 'File is required', 400);
    }

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return errorResponse(res, 'Assignment not found', 404);
    }

    // Verify student is enrolled
    const student = await User.findById(studentId);
    if (!student.assignedClasses.map(c => c.toString()).includes(assignment.classId.toString())) {
      return errorResponse(res, 'Not enrolled in this class', 403);
    }

    // Check if already submitted
    const existingSubmission = assignment.getStudentSubmission(studentId);
    if (existingSubmission) {
      return errorResponse(res, 'Already submitted', 400);
    }

    // Check due date
    const isLate = new Date() > assignment.dueDate;
    if (isLate && !assignment.allowLateSubmission) {
      return errorResponse(res, 'Assignment deadline has passed', 400);
    }

    const submission = {
      studentId,
      fileUrl: `/uploads/submissions/${req.file.filename}`,
      fileName: req.file.originalname,
      submittedAt: new Date(),
      isLate,
      status: 'pending'
    };

    assignment.submissions.push(submission);
    await assignment.save();

    return successResponse(res, 'Assignment submitted successfully', { submission }, 201);

  } catch (error) {
    console.error('Submit assignment error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Get student results/marks
 * @route   GET /api/student/results
 * @access  Private/Student
 */
const getResults = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { classId } = req.query;

    const query = { studentId, isPublished: true };
    if (classId) query.classId = classId;

    const marks = await Marks.find(query)
      .populate('classId', 'classname')
      .sort({ createdAt: -1 });

    // Calculate summary
    const summary = await Marks.getStudentSummary(studentId, classId || null);

    return successResponse(res, 'Results retrieved', {
      marks,
      summary
    });

  } catch (error) {
    console.error('Get results error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

/**
 * @desc    Get quiz result
 * @route   GET /api/student/quiz/:id/result
 * @access  Private/Student
 */
const getQuizResult = async (req, res) => {
  try {
    const quizId = req.params.id;
    const studentId = req.user._id;

    const quiz = await Quiz.findById(quizId)
      .populate('classId', 'classname');

    if (!quiz) {
      return errorResponse(res, 'Quiz not found', 404);
    }

    const submission = quiz.getStudentSubmission(studentId);

    if (!submission) {
      return errorResponse(res, 'Quiz not attempted', 404);
    }

    // Only show results if allowed
    if (!quiz.showResults) {
      return successResponse(res, 'Quiz result', {
        marks: submission.marks,
        totalPoints: submission.totalPoints,
        percentage: submission.percentage,
        submittedAt: submission.submittedAt,
        detailedResults: 'Results are hidden by instructor'
      });
    }

    return successResponse(res, 'Quiz result', {
      quiz: {
        title: quiz.title,
        classname: quiz.classId.classname
      },
      submission: {
        marks: submission.marks,
        totalPoints: submission.totalPoints,
        percentage: submission.percentage,
        submittedAt: submission.submittedAt,
        answers: submission.answers
      }
    });

  } catch (error) {
    console.error('Get quiz result error:', error);
    return errorResponse(res, 'Server error', 500);
  }
};

module.exports = {
  getDashboard,
  getMyClasses,
  getMaterials,
  getMaterialById,
  viewQuizzes,
  attemptQuiz,
  getAssignments,
  submitAssignment,
  getResults,
  getQuizResult
};
