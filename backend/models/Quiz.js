const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  options: [{
    type: String,
    required: true
  }],
  answer: {
    type: String,
    required: [true, 'Correct answer is required']
  },
  points: {
    type: Number,
    default: 1,
    min: [0, 'Points cannot be negative']
  }
}, { _id: true });

const submissionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId
    },
    selectedAnswer: {
      type: String
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  marks: {
    type: Number,
    default: 0
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0
  }
}, { _id: true });

const quizSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class ID is required']
  },
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    default: '',
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  questions: {
    type: [questionSchema],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Quiz must have at least one question'
    }
  },
  submissions: [submissionSchema],
  timeLimit: {
    type: Number, // in minutes
    default: 30,
    min: [1, 'Time limit must be at least 1 minute']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  allowRetake: {
    type: Boolean,
    default: false
  },
  showResults: {
    type: Boolean,
    default: true
  },
  shuffleQuestions: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
quizSchema.index({ classId: 1 });
quizSchema.index({ 'submissions.studentId': 1 });
quizSchema.index({ isPublished: 1, startDate: 1 });

// Virtual for total questions
quizSchema.virtual('totalQuestions').get(function() {
  return this.questions ? this.questions.length : 0;
});

// Virtual for total possible points
quizSchema.virtual('totalPoints').get(function() {
  if (!this.questions) return 0;
  return this.questions.reduce((sum, q) => sum + (q.points || 1), 0);
});

// Virtual for submission count
quizSchema.virtual('submissionCount').get(function() {
  return this.submissions ? this.submissions.length : 0;
});

quizSchema.set('toJSON', { virtuals: true });
quizSchema.set('toObject', { virtuals: true });

// Method to check if student has submitted
quizSchema.methods.hasStudentSubmitted = function(studentId) {
  return this.submissions.some(sub => 
    sub.studentId.toString() === studentId.toString()
  );
};

// Method to get student submission
quizSchema.methods.getStudentSubmission = function(studentId) {
  return this.submissions.find(sub => 
    sub.studentId.toString() === studentId.toString()
  );
};

module.exports = mongoose.model('Quiz', quizSchema);
