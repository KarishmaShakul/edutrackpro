const express = require('express');
const router = express.Router();
const { teacherController } = require('../controllers');
const { auth, isTeacher } = require('../middlewares');
const { uploadMaterial, uploadAssignment } = require('../utils/fileUpload');

// All teacher routes require authentication and teacher role
router.use(auth, isTeacher);

/**
 * @route   GET /api/teacher/dashboard
 * @desc    Get teacher dashboard
 * @access  Private/Teacher
 */
router.get('/dashboard', teacherController.getDashboard);

/**
 * @route   GET /api/teacher/classes
 * @desc    Get teacher's assigned classes
 * @access  Private/Teacher
 */
router.get('/classes', teacherController.getMyClasses);

/**
 * @route   POST /api/teacher/addquiz
 * @desc    Add new quiz
 * @access  Private/Teacher
 */
router.post('/addquiz', teacherController.addQuiz);

/**
 * @route   DELETE /api/teacher/quiz/:id
 * @desc    Delete quiz
 * @access  Private/Teacher
 */
router.delete('/quiz/:id', teacherController.deleteQuiz);

/**
 * @route   GET /api/teacher/quizzes
 * @desc    Get all quizzes for teacher's classes
 * @access  Private/Teacher
 */
router.get('/quizzes', teacherController.getQuizzes);

/**
 * @route   GET /api/teacher/viewattquiz
 * @desc    View quizzes with student submissions
 * @access  Private/Teacher
 */
router.get('/viewattquiz', teacherController.viewQuizzesWithSubmissions);

/**
 * @route   GET /api/teacher/quiz/:id
 * @desc    Get specific quiz with submissions for correction
 * @access  Private/Teacher
 */
router.get('/quiz/:id', teacherController.getQuizById);

/**
 * @route   POST /api/teacher/addassign
 * @desc    Add new assignment
 * @access  Private/Teacher
 */
router.post('/addassign', uploadAssignment.single('file'), teacherController.addAssignment);

/**
 * @route   GET /api/teacher/viewattassign
 * @desc    View assignments with submissions
 * @access  Private/Teacher
 */
router.get('/viewattassign', teacherController.viewAssignmentsWithSubmissions);

/**
 * @route   GET /api/teacher/assign/:id
 * @desc    Get student's assignment submission
 * @access  Private/Teacher
 */
router.get('/assign/:id', teacherController.getAssignmentSubmission);

/**
 * @route   POST /api/teacher/addmat
 * @desc    Add material
 * @access  Private/Teacher
 */
router.post('/addmat', uploadMaterial.single('file'), teacherController.addMaterial);

/**
 * @route   GET /api/teacher/materials
 * @desc    Get all materials for teacher's classes
 * @access  Private/Teacher
 */
router.get('/materials', teacherController.getMaterials);

/**
 * @route   DELETE /api/teacher/material/:id
 * @desc    Delete material
 * @access  Private/Teacher
 */
router.delete('/material/:id', teacherController.deleteMaterial);

/**
 * @route   POST /api/teacher/addmarks
 * @desc    Add marks
 * @access  Private/Teacher
 */
router.post('/addmarks', teacherController.addMarks);

/**
 * @route   PUT /api/teacher/marks/:id
 * @desc    Update marks
 * @access  Private/Teacher
 */
router.put('/marks/:id', teacherController.updateMarks);

/**
 * @route   DELETE /api/teacher/marks/:id
 * @desc    Delete marks
 * @access  Private/Teacher
 */
router.delete('/marks/:id', teacherController.deleteMarks);

/**
 * @route   PUT /api/teacher/assignment/:assignmentId/grade/:studentId
 * @desc    Grade assignment submission
 * @access  Private/Teacher
 */
router.put('/assignment/:assignmentId/grade/:studentId', teacherController.gradeAssignment);

/**
 * @route   GET /api/teacher/class/:id/students
 * @desc    Get class students with marks
 * @access  Private/Teacher
 */
router.get('/class/:id/students', teacherController.getClassStudents);

module.exports = router;
