const pool = require('../config/db');

exports.getLikes = async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const user = req.query.user;

    const likes = await pool.query(
      'SELECT COUNT(*) FROM likes WHERE video_id = $1 AND is_dislike = false',
      [videoId]
    );
    const dislikes = await pool.query(
      'SELECT COUNT(*) FROM likes WHERE video_id = $1 AND is_dislike = true',
      [videoId]
    );
    const userReaction = await pool.query(
      'SELECT is_dislike FROM likes WHERE video_id = $1 AND user_name = $2',
      [videoId, user]
    );

    const userLiked = userReaction.rows[0]
      ? userReaction.rows[0].is_dislike ? 'dislike' : 'like'
      : null;

    res.json({
      likes: parseInt(likes.rows[0].count),
      dislikes: parseInt(dislikes.rows[0].count),
      userLiked,
    });
  } catch (err) {
    console.error('❌ getLikes error:', err.message);
    res.status(500).json({ error: 'Failed to get likes' });
  }
};

exports.reactToVideo = async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const { user_name, is_dislike } = req.body;

    await pool.query(
      'DELETE FROM likes WHERE video_id = $1 AND user_name = $2',
      [videoId, user_name]
    );

    await pool.query(
      'INSERT INTO likes (video_id, user_name, is_dislike) VALUES ($1, $2, $3)',
      [videoId, user_name, is_dislike]
    );

    res.json({ message: 'Reaction recorded' });
  } catch (err) {
    console.error('❌ reactToVideo error:', err.message);
    res.status(500).json({ error: 'Failed to record reaction' });
  }
};
