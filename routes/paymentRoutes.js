const express = require("express");
const { createOrder, handlePaymentSuccess } = require("../controllers/paymentController");

const router = express.Router();

// Route for creating Razorpay order
router.post("/create-order", createOrder);

// Route for handling payment success verification
router.post("/verify-payment", handlePaymentSuccess);

module.exports = router;
