// 📁 backend/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const adminController = require('../controllers/adminController');

// ✅ Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'admins');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

// ✅ File filter – allow only image files
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const isValidExt = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const isValidMime = allowedTypes.test(file.mimetype);
    if (isValidExt && isValidMime) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
    }
  }
});

// ✅ Admin Routes
router.get('/', adminController.getAdmins); // 🔍 Get all admins
router.post('/', upload.single('profile_picture'), adminController.addAdmin); // ➕ Add admin
router.put('/:id', upload.single('profile_picture'), adminController.updateAdmin); // ✏️ Update admin
router.delete('/:id', adminController.deleteAdmin); // ❌ Delete admin
router.post('/login', adminController.loginAdmin); // 🔐 Login admin

module.exports = router;
