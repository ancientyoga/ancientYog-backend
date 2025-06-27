// backend/controllers/totalOrderController.js
const pool = require('../config/db');

exports.getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, u.name, u.email, u.mobile, c.title AS course_name, p.amount, p.purchase_date
      FROM purchases p
      JOIN users u ON p.userid = u.id
      JOIN courses c ON p.courseid = c.id
      ORDER BY p.purchase_date DESC;
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM purchases WHERE id = $1`,
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { userid, courseid, amount } = req.body;
    const result = await pool.query(
      `INSERT INTO purchases (userid, courseid, amount) VALUES ($1, $2, $3) RETURNING *`,
      [userid, courseid, amount]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { userid, courseid, amount } = req.body;
    const result = await pool.query(
      `UPDATE purchases SET userid = $1, courseid = $2, amount = $3 WHERE id = $4 RETURNING *`,
      [userid, courseid, amount, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    await pool.query(`DELETE FROM purchases WHERE id = $1`, [req.params.id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};