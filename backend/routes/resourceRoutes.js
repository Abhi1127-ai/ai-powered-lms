const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Resource = require('../models/Resource');
const { getPYQs, getNotes, getVideos, seedResources } = require('../controllers/resourceController');


// 📁 Ensure upload folder exists
const uploadDir = path.join(__dirname, '../uploads/pyqs');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Only PDF files allowed'), false);
    }
});

router.get('/', async (req, res) => {
    try {
        const resources = await Resource.find().sort({ createdAt: -1 });
        res.json({ resources });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/pyqs', getPYQs);
router.get('/notes', getNotes);
router.get('/videos', getVideos);


router.post('/seed', seedResources);

router.post('/upload-pyq', upload.single('pdf'), async (req, res) => {
    try {
        const { title, subject, year, studentClass, board } = req.body;

        // ✅ Validation
        if (!title || !subject || !year || !studentClass) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'PDF file is required' });
        }

        const newPaper = new Resource({
            title,
            subject: subject.trim(),
            year: Number(year),
            studentClass,
            board: board || 'CBSE',
            type: 'pyq',
            paperType: 'full',
            fileUrl: `/uploads/pyqs/${req.file.filename}`
        });

        await newPaper.save();

        res.status(201).json({
            message: 'PYQ uploaded successfully',
            paper: newPaper
        });

    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;