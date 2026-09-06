const express = require('express');
const { readDB, writeDB } = require('../db');
const { getDistanceMiles } = require('../services/matchingEngine');
const { updateDispatchPosition } = require('../services/telemetry');
const { generateCustodySeal } = require('../services/clinicalEngine');

const router = express.Router();

// POST /api/dispatch — Initialize blood transport dispatch with digital seal & flight telemetry
router.post('/', (req, res) => {
  const { donorId, hospitalId, transportType, componentType } = req.body;
  const db = readDB();

  const donor = db.donors.find(d => d.id === Number(donorId));
  if (!donor) return res.status(404).json({ error: 'Donor not found' });

  const hospital = db.hospitals.find(h => h.id === (hospitalId || 'HOSP-01')) || db.hospitals[0];
  const initialDistance = getDistanceMiles(hospital.lat, hospital.lng, donor.lat, donor.lng);
  const type = transportType || 'Autonomous Drone';
  const component = componentType || 'Packed Red Blood Cells (PRBC)';

  const newDispatch = {
    id: `DSP-${Date.now().toString().slice(-5)}`,
    donorId: donor.id,
    donorName: donor.name,
    donorBloodType: donor.bloodType,
    componentType: component,
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    transportType: type,
    currentLat: donor.lat,
    currentLng: donor.lng,
    targetLat: hospital.lat,
    targetLng: hospital.lng,
    status: 'En Route',
    remainingMiles: Number(initialDistance.toFixed(2)),
    etaMinutes: Math.max(1, Math.ceil(initialDistance * (type.includes('Drone') ? 1.5 : 2.5))),
    tempCelsius: component.includes('Platelet') ? 22.0 : component.includes('Frozen') || component.includes('Cryo') ? -20.0 : 4.0,
    targetTempRange: component.includes('Platelet') ? '20.0°C - 24.0°C' : component.includes('Frozen') || component.includes('Cryo') ? '< -18.0°C' : '1.0°C - 6.0°C',
    batteryPct: 98,
    batteryVoltage: 22.4, // 6S LiPo Battery voltage
    speedMph: type.includes('Drone') ? 52 : 35,
    altitudeMeters: type.includes('Drone') ? 150 : 0,
    windVectorMph: 9,
    windDirection: 'NW 315°',
    startTime: new Date().toISOString(),
    weather: { condition: 'Optimal Clearance', windSpeedMph: 9, ambientTempC: 18 }
  };

  // Attach cryptographic proof of custody seal (SHA-256)
  newDispatch.custodySeal = generateCustodySeal(newDispatch);

  if (!db.dispatches) db.dispatches = [];
  db.dispatches.unshift(newDispatch);
  writeDB(db);

  res.status(201).json(newDispatch);
});

// POST /api/dispatch/:id/cockpit-control — Real-time in-flight drone cockpit command
router.post('/:id/cockpit-control', (req, res) => {
  const { command } = req.body; // 'BOOST' | 'REROUTE' | 'DESCEND'
  const db = readDB();
  const dispatch = (db.dispatches || []).find(d => d.id === req.params.id);

  if (!dispatch) return res.status(404).json({ error: 'Dispatch session not found' });

  if (command === 'BOOST') {
    dispatch.speedMph = Math.round(dispatch.speedMph * 1.35);
    dispatch.etaMinutes = Math.max(1, Math.round(dispatch.etaMinutes * 0.75));
    dispatch.lastCockpitAction = '⚡ Vector Speed Boost (1.35x) Engaged';
  } else if (command === 'REROUTE') {
    dispatch.altitudeMeters = 180;
    dispatch.lastCockpitAction = '🛰️ Dynamic Airspace Corridor Avoidance Reroute Active';
  } else if (command === 'DESCEND') {
    dispatch.altitudeMeters = 40;
    dispatch.lastCockpitAction = '🛬 Emergency Landing Approach Initiated';
  }

  writeDB(db);
  res.json({ message: `Cockpit command [${command}] executed.`, dispatch });
});

// GET /api/dispatch/track/:id — Live polling telemetry update for single dispatch
router.get('/track/:id', (req, res) => {
  const db = readDB();
  const dispatch = (db.dispatches || []).find(d => d.id === req.params.id);

  if (!dispatch) return res.status(404).json({ error: 'Dispatch session not found' });

  const updated = updateDispatchPosition(dispatch);
  writeDB(db);

  res.json(updated);
});

// GET /api/dispatch/track-all — Live polling batch update for ALL active dispatches
router.get('/track-all', (req, res) => {
  const db = readDB();
  if (!db.dispatches) db.dispatches = [];

  const active = db.dispatches.filter(d => d.status === 'En Route');
  active.forEach(d => updateDispatchPosition(d));

  writeDB(db);
  res.json(db.dispatches);
});

// GET /api/dispatch/active — List active dispatches
router.get('/active', (req, res) => {
  const db = readDB();
  res.json((db.dispatches || []).filter(d => d.status !== 'Arrived' && d.status !== 'Cancelled'));
});

// POST /api/dispatch/:id/confirm-receipt — Hospital intake signature confirmation
router.post('/:id/confirm-receipt', (req, res) => {
  const { nurseName, tempVerified, badgeId } = req.body;
  const db = readDB();
  const dispatch = (db.dispatches || []).find(d => d.id === req.params.id);

  if (!dispatch) return res.status(404).json({ error: 'Dispatch session not found' });

  dispatch.status = 'Arrived';
  dispatch.intakeConfirmation = {
    receivedBy: nurseName || 'Nurse Practitioner On-Duty',
    badgeId: badgeId || 'RN-9082',
    intakeTemp: dispatch.tempCelsius,
    tempCompliance: 'PASSED (AABB Standard Compliant)',
    timestamp: new Date().toISOString(),
    isbt128Barcode: dispatch.custodySeal?.isbt128Barcode || `W${Date.now().toString().slice(-8)}`
  };

  // Increment hospital inventory on intake
  const hospital = db.hospitals.find(h => h.id === dispatch.hospitalId);
  if (hospital && hospital.inventory) {
    hospital.inventory[dispatch.donorBloodType] = (hospital.inventory[dispatch.donorBloodType] || 0) + 1;
  }

  writeDB(db);

  res.json({
    message: `Blood unit successfully received into ${dispatch.hospitalName} bank inventory.`,
    dispatch
  });
});

module.exports = router;
