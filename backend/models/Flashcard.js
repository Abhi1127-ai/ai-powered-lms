const mongoose = require('mongoose');

const FlashcardSetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  cards: [{
    front: { type: String, required: true },
    back: { type: String, required: true },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('FlashcardSet', FlashcardSetSchema);
