const pool = require("../config/db");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
require("dotenv").config();

// ==================== Get All Users ====================
const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, mobile, isverified, isblocked, createdat FROM users ORDER BY id DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching users:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ==================== Add New User ====================
const addUser = async (req, res) => {
  try {
    const { name, email, mobile, passwordhash } = req.body;

    const check = await pool.query('SELECT * FROM users WHERE email = $1 OR mobile = $2', [email, mobile]);
    if (check.rows.length > 0) {
      return res.status(400).json({ error: 'Email or mobile already exists' });
    }

    const result = await pool.query(
      `INSERT INTO users (name, email, mobile, passwordhash)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, email, mobile, passwordhash]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error adding user:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ==================== Update User (basic info) ====================
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, mobile, password } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET name = $1, email = $2, mobile = $3, passwordhash = $4 
       WHERE id = $5 
       RETURNING id, name, email, mobile, isverified, isblocked`,
      [name, email, mobile, password, userId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Update User Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ==================== Update User With Optional Password ====================
const updateUserWithPassword = async (req, res) => {
  const userId = req.params.userId;
  const { name, email, mobile, password } = req.body;

  try {
    let query;
    let values;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = `UPDATE users SET name = $1, email = $2, mobile = $3, passwordhash = $4, updatedat = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *`;
      values = [name, email, mobile, hashedPassword, userId];
    } else {
      query = `UPDATE users SET name = $1, email = $2, mobile = $3, updatedat = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *`;
      values = [name, email, mobile, userId];
    }

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (password) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_FROM,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: `"Admin Team" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'Your Account Has Been Updated',
        html: `<p>Hello <strong>${name}</strong>,</p>
               <p>Your account has been updated.</p>
               <p><strong>New Password:</strong> ${password}</p>`,
      };

      await transporter.sendMail(mailOptions);
      console.log("✅ Email sent to:", email);
    }

    res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    console.error("❌ Update error:", err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ==================== Delete User ====================
const deleteUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting user:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ==================== Block User ====================
const blockUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    await pool.query('UPDATE users SET isblocked = true WHERE id = $1', [userId]);
    res.status(200).json({ message: 'User blocked' });
  } catch (error) {
    console.error('❌ Error blocking user:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ==================== Unblock User ====================
const unblockUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    await pool.query('UPDATE users SET isblocked = false WHERE id = $1', [userId]);
    res.status(200).json({ message: 'User unblocked' });
  } catch (error) {
    console.error('❌ Error unblocking user:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ==================== Export All ====================
module.exports = {
  getUsers,
  addUser,
  updateUser,
  updateUserWithPassword,
  deleteUser,
  blockUser,
  unblockUser,
};
