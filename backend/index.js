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
const MONGO_URL =
  process.env.MONGO_URL || 'mongodb://localhost:27017/tasktracker';
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

/* ============================
   DATABASE
============================ */
connectDB(MONGO_URL);

/* ============================
   LOGGING & SECURITY
============================ */
setupLogger(app);
app.use(helmet());

/* ============================
   CORS (SINGLE SOURCE OF TRUTH)
============================ */
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:8082',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Explicit preflight handling
app.options('*', cors());

/* ============================
   BODY PARSERS
============================ */
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

/* ============================
   RATE LIMITING
============================ */
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/* ============================
   STATIC FILES (VOICE UPLOADS)
============================ */
app.use(
  `/${UPLOAD_DIR}`,
  express.static(path.join(process.cwd(), UPLOAD_DIR))
);

/* ============================
   API ROUTES
============================ */
app.use('/api/tasks', tasksRoutes);

/* ============================
   HEALTH CHECK
============================ */
app.get('/health', (req, res) => {
  res.json({ ok: true, time: Date.now() });
});

/* ============================
   ERROR HANDLER
============================ */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message || err);
  res.status(500).json({ error: 'Server error' });
});

/* ============================
   SERVER
============================ */
app.listen(PORT, () => {
  console.log(`✅ API listening on http://localhost:${PORT}`);
});
