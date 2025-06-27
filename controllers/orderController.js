const db = require('../config/db'); // Ensure this points to your database configuration

exports.createOrder = async (req, res) => {
  try {
    const {
      user_name,
      user_email,
      user_contact,
      course_title,
      course_description,
      payment_id,
      amount_paid,
    } = req.body;

    const result = await db.query(
      `INSERT INTO orders (
        user_name, user_email, user_contact,
        course_title, course_description,
        payment_id, amount_paid
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        user_name,
        user_email,
        user_contact,
        course_title,
        course_description,
        payment_id,
        amount_paid,
      ]
    );

    res.status(201).json({
      message: 'Order saved successfully',
      order: result.rows[0],
    });
  } catch (error) {
    console.error('❌ Error inserting order:', error);
    res.status(500).json({ error: 'Failed to save order' });
  }
};
