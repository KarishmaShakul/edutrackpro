const express = require('express');
const router = express.Router();
const { studentController } = require('../controllers');
const { auth, isStudent } = require('../middlewares');
const { uploadSubmission } = require('../utils/fileUpload');

// All student routes require authentication and student role
router.use(auth, isStudent);

/**
 * @route   GET /api/student/dashboard
 * @desc    Get student dashboard
 * @access  Private/Student
 */
router.get('/dashboard', studentController.getDashboard);

/**
 * @route   GET /api/student/classes
 * @desc    Get enrolled classes
 * @access  Private/Student
 */
router.get('/classes', studentController.getMyClasses);

/**
 * @route   GET /api/student/material
 * @desc    Get materials for enrolled classes
 * @access  Private/Student
 */
router.get('/material', studentController.getMaterials);

/**
 * @route   GET /api/student/material/:id
 * @desc    Get specific material by ID
 * @access  Private/Student
 */
router.get('/material/:id', studentController.getMaterialById);

/**
 * @route   POST /api/student/viewquiz
 * @desc    View quizzes for a class
 * @access  Private/Student
 */
router.post('/viewquiz', studentController.viewQuizzes);

/**
 * @route   POST /api/student/attemptquiz/:id
 * @desc    Attempt quiz
 * @access  Private/Student
 */
router.post('/attemptquiz/:id', studentController.attemptQuiz);

/**
 * @route   GET /api/student/assignments
 * @desc    Get assignments for enrolled classes
 * @access  Private/Student
 */
router.get('/assignments', studentController.getAssignments);

/**
 * @route   POST /api/student/submitassign/:id
 * @desc    Submit assignment
 * @access  Private/Student
 */
router.post('/submitassign/:id', uploadSubmission.single('file'), studentController.submitAssignment);

/**
 * @route   GET /api/student/results
 * @desc    Get student results/marks
 * @access  Private/Student
 */
router.get('/results', studentController.getResults);

/**
 * @route   GET /api/student/quiz/:id/result
 * @desc    Get quiz result
 * @access  Private/Student
 */
router.get('/quiz/:id/result', studentController.getQuizResult);

module.exports = router;
