const express = require('express');
const router = express.Router();
const { successResponse } = require('../utils/helpers');

/**
 * @route   GET / or /index
 * @desc    Landing page - shows system info
 * @access  Public
 */
router.get('/', (req, res) => {
  return successResponse(res, 'Welcome to EduTrackPro – Academic Management Platform API', {
    name: 'EduTrackPro – Academic Management Platform',
    version: '1.0.0',
    description: 'A comprehensive platform for managing academic operations, classes, coursework, assessments, and more.',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/user',
      admin: '/api/admin',
      teacher: '/api/teacher',
      student: '/api/student',
      head: '/api/head'
    }
  });
});

router.get('/index', (req, res) => {
  res.redirect('/');
});

/**
 * @route   GET /error
 * @desc    Generic error page
 * @access  Public
 */
router.get('/error', (req, res) => {
  return res.status(500).json({
    success: false,
    message: 'An error occurred',
    error: req.query.message || 'Invalid path or server error',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
  return successResponse(res, 'Server is healthy', {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
