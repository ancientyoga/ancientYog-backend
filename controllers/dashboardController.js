const pool = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    const [users, subscribers, revenue, courses, blogVideos, offers, admins] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM purchases'),
      pool.query('SELECT COALESCE(SUM(amount), 0) AS total FROM purchases'),
      pool.query('SELECT COUNT(*) FROM coursevideos'),
      pool.query('SELECT COUNT(*) FROM videos'),
      pool.query('SELECT COUNT(*) FROM pricing_plans'),
      pool.query('SELECT COUNT(*) FROM admins'),
    ]);

    res.json({
      totalUsers: parseInt(users.rows[0].count),
      totalSubscribers: parseInt(subscribers.rows[0].count),
      totalRevenue: parseFloat(revenue.rows[0].total),
      totalCourses: parseInt(courses.rows[0].count),
      totalBlogVideos: parseInt(blogVideos.rows[0].count),
      currentOffers: parseInt(offers.rows[0].count),
      totalAdmins: parseInt(admins.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};
