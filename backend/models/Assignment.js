const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileUrl: {
    type: String,
    required: [true, 'Submission file URL is required']
  },
  fileName: {
    type: String,
    default: 'submission'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  marks: {
    type: Number,
    default: null,
    min: [0, 'Marks cannot be negative']
  },
  maxMarks: {
    type: Number,
    default: 100
  },
  feedback: {
    type: String,
    default: null,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'graded', 'late', 'resubmitted'],
    default: 'pending'
  },
  isLate: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const assignmentSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class ID is required']
  },
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  fileUrl: {
    type: String,
    default: null
  },
  fileName: {
    type: String,
    default: null
  },
  submissions: [submissionSchema],
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  totalMarks: {
    type: Number,
    default: 100,
    min: [1, 'Total marks must be at least 1']
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  allowLateSubmission: {
    type: Boolean,
    default: true
  },
  lateSubmissionPenalty: {
    type: Number, // percentage deduction
    default: 10,
    min: [0, 'Penalty cannot be negative'],
    max: [100, 'Penalty cannot exceed 100%']
  },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
assignmentSchema.index({ classId: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ 'submissions.studentId': 1 });

// Virtual for submission count
assignmentSchema.virtual('submissionCount').get(function() {
  return this.submissions ? this.submissions.length : 0;
});

// Virtual for graded count
assignmentSchema.virtual('gradedCount').get(function() {
  if (!this.submissions) return 0;
  return this.submissions.filter(s => s.status === 'graded').length;
});

// Virtual for pending count
assignmentSchema.virtual('pendingCount').get(function() {
  if (!this.submissions) return 0;
  return this.submissions.filter(s => s.status === 'pending').length;
});

// Check if assignment is overdue
assignmentSchema.virtual('isOverdue').get(function() {
  return new Date() > this.dueDate;
});

assignmentSchema.set('toJSON', { virtuals: true });
assignmentSchema.set('toObject', { virtuals: true });

// Method to check if student has submitted
assignmentSchema.methods.hasStudentSubmitted = function(studentId) {
  return this.submissions.some(sub => 
    sub.studentId.toString() === studentId.toString()
  );
};

// Method to get student submission
assignmentSchema.methods.getStudentSubmission = function(studentId) {
  return this.submissions.find(sub => 
    sub.studentId.toString() === studentId.toString()
  );
};

module.exports = mongoose.model('Assignment', assignmentSchema);
