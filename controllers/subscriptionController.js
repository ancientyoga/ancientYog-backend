const pool = require('../config/db');

const getSubscriptionCount = async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM purchases');
    const count = parseInt(result.rows[0].count, 10);
    res.json({ count });
  } catch (error) {
    console.error('Error fetching subscription count:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getSubscriptionCount };
