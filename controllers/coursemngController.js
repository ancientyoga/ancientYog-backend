const pool = require('../config/db'); // your PostgreSQL pool setup

exports.getAllCourses = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY createdat DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCourse = async (req, res) => {
  const { title, description, price, duration, offer, googledrivelink } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });

  try {
    const result = await pool.query(
      `INSERT INTO courses(title, description, price, duration, offer, googledrivelink) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [title, description, price, duration, offer, googledrivelink]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCourse = async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, description, price, duration, offer, googledrivelink } = req.body;

  try {
    const result = await pool.query(
      `UPDATE courses SET title=$1, description=$2, price=$3, duration=$4, offer=$5, googledrivelink=$6 WHERE id=$7 RETURNING *`,
      [title, description, price, duration, offer, googledrivelink, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "Course not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCourse = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query('DELETE FROM courses WHERE id=$1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "Course not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
