const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class ID is required']
  },
  title: {
    type: String,
    required: [true, 'Material title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    default: '',
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  fileName: {
    type: String,
    default: null
  },
  fileType: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number, // in bytes
    default: null
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader information is required']
  },
  type: {
    type: String,
    enum: ['lecture', 'notes', 'slides', 'video', 'document', 'resource', 'other'],
    default: 'document'
  },
  topic: {
    type: String,
    default: null
  },
  weekNumber: {
    type: Number,
    default: null,
    min: [1, 'Week number must be at least 1']
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
materialSchema.index({ classId: 1 });
materialSchema.index({ uploadedBy: 1 });
materialSchema.index({ type: 1 });
materialSchema.index({ title: 'text', description: 'text' });

// Static method to get materials by class
materialSchema.statics.getByClass = async function(classId, options = {}) {
  const query = { classId, isPublished: true };
  
  if (options.type) {
    query.type = options.type;
  }
  
  return this.find(query)
    .populate('uploadedBy', 'name email')
    .populate('classId', 'classname')
    .sort(options.sort || { order: 1, createdAt: -1 });
};

// Method to increment download count
materialSchema.methods.incrementDownload = async function() {
  this.downloadCount += 1;
  return this.save();
};

// Method to increment view count
materialSchema.methods.incrementView = async function() {
  this.viewCount += 1;
  return this.save();
};

module.exports = mongoose.model('Material', materialSchema);
