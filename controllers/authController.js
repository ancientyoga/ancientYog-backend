const pool = require('../config/db');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

// REGISTER CONTROLLER
const register = async (req, res) => {
  const { name, email, mobile, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log("Validation failed:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const existingMobile = await pool.query("SELECT * FROM users WHERE mobile = $1", [mobile]);
    if (existingMobile.rows.length > 0) {
      return res.status(400).json({ error: "Mobile number already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (name, email, mobile, passwordhash, isverified, createdat, isblocked)
       VALUES ($1, $2, $3, $4, true, NOW(), false)`,
      [name, email, mobile, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register Error:", err.message || err);
    res.status(500).json({ error: "Registration failed", details: err.message });
  }
  console.log('Register request received with data:', req.body);
};

// LOGIN CONTROLLER
const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", req.body);

  try {
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = userResult.rows[0];

    if (user.isblocked) {
      return res.status(403).json({ error: "Your account is blocked. Contact admin." });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.passwordhash);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "myyogasecret",
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        isVerified: user.isverified,
      },
    });
  } catch (err) {
    console.error("Login Error:", err.message || err);
    res.status(500).json({ error: "Server error during login" });
  }
};

module.exports = { register, login };
