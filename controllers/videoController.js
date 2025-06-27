// ====================== backend/controllers/videoController.js ======================
const pool = require('../config/db');

// 📌 Fetch All Videos
exports.getVideos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, description, videofile, thumbnail, is_sample, is_fullcourse, youtube_link
      FROM videos ORDER BY id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ getVideos error:', err);
    res.status(500).json({ error: 'Error fetching videos' });
  }
};

// 📌 Fetch Video by ID
exports.getVideoById = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM videos WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Video not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ getVideoById error:', err);
    res.status(500).json({ error: 'Error fetching video' });
  }
};

// 📌 Create Video
exports.createVideo = async (req, res) => {
  try {
    const {
      title = '',
      description = '',
      youtube_link = '',
      is_sample = false,
      is_fullcourse = false
    } = req.body;

    const thumbnail = req.files?.thumbnail?.[0]?.filename || null;
    const videofile = req.files?.videoFile?.[0]?.filename || null; // 🔥 Ensure name is 'videoFile'

    if (!title || !videofile) {
      return res.status(400).json({ error: 'Title and video file are required' });
    }

    const result = await pool.query(
      `INSERT INTO videos (title, description, youtube_link, thumbnail, videofile, is_sample, is_fullcourse)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, youtube_link, thumbnail, videofile, is_sample, is_fullcourse]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ createVideo error:', err.message);
    res.status(500).json({ error: 'Error creating video' });
  }
};

// 📌 Update Video
exports.updateVideo = async (req, res) => {
  try {
    const {
      title = '',
      description = '',
      youtube_link = '',
      is_sample = false,
      is_fullcourse = false
    } = req.body;

    let thumbnail = req.files?.thumbnail?.[0]?.filename;
    let videofile = req.files?.videoFile?.[0]?.filename;

    const existing = await pool.query('SELECT * FROM videos WHERE id = $1', [req.params.id]);
    if (!existing.rows.length)
      return res.status(404).json({ error: 'Video not found' });

    if (!thumbnail) thumbnail = existing.rows[0].thumbnail;
    if (!videofile) videofile = existing.rows[0].videofile;

    const result = await pool.query(
      `UPDATE videos SET title=$1, description=$2, youtube_link=$3,
       thumbnail=$4, videofile=$5, is_sample=$6, is_fullcourse=$7 WHERE id=$8 RETURNING *`,
      [title, description, youtube_link, thumbnail, videofile, is_sample, is_fullcourse, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ updateVideo error:', err.message);
    res.status(500).json({ error: 'Error updating video' });
  }
};

// 📌 Delete Video
exports.deleteVideo = async (req, res) => {
  try {
    await pool.query('DELETE FROM videos WHERE id = $1', [req.params.id]);
    res.json({ message: 'Video deleted successfully' });
  } catch (err) {
    console.error('❌ deleteVideo error:', err);
    res.status(500).json({ error: 'Error deleting video' });
  }
};
