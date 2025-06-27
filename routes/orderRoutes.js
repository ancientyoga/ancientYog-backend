const express = require('express');
const router = express.Router();
const { createOrder } = require('../controllers/orderController');

// Route to create a new order
router.post('/orders', createOrder);

module.exports = router;
