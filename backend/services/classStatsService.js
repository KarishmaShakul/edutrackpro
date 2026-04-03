const { Class } = require('../models');
const { getCurrentAcademicTerm } = require('../utils/academicTerm');

/**
 * Class module – computation layer for class statistics.
 * GET /api/classes/stats uses this.
 */
const getClassStats = async () => {
  const { academicYear, semesterType, semesterNumber } = getCurrentAcademicTerm();

  const classFilter = {
    academicYear,
    semesterType,
    semesterNumber,
    isActive: true
  };

  const [totalClasses, activeCourses, classesWithoutTeacher] = await Promise.all([
    Class.countDocuments(),
    Class.countDocuments(classFilter),
    Class.find({ ...classFilter, teacher: null })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('classname createdAt')
      .lean()
  ]);

  return {
    totalClasses,
    activeCourses,
    classesWithoutTeacher: classesWithoutTeacher.map((c) => ({
      classname: c.classname,
      createdAt: c.createdAt
    }))
  };
};

module.exports = { getClassStats };
