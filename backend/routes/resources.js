const express = require('express');
const router = express.Router();
const { getPYQs, getNotes, getVideos, seedResources } = require('../controllers/resourceController');
const { protect } = require('../middleware/auth');

router.get('/pyqs', protect, getPYQs);
router.get('/notes', protect, getNotes);
router.get('/videos', protect, getVideos);
router.post('/seed', seedResources);

module.exports = router;
