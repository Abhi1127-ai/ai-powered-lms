const express = require('express');
const router = express.Router();
const { askDoubt, getSummary, getQuiz, gradeAnswer, getFlashcards } = require('../controllers/aiController');
const protect = require('../middleware/auth');

router.post('/doubt', protect, askDoubt);
router.post('/summary', protect, getSummary);
router.post('/generate-quiz', protect, getQuiz);
router.post('/grade-answer', protect, gradeAnswer);
router.post('/generate-flashcards', protect, getFlashcards);

router.post('/scan-image', protect, async (req, res) => {
    try {
        const { image, field } = req.body;
        if (!image) return res.status(400).json({ message: 'image is required' });
        const { scanImage } = require('../services/geminiService');
        const text = await scanImage(image, field || 'question');
        res.json({ text });
    } catch (err) {
        console.error('Scan image error:', err);
        res.status(500).json({ message: 'Failed to scan image' });
    }
});

module.exports = router;