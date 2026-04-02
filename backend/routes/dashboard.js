const express = require('express');
const router = express.Router();
const {
  getProgress,
  updateProgress,
  getDailyGoals,
  getChapters,
  getLeaderboard,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/progress', protect, getProgress);
router.post('/update-progress', protect, updateProgress);
router.get('/daily-goals', protect, getDailyGoals);
router.get('/chapters/:subject', protect, getChapters);
router.get('/leaderboard', protect, getLeaderboard);

module.exports = router;
