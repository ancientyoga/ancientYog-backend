require('dotenv').config();

const pool = require('../config/db');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Razorpay instance
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Convert slug to title
function slugToTitle(slug) {
  if (!slug) return '';
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ✅ Get all courses
const getCourses = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY createdat DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Get courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

// ✅ Get course by ID
const getCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Get course by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
};

// ✅ Check if user is enrolled using purchases table
const checkEnrollment = async (req, res) => {
  const courseId = req.params.id;
  const userEmail = req.query.userEmail;

  if (!userEmail) {
    return res.status(400).json({ error: 'User email is required' });
  }

  try {
    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);
    if (userRes.rows.length === 0) {
      return res.json({ enrolled: false });
    }

    const userId = userRes.rows[0].id;

    const result = await pool.query(
      'SELECT * FROM purchases WHERE courseid = $1 AND userid = $2',
      [courseId, userId]
    );

    res.json({ enrolled: result.rows.length > 0 });
  } catch (error) {
    console.error('❌ Check enrollment error:', error);
    res.status(500).json({ error: 'Failed to check enrollment' });
  }
};

// ✅ Payment: Create Razorpay order
const initPayment = async (req, res) => {
  try {
    const { courseId, username, email } = req.body;

    const courseRes = await pool.query('SELECT * FROM courses WHERE id = $1', [courseId]);
    if (courseRes.rows.length === 0) return res.status(404).json({ error: 'Course not found' });

    const course = courseRes.rows[0];

    const order = await instance.orders.create({
      amount: course.price * 100,
      currency: 'INR',
      receipt: `receipt_course_${courseId}_${Date.now()}`,
      payment_capture: 1,
    });

    res.json({ orderId: order.id, amount: order.amount, course });
  } catch (err) {
    console.error('❌ Error in initPayment:', err.message);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
};

// ✅ Verify payment & store in purchases
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      courseId,
      email,
      amount,
    } = req.body;

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).send('Invalid Signature');
    }

    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const userId = userRes.rows[0].id;

    await pool.query(
      `INSERT INTO purchases (userid, courseid, amount) VALUES ($1, $2, $3)`,
      [userId, courseId, amount]
    );

    const courseRes = await pool.query('SELECT title FROM courses WHERE id = $1', [courseId]);
    const courseTitle = courseRes.rows[0]?.title || 'Course';

    // Send confirmation email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `Purchase Successful: ${courseTitle}`,
      text: `Hi,\n\nYou have successfully purchased the course "${courseTitle}".\n\nThank you!\n- Nandi Softech Solutions`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error in verifyPayment:', err.message);
    res.status(500).json({ error: 'Payment verification failed' });
  }
};

// ✅ Add course
const addCourse = async (req, res) => {
  try {
    const { title, description, price, offer, duration, googledrivelink } = req.body;

    const result = await pool.query(
      `INSERT INTO courses (title, description, price, offer, duration, googledrivelink)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description, price, offer, duration, googledrivelink]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error adding course:', err.message);
    res.status(500).json({ error: 'Failed to add course' });
  }
};

// ✅ Update course
const updateCourse = async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description, price, offer, duration, googledrivelink } = req.body;

    const result = await pool.query(
      `UPDATE courses SET
         title = $1,
         description = $2,
         price = $3,
         offer = $4,
         duration = $5,
         googledrivelink = $6
       WHERE id = $7
       RETURNING *`,
      [title, description, price, offer, duration, googledrivelink, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error updating course:', err.message);
    res.status(500).json({ error: 'Failed to update course' });
  }
};

// ✅ Delete course
const deleteCourse = async (req, res) => {
  try {
    const id = req.params.id;

    const check = await pool.query('SELECT * FROM courses WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    await pool.query('DELETE FROM courses WHERE id = $1', [id]);
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting course:', err.message);
    res.status(500).json({ error: 'Failed to delete course' });
  }
};

// ✅ Get course by slug
const getCourseBySlug = async (req, res) => {
  const slug = req.params.slug;
  const title = slugToTitle(slug);

  try {
    const result = await pool.query('SELECT * FROM courses WHERE title = $1', [title]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error fetching course by slug:', err.message);
    res.status(500).json({ message: 'Server error while fetching course' });
  }
};

// ✅ Export all
module.exports = {
  getCourses,
  getCourseById,
  checkEnrollment,
  initPayment,
  verifyPayment,
  addCourse,
  updateCourse,
  deleteCourse,
  getCourseBySlug,
};
