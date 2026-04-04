// backend/models/Note.js
const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
    {
        class: {
            type: Number,
            required: true,
            enum: [10, 12],
        },
        subject: {
            type: String,
            required: true,
            enum: ["Physics", "Chemistry", "Biology", "Mathematics", "English"],
        },
        unit: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

// Compound index so lookups are fast and duplicates are prevented
noteSchema.index({ class: 1, subject: 1, unit: 1 }, { unique: true });

module.exports = mongoose.model("Note", noteSchema);
