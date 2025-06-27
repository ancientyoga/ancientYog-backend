const pool = require('../config/db');
const sendEmail = require('../utils/mailer');
const jwt = require('jsonwebtoken');

// 📌 Get All Admins
exports.getAdmins = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, profile_picture FROM admins ORDER BY id DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Get Admins Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 📌 Add Admin (no bcrypt, plain password)
exports.addAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const profile_picture = req.file ? `/uploads/admins/${req.file.filename}` : null;

    const existing = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Admin with this email already exists' });
    }

    const result = await pool.query(
      'INSERT INTO admins (name, email, password, role, profile_picture) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, password, role || 'admin', profile_picture]
    );

    const newAdmin = result.rows[0];

    const subject = 'You are now an Admin at Nandi Softech Solutions!';
    const html = `
      <p>Dear ${newAdmin.name},</p>
      <p>You have been added as an <strong>Admin</strong> at Nandi Softech Solutions.</p>
      <p><strong>Email:</strong> ${newAdmin.email}</p>
      <p><strong>Password:</strong> ${password}</p>
    `;

    await sendEmail(newAdmin.email, subject, '', html);

    res.status(201).json({
      id: newAdmin.id,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      profile_picture: newAdmin.profile_picture,
    });
  } catch (err) {
    console.error("❌ Add Admin Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 📌 Update Admin
exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, profile_picture: existingProfilePicture } = req.body;
    const newProfilePicture = req.file
      ? `/uploads/admins/${req.file.filename}`
      : existingProfilePicture;

    const result = await pool.query(
      `UPDATE admins
       SET name = $1, email = $2, password = $3, role = $4, profile_picture = $5, updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [name, email, password, role, newProfilePicture, id]
    );

    const updatedAdmin = result.rows[0];
    res.json({
      id: updatedAdmin.id,
      name: updatedAdmin.name,
      email: updatedAdmin.email,
      role: updatedAdmin.role,
      profile_picture: updatedAdmin.profile_picture,
    });
  } catch (err) {
    console.error("❌ Update Admin Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 📌 Delete Admin
exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM admins WHERE id=$1', [id]);
    res.json({ message: 'Admin deleted successfully' });
  } catch (err) {
    console.error("❌ Delete Admin Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 📌 Login Admin (Plain Password Check)
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    const result = await pool.query('SELECT * FROM admins WHERE email = $1', [cleanEmail]);
    const admin = result.rows[0];

    if (!admin) {
      return res.status(401).json({ message: 'Email not found' });
    }

    if (admin.password !== cleanPassword) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET || 'secret-key',
      { expiresIn: '3d' }
    );

    res.status(200).json({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      profile_picture: admin.profile_picture,
      message: 'Login successful',
      token,
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ error: 'Server error during login' });
  }
};
