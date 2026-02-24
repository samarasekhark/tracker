const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin
// This will use local default credentials if available, or project ID
admin.initializeApp({
    projectId: 'tracker-e40bd'
});

const itemRoutes = require('./routes/items.routes');
const verifyToken = require('./middleware/auth.middleware');

const app = express();

// ── Middleware ─────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:4200').split(',');
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// ── Health Check ───────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ─────────────────────────────────────────────
// Apply auth middleware to all item routes
app.use('/api/items', verifyToken, itemRoutes);

// ── 404 Handler ────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ── Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
