const pool = require('../config/db');

// ✅ Get all videos
exports.getVideos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.*, a.name AS teacher_name, a.profile_picture AS teacher_profile_picture
      FROM coursevideos v
      LEFT JOIN admins a ON v.admin_id = a.id
      ORDER BY v.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ getVideos error:', err.message);
    res.status(500).json({ error: 'Server error while fetching videos' });
  }
};

// ✅ Get single video by ID
exports.getVideoById = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.*, a.name AS teacher_name, a.profile_picture AS teacher_profile_picture
      FROM coursevideos v
      LEFT JOIN admins a ON v.admin_id = a.id
      WHERE v.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ getVideoById error:', err.message);
    res.status(500).json({ error: 'Server error while fetching video' });
  }
};

// ✅ Get videos by course (if needed)
exports.getVideosByCourse = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.*, a.name AS teacher_name, a.profile_picture AS teacher_profile_picture
      FROM coursevideos v
      LEFT JOIN admins a ON v.admin_id = a.id
      WHERE v.course_id = $1
      ORDER BY v.id DESC
    `, [req.params.courseId]);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ getVideosByCourse error:', err.message);
    res.status(500).json({ error: 'Server error while fetching course videos' });
  }
};

// ✅ Create new video
exports.createVideo = async (req, res) => {
  try {
    const { title = '', description = '', youtubelink = '', course_id = null, admin_id = null } = req.body;

    if (!title.trim() || !description.trim()) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const thumbnail = req.files?.thumbnail?.[0]?.filename || null;
    const videos = req.files?.videos?.[0]?.filename || null;

    const result = await pool.query(`
      INSERT INTO coursevideos (title, description, youtubelink, thumbnail, videos, course_id, admin_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [title, description, youtubelink, thumbnail, videos, course_id, admin_id]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ createVideo error:', err.message);
    res.status(500).json({ error: 'Server error while creating video' });
  }
};

// ✅ Update video
exports.updateVideo = async (req, res) => {
  try {
    const { title = '', description = '', youtubelink = '', course_id = null, admin_id = null } = req.body;
    const videoId = req.params.id;

    let thumbnail = req.files?.thumbnail?.[0]?.filename;
    let videos = req.files?.videos?.[0]?.filename;

    const existing = await pool.query(`SELECT thumbnail, videos FROM coursevideos WHERE id = $1`, [videoId]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (!thumbnail) thumbnail = existing.rows[0].thumbnail;
    if (!videos) videos = existing.rows[0].videos;

    const result = await pool.query(`
      UPDATE coursevideos SET
        title = $1,
        description = $2,
        youtubelink = $3,
        thumbnail = $4,
        videos = $5,
        course_id = $6,
        admin_id = $7
      WHERE id = $8
      RETURNING *
    `, [title, description, youtubelink, thumbnail, videos, course_id, admin_id, videoId]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ updateVideo error:', err.message);
    res.status(500).json({ error: 'Server error while updating video' });
  }
};

// ✅ Delete video
exports.deleteVideo = async (req, res) => {
  try {
    await pool.query(`DELETE FROM coursevideos WHERE id = $1`, [req.params.id]);
    res.json({ message: 'Video deleted successfully' });
  } catch (err) {
    console.error('❌ deleteVideo error:', err.message);
    res.status(500).json({ error: 'Server error while deleting video' });
  }
};
