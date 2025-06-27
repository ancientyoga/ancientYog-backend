const Razorpay = require("razorpay");
const crypto = require("crypto");
const { sendEmail } = require("../utils/emailService");
const pool = require("../config/db");

// Initialize Razorpay with key and secret
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create an order in Razorpay
exports.createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const options = {
      amount: amount * 100,  // Amount is in paise
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "Could not create order" });
  }
};

// Handle payment success
exports.handlePaymentSuccess = async (req, res) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    userId,
    courseId,
    amount,
  } = req.body;

  console.log("Received payment details:", {
    userId,
    courseId,
    amount,
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
  });

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing Razorpay fields" });
  }

  if (!userId || !courseId || !amount) {
    return res.status(400).json({ error: "Missing userId, courseId, or amount" });
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Signature verification failed" });
    }

    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO purchases (userid, courseid, amount) VALUES ($1, $2, $3)`,
        [userId, courseId, amount]
      );

      const userResult = await client.query(
        `SELECT email FROM users WHERE id = $1`,
        [userId]
      );
      const userEmail = userResult.rows[0]?.email;

      const courseResult = await client.query(
        `SELECT googledrivelink FROM courses WHERE id = $1`,
        [courseId]
      );
      const courseDriveLink = courseResult.rows[0]?.googledrivelink;

      if (!userEmail || !courseDriveLink) {
        return res.status(400).json({ error: "Missing user or course data" });
      }

      const subject = "Your Ancient Yoga Course Access Link";
      const htmlContent = `
        <h2>Thank you for your purchase!</h2>
        <p>Access your course here:</p>
        <a href="${courseDriveLink}" target="_blank">${courseDriveLink}</a>
        <p>Enjoy your learning with Ancient Yoga.</p>
      `;

      await sendEmail(userEmail, subject, htmlContent);

      res.json({ success: true, message: "Payment verified and email sent" });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Payment success error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
