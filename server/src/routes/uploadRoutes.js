const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup multer storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter to allow images and videos
const fileFilter = (req, file, cb) => {
  const allowedImageExtensions = new Set(['.jpeg', '.jpg', '.png', '.gif', '.webp']);
  const allowedImageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
  const allowedVideoExtensions = new Set(['.mp4', '.mov', '.avi', '.mkv']);
  const allowedVideoMimeTypes = new Set(['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska']);

  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  const isImage = allowedImageExtensions.has(extname) && allowedImageMimeTypes.has(mimetype);
  const isVideo = allowedVideoExtensions.has(extname) && allowedVideoMimeTypes.has(mimetype);

  if (isImage || isVideo) {
    return cb(null, true);
  }
  cb(new Error('Only image and video files are allowed!'), false);
};

// Initialize multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB (enough for most videos in dev)
  },
});

// @desc    Upload a file
// @route   POST /api/upload
// @access  Public (or protected if you want)
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  // Build the public URL to access the file
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  res.status(200).json({
    success: true,
    message: 'File uploaded successfully',
    url: fileUrl,
  });
});

module.exports = router;
