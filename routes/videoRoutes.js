// ====================== backend/routes/videoRoutes.js ======================
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const videoController = require('../controllers/videoController');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/videos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

// Accept both thumbnail and videoFile (make sure field name matches frontend FormData)
const multiUpload = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'videoFile', maxCount: 1 }
]);

// Routes
router.get('/', videoController.getVideos);                     // GET all videos
router.get('/:id', videoController.getVideoById);               // GET video by ID
router.post('/', multiUpload, videoController.createVideo);     // POST: Create new video
router.put('/:id', multiUpload, videoController.updateVideo);   // PUT: Update video
router.delete('/:id', videoController.deleteVideo);             // DELETE: Remove video

module.exports = router;
