// Export all controllers
const authController = require('./authController');
const adminController = require('./adminController');
const teacherController = require('./teacherController');
const studentController = require('./studentController');
const headController = require('./headController');

module.exports = {
  authController,
  adminController,
  teacherController,
  studentController,
  headController
};
