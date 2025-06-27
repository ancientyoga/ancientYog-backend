const express = require('express');
const router = express.Router();
const manageInfoController = require('../controllers/manageInfoController');
const verifyAdmin = require('../middleware/verifyAdmin');

// 🔒 All routes require admin token (verified by middleware)

// GET all contact info
router.get('/', verifyAdmin, manageInfoController.getAllContactInfo);

// POST new contact info
router.post('/', verifyAdmin, manageInfoController.addContactInfo);

// PUT update contact info by ID
router.put('/:id', verifyAdmin, manageInfoController.updateContactInfo);

// DELETE contact info by ID
router.delete('/:id', verifyAdmin, manageInfoController.deleteContactInfo);

module.exports = router;
