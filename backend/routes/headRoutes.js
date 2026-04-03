const express = require('express');
const router = express.Router();
const { headController } = require('../controllers');
const { auth, isHead } = require('../middlewares');

// All head routes require authentication and head role
router.use(auth, isHead);

/**
 * @route   GET /api/head/
 * @desc    Get head dashboard with statistics
 * @access  Private/Head
 */
router.get('/', headController.getDashboard);

/**
 * @route   GET /api/head/dashboard
 * @desc    Get head dashboard (alias)
 * @access  Private/Head
 */
router.get('/dashboard', headController.getDashboard);

/**
 * @route   GET /api/head/results
 * @desc    Get all results across classes
 * @access  Private/Head
 */
router.get('/results', headController.getAllResults);

/**
 * @route   GET /api/head/results/class/:id
 * @desc    Get class result summary
 * @access  Private/Head
 */
router.get('/results/class/:id', headController.getClassResults);

/**
 * @route   GET /api/head/classes/:id/results
 * @desc    Get specific class results (alias)
 * @access  Private/Head
 */
router.get('/classes/:id/results', headController.getClassResults);

/**
 * @route   GET /api/head/material
 * @desc    Get all materials across classes
 * @access  Private/Head
 */
router.get('/material', headController.getAllMaterials);

/**
 * @route   GET /api/head/graph
 * @desc    Get progress graph data
 * @access  Private/Head
 */
router.get('/graph', headController.getProgressGraph);

/**
 * @route   GET /api/head/graph/student/:studentId
 * @desc    Get individual student graph
 * @access  Private/Head
 */
router.get('/graph/student/:studentId', headController.getStudentGraph);

/**
 * @route   GET /api/head/classes
 * @desc    Get all classes overview
 * @access  Private/Head
 */
router.get('/classes', headController.getAllClasses);

/**
 * @route   GET /api/head/teachers
 * @desc    Get all teachers
 * @access  Private/Head
 */
router.get('/teachers', headController.getAllTeachers);

/**
 * @route   GET /api/head/students
 * @desc    Get all students
 * @access  Private/Head
 */
router.get('/students', headController.getAllStudents);

module.exports = router;
