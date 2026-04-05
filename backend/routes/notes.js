// backend/routes/notes.js  — REPLACE your entire file with this
const express = require("express");
const router = express.Router();
const notesController = require("../controllers/notesController");
const protect = require("../middleware/auth");

router.post("/generate", protect, notesController.generateOrFetchNote);
router.get("/check", protect, notesController.checkNoteExists);
router.post("/pyqs", protect, notesController.generatePYQs);
router.post("/video", protect, notesController.generateVideoURL);
router.post('/mock-test', protect, notesController.generateMockTest);

module.exports = router;