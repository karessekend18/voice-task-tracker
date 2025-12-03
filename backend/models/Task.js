// backend/models/Task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },

  // explicit status for Kanban board
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'done'],
    default: 'todo',
  },

  // explicit priority for badges/filters
  priority: {
    type: String,
    enum: ['urgent', 'high', 'medium', 'low'],
    default: 'medium',
  },

  // optional completed flag (not really used by your UI but safe to keep)
  completed: { type: Boolean, default: false },

  dueDate: { type: Date },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  // voice note file path (relative to backend/uploads)
  voiceNote: { type: String, default: null },

  // optional transcription string (if you use speech-to-text client-side or server-side)
  transcription: { type: String, default: null },
});

module.exports = mongoose.model('Task', TaskSchema);
