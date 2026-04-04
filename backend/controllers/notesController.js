// backend/controllers/notesController.js
const Note = require("../models/Note");
const { generateNotes, generatePYQs, generateVideoURL } = require("../services/geminiService");

// POST /api/notes/generate
// Body: { class: 10|12, subject: "Physics", unit: "Electric Charges..." }
exports.generateOrFetchNote = async (req, res) => {
    try {
        const { class: cls, subject, unit } = req.body;

        if (!cls || !subject || !unit) {
            return res.status(400).json({ message: "class, subject, and unit are required" });
        }

        // 1. Check cache in DB
        const existing = await Note.findOne({ class: cls, subject, unit });
        if (existing) {
            return res.json({ notes: existing.content, cached: true });
        }

        // 2. Generate via Gemini
        const content = await generateNotes(cls, subject, unit);

        // 3. Save to DB
        const note = await Note.create({ class: cls, subject, unit, content });

        res.json({ notes: note.content, cached: false });
    } catch (err) {
        console.error("Notes generation error:", err);
        res.status(500).json({ message: "Failed to generate notes. Please try again." });
    }
};

// GET /api/notes/check?class=12&subject=Physics&unit=Atoms
// Returns whether a cached note exists (to show "cached" badge)
exports.checkNoteExists = async (req, res) => {
    try {
        const { class: cls, subject, unit } = req.query;
        const exists = await Note.findOne({ class: cls, subject, unit }, "_id");
        res.json({ exists: !!exists });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// POST /api/notes/pyqs
// Body: { subject: "Physics", unit: "Electric Charges..." }
exports.generatePYQs = async (req, res) => {
    try {
        const { subject, unit } = req.body;
        if (!subject || !unit) {
            return res.status(400).json({ message: "subject and unit are required" });
        }
        const pyqs = await generatePYQs(subject, unit);
        res.json({ pyqs });
    } catch (err) {
        console.error("PYQ generation error:", err);
        res.status(500).json({ message: "Failed to generate PYQs. Please try again." });
    }
};

// POST /api/notes/video
// Body: { subject: "Physics", unit: "Electric Charges..." }
exports.generateVideoURL = async (req, res) => {
    try {
        const { subject, unit } = req.body;
        if (!subject || !unit) {
            return res.status(400).json({ message: "subject and unit are required" });
        }
        const url = await generateVideoURL(subject, unit);
        res.json({ url });
    } catch (err) {
        console.error("Video URL error:", err);
        res.status(500).json({ message: "Failed to get video. Please try again." });
    }
};
