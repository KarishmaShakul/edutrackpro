const { Assignment, Class } = require('../models');
const { getCurrentAcademicTerm } = require('../utils/academicTerm');

/**
 * Assignment module – computation layer.
 * GET /api/assignments/stats uses this.
 */
const getAssignmentStats = async () => {
  const { academicYear, semesterType, semesterNumber } = getCurrentAcademicTerm();

  const classFilter = {
    academicYear,
    semesterType,
    semesterNumber,
    isActive: true
  };

  const activeClassIds = await Class.find(classFilter).distinct('_id');
  const now = new Date();

  const [pendingAssignments, overdueAssignmentsList] = await Promise.all([
    Assignment.countDocuments({
      classId: { $in: activeClassIds },
      isPublished: true,
      dueDate: { $gte: now }
    }),
    Assignment.find({
      classId: { $in: activeClassIds },
      isPublished: true,
      dueDate: { $lt: now }
    })
      .sort({ dueDate: 1 })
      .limit(10)
      .select('title dueDate classId')
      .lean()
  ]);

  const overdueAssignments = overdueAssignmentsList.map((a) => ({
    title: a.title,
    dueDate: a.dueDate,
    classId: a.classId
  }));

  return {
    pendingAssignments,
    overdueAssignments
  };
};

module.exports = { getAssignmentStats };
