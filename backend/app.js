const express = require('express');
const cors = require('cors');
const path = require('path');

const { errorHandler } = require('./src/middlewares/error.middleware');
const authRoutes = require('./src/routes/auth.routes');
const projectRoutes = require('./src/routes/project.routes');
const taskRoutes = require('./src/routes/task.routes');

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5000',
    credentials: true,
  })
);

// ── Body parsers ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/projects', taskRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

// ── Serve frontend static files ───────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ── SPA catch-all (send index.html for any unmatched HTML request) ────────────
app.get('*', (req, res) => {
  if (req.accepts('html')) {
    return res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
  }
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
