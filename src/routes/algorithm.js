const express = require('express');
const { readDB } = require('../db');
const {
  ALGORITHM_PRESETS,
  BENCHMARK_SUITES,
  runAlgorithmSimulation
} = require('../services/algorithmRunner');

const router = express.Router();

// GET /api/algorithm/presets — Get pre-configured algorithm templates
router.get('/presets', (req, res) => {
  res.json(ALGORITHM_PRESETS);
});

// GET /api/algorithm/benchmarks — Get benchmark suites list
router.get('/benchmarks', (req, res) => {
  res.json(BENCHMARK_SUITES);
});

// POST /api/algorithm/run — Run custom user or preset algorithm in sandboxed tracer
router.post('/run', (req, res) => {
  const { code, presetId, urgency } = req.body;
  const db = readDB();

  let targetCode = code;
  if (presetId && ALGORITHM_PRESETS[presetId]) {
    targetCode = ALGORITHM_PRESETS[presetId].code;
  }

  if (!targetCode) {
    return res.status(400).json({ error: 'Executable algorithm code or presetId is required.' });
  }

  const donors = (db.donors || []).slice(0, 15);
  const targetHospital = (db.hospitals || [])[0] || { lat: 37.7749, lng: -122.4194 };

  const simulation = runAlgorithmSimulation(targetCode, donors, targetHospital, urgency || 'critical');
  res.json(simulation);
});

// POST /api/algorithm/benchmark-suite/:suiteId — Run full multi-suite stress test benchmark
router.post('/benchmark-suite/:suiteId', (req, res) => {
  const { suiteId } = req.params;
  const { code } = req.body;
  const db = readDB();

  const suite = BENCHMARK_SUITES.find(s => s.id === suiteId) || BENCHMARK_SUITES[0];
  const targetCode = code || ALGORITHM_PRESETS.COMPOSITE_MATCHING.code;

  // Generate synthetic input dataset based on suite size
  const mockDonors = Array.from({ length: suite.inputSize }, (_, idx) => ({
    id: 1000 + idx,
    name: `Candidate Donor #${idx + 1}`,
    bloodType: idx % 4 === 0 ? 'O-' : idx % 3 === 0 ? 'O+' : 'A+',
    lat: 37.7749 + (Math.random() - 0.5) * 0.1,
    lng: -122.4194 + (Math.random() - 0.5) * 0.1,
    reliabilityScore: Math.floor(80 + Math.random() * 20),
    totalDonations: Math.floor(1 + Math.random() * 15)
  }));

  const simulation = runAlgorithmSimulation(targetCode, mockDonors, { lat: 37.7749, lng: -122.4194 }, 'critical');

  res.json({
    suiteId: suite.id,
    suiteName: suite.name,
    inputSize: suite.inputSize,
    scenario: suite.scenario,
    performance: {
      latencyMicroseconds: simulation.latencyMicroseconds,
      throughputOpsPerSec: Math.round(1000000 / Math.max(1, simulation.latencyMicroseconds)),
      memoryAllocatedKb: simulation.memoryAllocatedKb,
      status: simulation.success ? 'PASSED_BENCHMARK' : 'FAILED'
    },
    traceCount: simulation.traces.length,
    traces: simulation.traces.slice(0, 8) // Sample traces for UI
  });
});

module.exports = router;
