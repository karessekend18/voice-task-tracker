// backend/controllers/tasksController.js
const Task = require('../models/Task');
const path = require('path');
const fs = require('fs');

const ALLOWED_STATUS = ['todo', 'in-progress', 'done'];
const ALLOWED_PRIORITY = ['urgent', 'high', 'medium', 'low'];

function validateTaskPayload(body, isUpdate = false) {
  const errors = {};

  if (!isUpdate) {
    if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
      errors.title = 'Title is required';
    }
  }

  if (body.status && !ALLOWED_STATUS.includes(body.status)) {
    errors.status = `Status must be one of: ${ALLOWED_STATUS.join(', ')}`;
  }

  if (body.priority && !ALLOWED_PRIORITY.includes(body.priority)) {
    errors.priority = `Priority must be one of: ${ALLOWED_PRIORITY.join(', ')}`;
  }

  if (body.dueDate) {
    const d = new Date(body.dueDate);
    if (Number.isNaN(d.getTime())) {
      errors.dueDate = 'dueDate must be a valid date';
    }
  }

  return errors;
}

exports.listTasks = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.max(parseInt(req.query.limit || '20', 10), 1);
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      Task.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Task.countDocuments(),
    ]);

    res.json({ data: tasks, meta: { total, page, limit } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getTask = async (req, res) => {
  try {
    const t = await Task.findById(req.params.id);
    if (!t) return res.status(404).json({ error: 'Task not found' });
    res.json(t);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, transcription } = req.body;

    const errors = validateTaskPayload(req.body, false);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'ValidationError', details: errors });
    }

    const taskData = {
      title: title.trim(),
      description: description || '',
      status: status || 'todo',
      priority: priority || 'medium',
      transcription: transcription || null,
    };

    if (dueDate) {
      taskData.dueDate = new Date(dueDate);
    }

    const t = new Task(taskData);
    await t.save();

    res.status(201).json(t);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid request', details: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const updates = { ...req.body };

    const errors = validateTaskPayload(updates, true);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'ValidationError', details: errors });
    }

    if (updates.title && typeof updates.title === 'string') {
      updates.title = updates.title.trim();
    }

    if (updates.dueDate) {
      updates.dueDate = new Date(updates.dueDate);
    }

    updates.updatedAt = new Date();

    const t = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!t) return res.status(404).json({ error: 'Task not found' });

    res.json(t);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Invalid request', details: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const t = await Task.findByIdAndDelete(req.params.id);
    if (!t) return res.status(404).json({ error: 'Task not found' });

    // also remove voice file if exists
    if (t.voiceNote) {
      const file = path.join(process.cwd(), t.voiceNote);
      fs.unlink(file, (e) => {
        if (e) console.warn('remove file error', e);
      });
    }

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Upload voice note and attach to task (or create new task with voice)
exports.uploadVoice = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const relativePath = req.file.path; // e.g., uploads/voice-123.wav
    const { taskId, title, description } = req.body;

    if (taskId) {
      // attach to existing task
      const t = await Task.findById(taskId);
      if (!t) return res.status(404).json({ error: 'Task not found' });

      if (t.voiceNote) {
        fs.unlink(t.voiceNote, (e) => {
          if (e) console.warn('old file remove error', e);
        });
      }

      t.voiceNote = relativePath;
      t.updatedAt = new Date();
      await t.save();
      return res.json(t);
    } else {
      // create task with voice note
      const newTask = new Task({
        title: (title || 'Voice note').trim(),
        description: description || '',
        voiceNote: relativePath,
      });
      await newTask.save();
      return res.status(201).json(newTask);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
};
