const pool = require('../config/db');
const nodemailer = require('nodemailer');
require('dotenv').config(); // should also be in your main entry point (e.g., index.js/app.js)

// ✅ 1. Get Contact Info (for frontend display)
const getContactInfo = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM contact_info LIMIT 1');
    res.json(rows[0]);
  } catch (err) {
    console.error('❌ getContactInfo Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch contact info' });
  }
};

// ✅ 2. Update Contact Info (for admin panel)
const updateContactInfo = async (req, res) => {
  const {
    name,
    address_line1,
    address_line2,
    city,
    state,
    country,
    pincode,
    phone,
    email,
    facebook_url,
    youtube_url,
    instagram_url
  } = req.body;

  try {
    await pool.query(
      `UPDATE contact_info
       SET name = $1,
           address_line1 = $2,
           address_line2 = $3,
           city = $4,
           state = $5,
           country = $6,
           pincode = $7,
           phone = $8,
           email = $9,
           facebook_url = $10,
           youtube_url = $11,
           instagram_url = $12
       WHERE id = 1`,
      [
        name,
        address_line1,
        address_line2,
        city,
        state,
        country,
        pincode,
        phone,
        email,
        facebook_url,
        youtube_url,
        instagram_url
      ]
    );
    res.json({ success: true, message: 'Contact info updated successfully' });
  } catch (err) {
    console.error('❌ updateContactInfo Error:', err.message);
    res.status(500).json({ error: 'Failed to update contact info' });
  }
};

// ✅ 3. Receive and Process Contact Message
const sendContactMessage = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  try {
    // Save message to database
    await pool.query(
      `INSERT INTO contact_messages (name, email, subject, message)
       VALUES ($1, $2, $3, $4)`,
      [name, email, subject, message]
    );

    // Create transporter using Gmail + app password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS
      }
    });

    // Send thank-you email to user
    await transporter.sendMail({
      from: `"Ancient Yoga" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Thank you for contacting Ancient Yoga',
      html: `
        <p>Dear ${name},</p>
        <p>Thank you for contacting Ancient Yoga. We have received your message:</p>
        <blockquote>${message}</blockquote>
        <p>We will respond shortly.</p>
        <p>Regards,<br/>Ancient Yoga Team</p>
      `
    });

    // Send notification to admin
    await transporter.sendMail({
      from: `"Ancient Yoga" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_FROM,
      subject: '📥 New Contact Message Received',
      html: `
        <h3>New Contact Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `
    });

    res.json({ success: true, message: 'Message sent and saved successfully.' });
  } catch (err) {
    console.error('❌ sendContactMessage Error:', err.message);
    res.status(500).json({ error: 'Server error: Failed to send message' });
  }
};

module.exports = {
  getContactInfo,
  updateContactInfo,
  sendContactMessage
};
