const { Marks } = require('../models');

const DEFAULT_PASS_PERCENTAGE = 50;

/**
 * Marks module – computation layer (aggregation).
 * GET /api/marks/stats uses this.
 */
const getMarksStats = async () => {
  const subjectPerformance = await Marks.aggregate([
    { $match: {} },
    {
      $group: {
        _id: '$classId',
        averageMarks: { $avg: '$percentage' },
        totalEntries: { $sum: 1 },
        passCount: { $sum: { $cond: [{ $gte: ['$percentage', DEFAULT_PASS_PERCENTAGE] }, 1, 0] } }
      }
    },
    {
      $lookup: {
        from: 'classes',
        localField: '_id',
        foreignField: '_id',
        as: 'classInfo'
      }
    },
    { $unwind: { path: '$classInfo', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        subjectId: '$_id',
        subjectName: '$classInfo.classname',
        averageMarks: { $round: ['$averageMarks', 1] },
        passPercentage: {
          $round: [
            {
              $multiply: [
                { $divide: ['$passCount', { $max: ['$totalEntries', 1] }] },
                100
              ]
            },
            1
          ]
        }
      }
    },
    { $sort: { averageMarks: -1 } },
    { $limit: 20 }
  ]);

  const overallResult = await Marks.aggregate([
    {
      $group: {
        _id: null,
        totalEntries: { $sum: 1 },
        passCount: { $sum: { $cond: [{ $gte: ['$percentage', DEFAULT_PASS_PERCENTAGE] }, 1, 0] } }
      }
    },
    {
      $project: {
        overallPassRate: {
          $round: [
            {
              $multiply: [
                { $divide: ['$passCount', { $max: ['$totalEntries', 1] }] },
                100
              ]
            },
            1
          ]
        }
      }
    }
  ]);

  const overallPassRate = overallResult[0]?.overallPassRate ?? 0;

  return {
    subjectPerformance: subjectPerformance.map((s) => ({
      subjectId: s.subjectId?.toString(),
      subjectName: s.subjectName || 'Unknown',
      averageMarks: s.averageMarks,
      passPercentage: s.passPercentage
    })),
    overallPassRate
  };
};

module.exports = { getMarksStats };
