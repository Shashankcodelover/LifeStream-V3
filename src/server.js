const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// Register modular API routes
const { router: authRouter } = require('./routes/auth');
app.use('/api/auth', authRouter);
app.use('/api/donors', require('./routes/donors'));
app.use('/api/dispatch', require('./routes/dispatch'));
app.use('/api/hospitals', require('./routes/hospitals'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/clinical', require('./routes/clinical'));
app.use('/api/drives', require('./routes/drives'));
app.use('/api/algorithm', require('./routes/algorithm'));

// Backward compatibility endpoints for legacy frontend compatibility
app.get('/api/matches/:bloodType', (req, res) => {
  res.redirect(`/api/donors/matches/${req.params.bloodType}?urgency=${req.query.urgency || ''}`);
});

app.get('/api/track/:dispatchId', (req, res) => {
  res.redirect(`/api/dispatch/track/${req.params.dispatchId}`);
});

// 24/7 Keepalive & Health check endpoints
app.get('/health', (req, res) => res.status(200).json({
  status: 'LifeStream Enterprise V5.0 Online',
  uptime: Math.round(process.uptime()),
  timestamp: new Date().toISOString()
}));

app.get('/api/ping', (req, res) => res.status(200).json({
  pong: true,
  timestamp: Date.now()
}));

// Serve compiled React Vite frontend in production
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  const indexPath = path.join(frontendDistPath, 'index.html');
  res.sendFile(indexPath, err => {
    if (err) {
      res.status(200).send(`<h2>LifeStream Enterprise V5.0 API Online</h2><p>Visit <a href="http://localhost:5173">Vite Dev Server</a> for frontend.</p>`);
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 LifeStream Enterprise V5.0 Platform running 24/7 on port ${PORT}`);
});
