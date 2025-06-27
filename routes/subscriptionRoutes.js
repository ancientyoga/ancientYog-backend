const express = require('express');
const router = express.Router();
const { getSubscriptionCount } = require('../controllers/subscriptionController');

// Match the frontend route
router.get('/subcount', getSubscriptionCount);

module.exports = router;
