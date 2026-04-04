const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  type: { type: String, enum: ['pyq', 'note', 'video'], required: true },
  year: { type: Number },
  studentClass: { type: String, enum: ['10', '12'], required: true },
  board: { type: String },

  // 🔥 important
  fileUrl: { type: String }, 
  paperType: { type: String, enum: ['full', 'chapter-wise'], default: 'full' }

}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);