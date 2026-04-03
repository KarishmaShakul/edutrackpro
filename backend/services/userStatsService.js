const { User } = require('../models');

/**
 * User module – computation layer for user statistics.
 * GET /api/users/stats uses this.
 */
const getUserStats = async () => {
  const [totalStudents, totalFaculty, totalAdmins, activeUsers] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'teacher' }),
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ isActive: true })
  ]);

  return {
    totalStudents,
    totalFaculty,
    totalAdmins,
    activeUsers
  };
};

module.exports = { getUserStats };
