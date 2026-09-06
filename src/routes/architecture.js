const express = require('express');
const {
  ARCHITECTURE_TOPOLOGY,
  ARCHITECTURE_PRESETS,
  calculateSystemMetrics
} = require('../services/architectureEngine');

const router = express.Router();

// GET /api/architecture/topology — Get full distributed system topology
router.get('/topology', (req, res) => {
  const initialMetrics = calculateSystemMetrics({
    trafficRps: 5000,
    cacheWarm: true,
    dbPoolSaturated: false,
    partitionActive: false,
    failedPodId: null
  });

  res.json({
    topology: ARCHITECTURE_TOPOLOGY,
    metrics: initialMetrics,
    serverUptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// GET /api/architecture/presets — Return ByteByteGo case studies
router.get('/presets', (req, res) => {
  res.json({
    presets: ARCHITECTURE_PRESETS
  });
});

// POST /api/architecture/simulate — Live Latency, Queue Depth & Routing Simulator
router.post('/simulate', (req, res) => {
  const {
    trafficRps = 5000,
    cacheWarm = true,
    dbPoolSaturated = false,
    partitionActive = false,
    failedPodId = null
  } = req.body;

  const result = calculateSystemMetrics({
    trafficRps: Number(trafficRps),
    cacheWarm: Boolean(cacheWarm),
    dbPoolSaturated: Boolean(dbPoolSaturated),
    partitionActive: Boolean(partitionActive),
    failedPodId: failedPodId || null
  });

  res.json(result);
});

// POST /api/architecture/chaos — Inject or Clear Chaos Events
router.post('/chaos', (req, res) => {
  const { action, targetId } = req.body;

  let simConfig = {
    trafficRps: 6000,
    cacheWarm: true,
    dbPoolSaturated: false,
    partitionActive: false,
    failedPodId: null
  };

  switch (action) {
    case 'KILL_POD':
      simConfig.failedPodId = targetId || 'pod-match-2';
      break;
    case 'SATURATE_DB_POOL':
      simConfig.dbPoolSaturated = true;
      simConfig.cacheWarm = false;
      simConfig.trafficRps = 15000;
      break;
    case 'FLUSH_CACHE':
      simConfig.cacheWarm = false;
      break;
    case 'TRIGGER_PARTITION':
      simConfig.partitionActive = true;
      break;
    case 'RESTORE_ALL':
    default:
      // Reset to steady state
      break;
  }

  const metrics = calculateSystemMetrics(simConfig);
  res.json({
    actionExecuted: action,
    state: simConfig,
    metrics
  });
});

module.exports = router;
