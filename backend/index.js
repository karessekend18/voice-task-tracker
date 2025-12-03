// backend/index.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/db');
const setupLogger = require('./logger');

const tasksRoutes = require('./routes/tasks');

const app = express();

const PORT = process.env.PORT || 4000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/tasktracker';
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

// connect db
connectDB(MONGO_URL);

// middlewares
setupLogger(app);
app.use(helmet());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS: allow your frontend origin (from env) or default to localhost:5173 (Vite)
const ORIGIN = process.env.ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: ORIGIN, credentials: true }));

// Rate limit simple
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
}));

// serve uploaded files statically (so frontend can GET them)
app.use(`/${UPLOAD_DIR}`, express.static(path.join(process.cwd(), UPLOAD_DIR)));

// API routes
app.use('/api/tasks', tasksRoutes);

// health check
app.get('/health', (req, res) => res.json({ ok: true, time: Date.now() }));

// default error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
