/**
 * Current academic term (Indian academic year: Jul–Jun)
 */
const getCurrentAcademicTerm = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startYear = month >= 6 ? year : year - 1;
  const academicYear = `${startYear}\u2013${startYear + 1}`;
  const semesterType = month >= 6 ? 'Odd' : 'Even';
  const semesterNumber = semesterType === 'Odd' ? 5 : 6;
  return { academicYear, semesterType, semesterNumber };
};

module.exports = { getCurrentAcademicTerm };
