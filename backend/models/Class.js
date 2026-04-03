const mongoose = require('mongoose');

const getDefaultAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  // Typical Indian academic year: starts around Jul/Aug.
  const startYear = now.getMonth() >= 6 ? year : year - 1;
  return `${startYear}\u2013${startYear + 1}`; // en dash
};

const classSchema = new mongoose.Schema({
  classname: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true,
    minlength: [2, 'Class name must be at least 2 characters'],
    maxlength: [100, 'Class name cannot exceed 100 characters']
  },
  description: {
    type: String,
    default: '',
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  schedule: {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: null
    },
    startTime: {
      type: String,
      default: null
    },
    endTime: {
      type: String,
      default: null
    }
  },
  // Legacy field (previously stored values like "Fall 2025").
  // Kept for backward compatibility; prefer using semesterType/semesterNumber.
  semester: {
    type: String,
    default: null
  },
  academicYear: {
    type: String,
    default: getDefaultAcademicYear
  },
  semesterType: {
    type: String,
    enum: ['Odd', 'Even', null],
    default: null
  },
  semesterNumber: {
    type: Number,
    min: 1,
    max: 8,
    default: null
  },
  // Snapshot attendance average for the class (0-100).
  // This project does not store per-day attendance records yet.
  attendanceAverage: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxStudents: {
    type: Number,
    default: 50
  },
  coverImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800'
  }
}, {
  timestamps: true
});

// Indexes
classSchema.index({ classname: 'text' });
classSchema.index({ teacher: 1 });
classSchema.index({ students: 1 });
classSchema.index({ head: 1 });
classSchema.index({ academicYear: 1, semesterType: 1, semesterNumber: 1, isActive: 1 });

// Virtual for student count
classSchema.virtual('studentCount').get(function() {
  return this.students ? this.students.length : 0;
});

// Ensure virtuals are included in JSON output
classSchema.set('toJSON', { virtuals: true });
classSchema.set('toObject', { virtuals: true });

// Pre-save middleware to ensure students array doesn't exceed maxStudents
classSchema.pre('save', function(next) {
  if (this.students && this.students.length > this.maxStudents) {
    const error = new Error(`Class cannot have more than ${this.maxStudents} students`);
    error.statusCode = 400;
    return next(error);
  }
  next();
});

module.exports = mongoose.model('Class', classSchema);
