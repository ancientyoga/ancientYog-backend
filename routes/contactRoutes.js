const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const verifyAdmin = require('../middleware/verifyAdmin'); // ✅ Corrected path

// GET contact info
router.get('/info', contactController.getContactInfo);

// POST user message
router.post('/message', contactController.sendContactMessage);

// PUT to update contact info (protected for admin)
router.put('/info', verifyAdmin, contactController.updateContactInfo);

module.exports = router;
