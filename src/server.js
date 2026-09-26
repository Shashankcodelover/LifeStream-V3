const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// Register modular API routes
app.use('/api/donors', require('./routes/donors'));
app.use('/api/dispatch', require('./routes/dispatch'));
app.use('/api/hospitals', require('./routes/hospitals'));

// Backward compatibility endpoints for legacy frontend compatibility
app.get('/api/matches/:bloodType', (req, res) => {
  res.redirect(`/api/donors/matches/${req.params.bloodType}?urgency=${req.query.urgency || ''}`);
});

app.get('/api/track/:dispatchId', (req, res) => {
  res.redirect(`/api/dispatch/track/${req.params.dispatchId}`);
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'LifeStream V3.1 Active', service: 'blood-match-api' });
});

// Serve frontend build if dist directory exists
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// 404 catch-all for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Not Found', message: `No API endpoint at ${req.originalUrl}` });
});

// Catch-all for SPA client routing if dist exists
if (fs.existsSync(distPath)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[LifeStream V3.1] API service running on port ${PORT}`);
});
