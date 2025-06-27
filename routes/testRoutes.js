const express = require('express');
const router = express.Router();
const { sendEmail } = require('../utils/emailService');
const pool = require('../config/db');
router.get('/send-test-email', async (req, res) => {
  const sent = await sendEmail(
    'nandiarjun97@gmail.com', // change this to your own email to test
    'Test Email from Ancient Yoga',
    `<h1>Hello!</h1><p>This is a test email from your backend.</p>`
  );

  if (sent) {
    res.send('Test email sent successfully!');
  } else {
    res.status(500).send('Failed to send test email.');
  }
});

module.exports = router;
