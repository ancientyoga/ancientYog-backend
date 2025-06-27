const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController');

router.get('/:videoId', likeController.getLikes);
router.post('/:videoId', likeController.reactToVideo);

module.exports = router;
