const { validationResult } = require('express-validator');

/**
 * Validation Middleware
 * Handles validation errors from express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  
  next();
};

/**
 * MongoDB ObjectId Validator
 */
const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

const isValidObjectId = (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error('Invalid ID format');
  }
  return true;
};

// Common validation rules
const validationRules = {
  // User validations
  email: body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
  
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  role: body('role')
    .isIn(['admin', 'teacher', 'student', 'head'])
    .withMessage('Invalid role specified'),
  
  // Class validations
  classname: body('classname')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Class name must be between 2 and 100 characters'),
  
  // ID validations
  paramId: param('id').custom(isValidObjectId),
  
  bodyClassId: body('classId').custom(isValidObjectId),
  
  bodyStudentId: body('studentId').custom(isValidObjectId),
  
  bodyTeacherId: body('teacherId').custom(isValidObjectId),
  
  // Marks validations
  marks: body('marks')
    .isNumeric()
    .withMessage('Marks must be a number')
    .custom((value) => {
      if (value < 0 || value > 100) {
        throw new Error('Marks must be between 0 and 100');
      }
      return true;
    }),
  
  // Quiz validations
  quizTitle: body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Quiz title must be between 1 and 200 characters'),
  
  questions: body('questions')
    .isArray({ min: 1 })
    .withMessage('Quiz must have at least one question'),
  
  // Assignment validations
  assignmentTitle: body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Assignment title must be between 1 and 200 characters'),
  
  description: body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description must be between 1 and 2000 characters'),
  
  dueDate: body('dueDate')
    .isISO8601()
    .withMessage('Invalid due date format'),
  
  // Material validations
  materialTitle: body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Material title must be between 1 and 200 characters')
};

module.exports = {
  validate,
  validationRules,
  isValidObjectId
};
