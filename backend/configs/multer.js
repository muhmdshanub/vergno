const multer = require('multer');
const cloudinary = require('./cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const mongoose = require('mongoose');

// Function to generate a unique filename using ObjectId
const generateUniqueFilename = () => {
  const objectId = new mongoose.Types.ObjectId();
  return objectId.toString();
};

// Create a new Cloudinary storage instance for profile photos
const profilePhotoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile-photos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    public_id: (req, file) => generateUniqueFilename(),
  },
});

// Create a new Cloudinary storage instance for query photos
const queryPhotoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'query-photos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    public_id: (req, file) => generateUniqueFilename(),
  },
});

// Create a new Cloudinary storage instance for perspective photos
const perspectivePhotoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'perspective-photos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    public_id: (req, file) => generateUniqueFilename(),
  },
});

// Configure multer for profile photos
const uploadProfilePhoto = multer({
  storage: profilePhotoStorage,
  limits: {
    fileSize: 1024 * 1024 * 2, // 2 MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'), false); // Reject the file
    }
  },
});

// Configure multer for query photos
const uploadQueryPhoto = multer({
  storage: queryPhotoStorage,
  limits: {
    fileSize: 1024 * 1024 * 2, // 2 MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'), false); // Reject the file
    }
  },
});

// Configure multer for perspective photos
const uploadPerspectivePhoto = multer({
  storage: perspectivePhotoStorage,
  limits: {
    fileSize: 1024 * 1024 * 20, // 20 MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'), false); // Reject the file
    }
  },
});

module.exports = {
  uploadProfilePhoto,
  uploadQueryPhoto,
  uploadPerspectivePhoto,
};
