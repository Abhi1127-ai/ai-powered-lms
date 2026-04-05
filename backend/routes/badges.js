// backend/routes/badges.js
const express = require('express');
const router = express.Router();
const { awardBadge, getMyBadges } = require('../controllers/badgesController');
const protect = require('../middleware/auth');

router.post('/award', protect, awardBadge);
router.get('/my', protect, getMyBadges);

module.exports = router;
