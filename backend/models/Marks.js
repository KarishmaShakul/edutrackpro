const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class ID is required']
  },
  type: {
    type: String,
    enum: ['quiz', 'assignment', 'midterm', 'final', 'project', 'participation', 'other'],
    required: [true, 'Marks type is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  marks: {
    type: Number,
    required: [true, 'Marks value is required'],
    min: [0, 'Marks cannot be negative']
  },
  totalMarks: {
    type: Number,
    required: [true, 'Total marks is required'],
    min: [1, 'Total marks must be at least 1']
  },
  percentage: {
    type: Number,
    default: function() {
      return this.totalMarks > 0 ? (this.marks / this.totalMarks) * 100 : 0;
    }
  },
  grade: {
    type: String,
    default: null
  },
  feedback: {
    type: String,
    default: null,
    maxlength: [500, 'Feedback cannot exceed 500 characters']
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null // Reference to Quiz or Assignment if applicable
  },
  sourceType: {
    type: String,
    enum: ['Quiz', 'Assignment', 'Manual', null],
    default: 'Manual'
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gradedAt: {
    type: Date,
    default: Date.now
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for unique marks per student per assessment
marksSchema.index({ studentId: 1, classId: 1, type: 1, sourceId: 1 });
marksSchema.index({ classId: 1 });
marksSchema.index({ studentId: 1 });

// Pre-save middleware to calculate percentage and grade
marksSchema.pre('save', function(next) {
  // Calculate percentage
  this.percentage = this.totalMarks > 0 
    ? parseFloat(((this.marks / this.totalMarks) * 100).toFixed(2))
    : 0;
  
  // Calculate grade based on percentage
  if (this.percentage >= 90) this.grade = 'A+';
  else if (this.percentage >= 85) this.grade = 'A';
  else if (this.percentage >= 80) this.grade = 'A-';
  else if (this.percentage >= 75) this.grade = 'B+';
  else if (this.percentage >= 70) this.grade = 'B';
  else if (this.percentage >= 65) this.grade = 'B-';
  else if (this.percentage >= 60) this.grade = 'C+';
  else if (this.percentage >= 55) this.grade = 'C';
  else if (this.percentage >= 50) this.grade = 'C-';
  else if (this.percentage >= 45) this.grade = 'D';
  else this.grade = 'F';
  
  next();
});

// Static method to get student marks summary
marksSchema.statics.getStudentSummary = async function(studentId, classId = null) {
  const match = { studentId: new mongoose.Types.ObjectId(studentId) };
  if (classId) {
    match.classId = new mongoose.Types.ObjectId(classId);
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$classId',
        totalMarks: { $sum: '$marks' },
        totalPossible: { $sum: '$totalMarks' },
        averagePercentage: { $avg: '$percentage' },
        count: { $sum: 1 }
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
    { $unwind: '$classInfo' },
    {
      $project: {
        classId: '$_id',
        classname: '$classInfo.classname',
        totalMarks: 1,
        totalPossible: 1,
        averagePercentage: { $round: ['$averagePercentage', 2] },
        count: 1,
        overallPercentage: {
          $round: [{ $multiply: [{ $divide: ['$totalMarks', '$totalPossible'] }, 100] }, 2]
        }
      }
    }
  ]);
};

// Static method to get class marks summary
marksSchema.statics.getClassSummary = async function(classId) {
  return this.aggregate([
    { $match: { classId: new mongoose.Types.ObjectId(classId) } },
    {
      $group: {
        _id: null,
        averageMarks: { $avg: '$marks' },
        averagePercentage: { $avg: '$percentage' },
        highestMarks: { $max: '$marks' },
        lowestMarks: { $min: '$marks' },
        totalEntries: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('Marks', marksSchema);
