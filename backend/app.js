const express = require('express');
const cors = require('cors');
const path = require('path');

const { errorHandler } = require('./src/middlewares/error.middleware');
const authRoutes = require('./src/routes/auth.routes');

const app = express();

// cors configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5000',
    credentials: true,
  })
);

// body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// routes
app.use('/api/v1/auth', authRoutes);

// health check
app.get('/api/health', (_req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

// serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// SPA catch-all (send index.html for any unmatched HTML request)
app.get('*', (req, res) => {
  if (req.accepts('html')) {
    return res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
  }
  res.status(404).json({ error: 'Route not found' });
});

// global error handler
app.use(errorHandler);

module.exports = app;
