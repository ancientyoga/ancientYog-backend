// ✅ backend/controllers/pricingController.js
const pool = require('../config/db');

// Get all pricing plans
exports.getAllPlans = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pricing_plans ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('❌ getAllPlans error:', err);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
};

// Create a new plan
exports.createPlan = async (req, res) => {
  try {
    const { name, description, price, badge, route } = req.body;
    const result = await pool.query(
      `INSERT INTO pricing_plans (name, description, price, badge, route)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description, price, badge, route]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ createPlan error:', err);
    res.status(500).json({ error: 'Failed to create plan' });
  }
};

// Update an existing plan
exports.updatePlan = async (req, res) => {
  try {
    const { name, description, price, badge, route } = req.body;
    const result = await pool.query(
      `UPDATE pricing_plans
       SET name = $1, description = $2, price = $3, badge = $4, route = $5
       WHERE id = $6 RETURNING *`,
      [name, description, price, badge, route, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ updatePlan error:', err);
    res.status(500).json({ error: 'Failed to update plan' });
  }
};

// Delete a plan
exports.deletePlan = async (req, res) => {
  try {
    await pool.query('DELETE FROM pricing_plans WHERE id = $1', [req.params.id]);
    res.json({ message: 'Plan deleted successfully' });
  } catch (err) {
    console.error('❌ deletePlan error:', err);
    res.status(500).json({ error: 'Failed to delete plan' });
  }
};