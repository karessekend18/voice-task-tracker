// backend/routes/tasks.js
const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// configure multer for voice uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const stamp = Date.now();
    const safe = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-\_\.]/g, '');
    cb(null, `${stamp}-${safe}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB max
});

// CRUD routes
router.get('/', tasksController.listTasks);
router.get('/:id', tasksController.getTask);
router.post('/', tasksController.createTask);
router.put('/:id', tasksController.updateTask);
router.delete('/:id', tasksController.deleteTask);

// Upload voice note (multipart/form-data).  field name: "voice"
router.post('/upload', upload.single('voice'), tasksController.uploadVoice);

module.exports = router;
