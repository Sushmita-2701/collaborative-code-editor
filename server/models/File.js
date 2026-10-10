const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  path: {
    type: String,
    required: [true, 'Path is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['file', 'folder'],
    default: 'file',
    required: true
  },
  content: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Ensure uniqueness of path per project
fileSchema.index({ project: 1, path: 1 }, { unique: true });

module.exports = mongoose.model('File', fileSchema);
