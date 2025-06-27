const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// ✅ Get all users
router.get('/', userController.getUsers);

// ✅ Add a new user
router.post('/', userController.addUser);

// ✅ Update user with optional password (used by admin)
router.put('/:userId', userController.updateUserWithPassword);

// ✅ Update basic user info only
router.put('/basic/:userId', userController.updateUser);

// ✅ Block a user
router.put('/block/:userId', userController.blockUser);

// ✅ Unblock a user
router.put('/unblock/:userId', userController.unblockUser);

// ✅ Delete a user
router.delete('/:userId', userController.deleteUser);

// ❌ This line was invalid and has been REMOVED:
// router.put('/:userId', updateUser); // This is undefined

module.exports = router;
