const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
    },
    chapter: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['pyq', 'note', 'video'],
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      default: '',
    },
    year: {
      type: Number,
      default: null,
    },
    studentClass: {
      type: String,
      enum: ['10', '12'],
      required: true,
    },
    board: {
      type: String,
      default: 'CBSE',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);
