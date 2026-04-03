const express = require('express');
const router = express.Router();
const { adminController } = require('../controllers');
const { auth, isAdmin } = require('../middlewares');

// All admin routes require authentication and admin role
router.use(auth, isAdmin);

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard statistics
 * @access  Private/Admin
 */
router.get('/dashboard', adminController.getDashboard);

/**
 * @route   GET /api/admin/dashboard-advanced
 * @desc    Get advanced admin dashboard (academic term aware)
 * @access  Private/Admin
 */
router.get('/dashboard-advanced', adminController.getAdvancedDashboard);

/**
 * @route   POST /api/admin/addteacher
 * @desc    Add new teacher (legacy)
 * @access  Private/Admin
 */
router.post('/addteacher', adminController.addTeacher);

/**
 * @route   POST /api/admin/teachers
 * @desc    Add new teacher (REST)
 * @access  Private/Admin
 */
router.post('/teachers', adminController.addTeacher);

/**
 * @route   POST /api/admin/addstudent
 * @desc    Add new student (legacy)
 * @access  Private/Admin
 */
router.post('/addstudent', adminController.addStudent);

/**
 * @route   POST /api/admin/students
 * @desc    Add new student (REST)
 * @access  Private/Admin
 */
router.post('/students', adminController.addStudent);

/**
 * @route   POST /api/admin/addclass
 * @desc    Add new class
 * @access  Private/Admin
 */
router.post('/addclass', adminController.addClass);

/**
 * @route   PUT /api/admin/teachers/:id
 * @desc    Update teacher
 * @access  Private/Admin
 */
router.put('/teachers/:id', adminController.updateTeacher);

/**
 * @route   DELETE /api/admin/teacher/:id
 * @desc    Delete teacher (legacy)
 * @access  Private/Admin
 */
router.delete('/teacher/:id', adminController.deleteTeacher);

/**
 * @route   DELETE /api/admin/teachers/:id
 * @desc    Delete teacher (REST)
 * @access  Private/Admin
 */
router.delete('/teachers/:id', adminController.deleteTeacher);

/**
 * @route   PUT /api/admin/students/:id
 * @desc    Update student
 * @access  Private/Admin
 */
router.put('/students/:id', adminController.updateStudent);

/**
 * @route   DELETE /api/admin/student/:id
 * @desc    Delete student (legacy)
 * @access  Private/Admin
 */
router.delete('/student/:id', adminController.deleteStudent);

/**
 * @route   DELETE /api/admin/students/:id
 * @desc    Delete student (REST)
 * @access  Private/Admin
 */
router.delete('/students/:id', adminController.deleteStudent);

/**
 * @route   DELETE /api/admin/class/:id
 * @desc    Delete class
 * @access  Private/Admin
 */
router.delete('/class/:id', adminController.deleteClass);

/**
 * @route   PUT /api/admin/class/:id
 * @desc    Update class
 * @access  Private/Admin
 */
router.put('/class/:id', adminController.updateClass);

/**
 * @route   PUT /api/admin/assignteacher/:id
 * @desc    Assign teacher to class
 * @access  Private/Admin
 */
router.put('/assignteacher/:id', adminController.assignTeacher);

/**
 * @route   PUT /api/admin/assignstudent/:id
 * @desc    Assign students to class
 * @access  Private/Admin
 */
router.put('/assignstudent/:id', adminController.assignStudents);

/**
 * @route   DELETE /api/admin/class/:classId/student/:studentId
 * @desc    Remove student from class
 * @access  Private/Admin
 */
router.delete('/class/:classId/student/:studentId', adminController.removeStudentFromClass);

/**
 * @route   GET /api/admin/teachers
 * @desc    Get all teachers
 * @access  Private/Admin
 */
router.get('/teachers', adminController.getAllTeachers);

/**
 * @route   GET /api/admin/students
 * @desc    Get all students
 * @access  Private/Admin
 */
router.get('/students', adminController.getAllStudents);

/**
 * @route   GET /api/admin/classes
 * @desc    Get all classes
 * @access  Private/Admin
 */
router.get('/classes', adminController.getAllClasses);

/**
 * @route   GET /api/admin/class/:id
 * @desc    Get single class details
 * @access  Private/Admin
 */
router.get('/class/:id', adminController.getClassById);

module.exports = router;
