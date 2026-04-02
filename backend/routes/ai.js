const express = require('express');
const router = express.Router();
const { askDoubt, getSummary, getQuiz, gradeAnswer } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/doubt', protect, askDoubt);
router.post('/summary', protect, getSummary);
router.post('/generate-quiz', protect, getQuiz);
router.post('/grade-answer', protect, gradeAnswer);

module.exports = router;
