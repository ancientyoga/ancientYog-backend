const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  addAdmin,
  getAdmins,
  updateAdmin,
  deleteAdmin
} = require('../controllers/manageadminController');

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post('/', upload.single('photo'), addAdmin);
router.get('/', getAdmins);
router.put('/:id', upload.single('photo'), updateAdmin); // ✅ important!
router.delete('/:id', deleteAdmin);

module.exports = router;
