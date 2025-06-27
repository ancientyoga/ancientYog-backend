// File: routes/managevideoRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const managevideoController = require('../controllers/managevideoController');

// ✅ Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedOriginalName = file.originalname.replace(/\s+/g, '_').toLowerCase();
    const ext = path.extname(sanitizedOriginalName);
    const baseName = path.basename(sanitizedOriginalName, ext);
    cb(null, `${timestamp}-${baseName}${ext}`);
  }
});

const upload = multer({ storage });

// ✅ Upload handler for both thumbnail and video
const multiUpload = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'videos', maxCount: 1 }
]);

// ✅ Routes

// POST: Create a new video
router.post('/', multiUpload, managevideoController.createVideo);

// PUT: Update an existing video
router.put('/:id', multiUpload, managevideoController.updateVideo);

// DELETE: Delete a video
router.delete('/:id', managevideoController.deleteVideo);

// GET: Get videos by course (⚠️ should be before `/:id`)
router.get('/bycourse/:courseId', managevideoController.getVideosByCourse);

// GET: Get a single video by ID
router.get('/:id', managevideoController.getVideoById);

// GET: Get all videos with course/admin info
router.get('/', managevideoController.getVideos);

module.exports = router;
