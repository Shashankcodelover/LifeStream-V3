// Vercel Serverless Entry Point
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors());

// Modular API routes
const { router: authRouter } = require('../src/routes/auth');
app.use('/api/auth', authRouter);
app.use('/api/donors', require('../src/routes/donors'));
app.use('/api/dispatch', require('../src/routes/dispatch'));
app.use('/api/hospitals', require('../src/routes/hospitals'));
app.use('/api/requests', require('../src/routes/requests'));
app.use('/api/admin', require('../src/routes/admin'));
app.use('/api/clinical', require('../src/routes/clinical'));
app.use('/api/drives', require('../src/routes/drives'));
app.use('/api/algorithm', require('../src/routes/algorithm'));
app.use('/api/assessment', require('../src/routes/assessment'));

// Backward compatibility routes
app.get('/api/matches/:bloodType', (req, res) => {
  res.redirect(`/api/donors/matches/${req.params.bloodType}?urgency=${req.query.urgency || ''}`);
});

app.get('/api/track/:dispatchId', (req, res) => {
  res.redirect(`/api/dispatch/track/${req.params.dispatchId}`);
});

// Health and Ping endpoints
app.get('/health', (req, res) => res.status(200).json({
  status: 'LifeStream V5.0 Vercel Serverless Online',
  uptime: Math.round(process.uptime()),
  timestamp: new Date().toISOString()
}));

app.get('/api/ping', (req, res) => res.status(200).json({ pong: true, timestamp: Date.now() }));

// Serve static frontend assets
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
}

// SPA wildcard fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: `API route ${req.path} not found` });
  }

  const indexPath = path.join(frontendDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>LifeStream V5.0 Enterprise</title>
  <meta http-equiv="refresh" content="0; url=/" />
</head>
<body style="background:#020617; color:#f8fafc; font-family:sans-serif; text-align:center; padding:40px;">
  <h2>LifeStream V5.0 Serverless Initializing</h2>
  <p>Connecting to emergency blood dispatch network...</p>
</body>
</html>`);
});

module.exports = app;
