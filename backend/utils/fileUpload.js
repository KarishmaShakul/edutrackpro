const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    './uploads',
    './uploads/materials',
    './uploads/assignments',
    './uploads/submissions',
    './uploads/profiles'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// File filter for allowed types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed',
    'video/mp4',
    'video/webm',
    'audio/mpeg',
    'audio/wav'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// Generate unique filename
const generateFilename = (file) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const ext = path.extname(file.originalname);
  return `${uniqueSuffix}${ext}`;
};

// Storage configuration for materials
const materialStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/materials');
  },
  filename: (req, file, cb) => {
    cb(null, generateFilename(file));
  }
});

// Storage configuration for assignments
const assignmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/assignments');
  },
  filename: (req, file, cb) => {
    cb(null, generateFilename(file));
  }
});

// Storage configuration for submissions
const submissionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/submissions');
  },
  filename: (req, file, cb) => {
    cb(null, generateFilename(file));
  }
});

// Storage configuration for profile images
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/profiles');
  },
  filename: (req, file, cb) => {
    cb(null, generateFilename(file));
  }
});

// Image filter
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'), false);
  }
};

// Upload configurations
const uploadMaterial = multer({
  storage: materialStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

const uploadAssignment = multer({
  storage: assignmentStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

const uploadSubmission = multer({
  storage: submissionStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

const uploadProfile = multer({
  storage: profileStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Delete file utility
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      return resolve(false);
    }

    // Remove leading slash if present
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    
    fs.unlink(cleanPath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

// Get file URL
const getFileUrl = (filename, type = 'materials') => {
  return `/uploads/${type}/${filename}`;
};

module.exports = {
  uploadMaterial,
  uploadAssignment,
  uploadSubmission,
  uploadProfile,
  deleteFile,
  getFileUrl,
  createUploadDirs
};
