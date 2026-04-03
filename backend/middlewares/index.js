// Export all middlewares
const { auth, optionalAuth } = require('./auth');
const { role, isAdmin, isTeacher, isStudent, isHead, isTeacherOrAdmin, isHeadOrAdmin } = require('./role');
const { validate, validationRules, isValidObjectId } = require('./validate');
const { AppError, errorHandler, notFoundHandler, asyncHandler } = require('./errorHandler');

module.exports = {
  // Auth
  auth,
  optionalAuth,
  
  // Role
  role,
  isAdmin,
  isTeacher,
  isStudent,
  isHead,
  isTeacherOrAdmin,
  isHeadOrAdmin,
  
  // Validation
  validate,
  validationRules,
  isValidObjectId,
  
  // Error handling
  AppError,
  errorHandler,
  notFoundHandler,
  asyncHandler
};
