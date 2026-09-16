const express = require('express');
const { readDB, writeDB } = require('../db');
const { findHospitalSurplusMatches, getDistanceMiles } = require('../services/matchingEngine');

const router = express.Router();

// GET /api/hospitals — List medical centers & blood inventory
router.get('/', (req, res) => {
  const db = readDB();
  res.json(db.hospitals);
});

// GET /api/hospitals/alerts — List emergency blood shortage alerts
router.get('/alerts', (req, res) => {
  const db = readDB();
  res.json(db.alerts || []);
});

// GET /api/hospitals/relations — List inter-hospital network relations & mutual aid corridors
router.get('/relations', (req, res) => {
  const db = readDB();
  res.json(db.relations || []);
});

// POST /api/hospitals/relations — Create new inter-hospital relationship edge
router.post('/relations', (req, res) => {
  const { fromHospitalId, toHospitalId, relationType, notes } = req.body;
  if (!fromHospitalId || !toHospitalId) {
    return res.status(400).json({ error: 'fromHospitalId and toHospitalId are required' });
  }

  const db = readDB();
  if (!db.relations) db.relations = [];

  const newRelation = {
    id: `REL-${Date.now().toString().slice(-5)}`,
    fromHospitalId,
    toHospitalId,
    relationType: relationType || 'trauma_escalation', // trauma_escalation | pediatric_transfer | emergency_reserve | drone_corridor | surplus_mesh
    notes: notes || 'Strategic Regional Healthcare Mutual Aid Link',
    createdAt: new Date().toISOString()
  };

  db.relations.unshift(newRelation);
  writeDB(db);

  res.status(201).json(newRelation);
});

// DELETE /api/hospitals/relations/:id — Sever inter-hospital relationship edge
router.delete('/relations/:id', (req, res) => {
  const relId = req.params.id;
  const db = readDB();
  if (!db.relations) db.relations = [];

  const initialLen = db.relations.length;
  db.relations = db.relations.filter(r => r.id !== relId);

  if (db.relations.length === initialLen) {
    return res.status(404).json({ error: 'Relationship not found' });
  }

  writeDB(db);
  res.json({ message: 'Inter-hospital relationship severed successfully', id: relId });
});

// GET /api/hospitals/surplus/:hospitalId/:bloodType — Find surplus blood units in neighboring hospitals
router.get('/surplus/:hospitalId/:bloodType', (req, res) => {
  const db = readDB();
  const { hospitalId, bloodType } = req.params;
  const matches = findHospitalSurplusMatches(db.hospitals, hospitalId, bloodType.toUpperCase());
  res.json(matches);
});

// POST /api/hospitals/upload — Bulk upload/update hospital inventory
router.post('/upload', (req, res) => {
  const { hospitalsList, csvText } = req.body;
  const db = readDB();
  const updated = [];
  const errors = [];

  let rawList = [];
  if (Array.isArray(hospitalsList)) {
    rawList = hospitalsList;
  } else if (typeof csvText === 'string') {
    const lines = csvText.trim().split('\n');
    if (lines.length > 0) {
      const header = lines[0].split(',').map(h => h.trim().toLowerCase());
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const cols = line.split(',').map(c => c.trim());
        const row = {};
        header.forEach((key, idx) => {
          row[key] = cols[idx] || '';
        });
        rawList.push(row);
      }
    }
  }

  rawList.forEach((row, idx) => {
    const hospId = row.id || row.hospitalid;
    let target = db.hospitals.find(h => h.id === hospId || h.name.toLowerCase() === (row.name || '').toLowerCase());

    if (!target && row.name) {
      target = {
        id: `HOSP-0${db.hospitals.length + 1}`,
        name: row.name,
        code: row.code || 'GEN',
        lat: parseFloat(row.lat) || 37.7749,
        lng: parseFloat(row.lng) || -122.4194,
        phone: row.phone || '+1 415-555-0000',
        helipad: row.helipad === true || row.helipad === 'true',
        inventory: { 'O-': 2, 'O+': 4, 'A+': 6, 'A-': 2, 'B+': 3, 'B-': 1, 'AB+': 3, 'AB-': 1 }
      };
      db.hospitals.push(target);
    }

    if (target) {
      const bTypes = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
      bTypes.forEach(t => {
        const key = t.toLowerCase().replace('-', 'neg').replace('+', 'pos');
        if (row[t] !== undefined) target.inventory[t] = Number(row[t]);
        else if (row[key] !== undefined) target.inventory[t] = Number(row[key]);
      });
      updated.push(target);
    } else {
      errors.push({ row: idx + 1, error: 'Hospital not identified' });
    }
  });

  writeDB(db);

  res.json({
    message: `Updated inventory for ${updated.length} hospitals.`,
    count: updated.length,
    updated,
    errors
  });
});

// DELETE /api/hospitals/:id — Remove hospital facility
router.delete('/:id', (req, res) => {
  const hospId = req.params.id;
  const db = readDB();
  const initialLen = db.hospitals.length;
  db.hospitals = db.hospitals.filter(h => h.id !== hospId);

  if (db.hospitals.length === initialLen) {
    return res.status(404).json({ error: 'Hospital not found' });
  }

  // Also remove relations linked to this hospital
  if (db.relations) {
    db.relations = db.relations.filter(r => r.fromHospitalId !== hospId && r.toHospitalId !== hospId);
  }

  writeDB(db);
  res.json({ message: 'Hospital removed successfully', id: hospId });
});

// POST /api/hospitals/transfer — Initiate emergency Inter-Hospital Drone Transfer
router.post('/transfer', (req, res) => {
  const { sourceHospitalId, targetHospitalId, bloodType, units } = req.body;
  const db = readDB();

  const sourceHosp = db.hospitals.find(h => h.id === sourceHospitalId);
  const targetHosp = db.hospitals.find(h => h.id === targetHospitalId);

  if (!sourceHosp || !targetHosp) {
    return res.status(404).json({ error: 'Source or target hospital not found' });
  }

  const bType = bloodType ? bloodType.toUpperCase() : 'O-';
  const qty = Number(units) || 1;

  // Check source inventory
  const available = (sourceHosp.inventory && sourceHosp.inventory[bType]) || 0;
  if (available < qty) {
    return res.status(400).json({ error: `Source hospital only has ${available} units of ${bType} available.` });
  }

  // Deduct from source hospital
  sourceHosp.inventory[bType] -= qty;

  const distance = getDistanceMiles(sourceHosp.lat, sourceHosp.lng, targetHosp.lat, targetHosp.lng);

  // Create dispatch mission for inter-hospital drone
  const transferDispatch = {
    id: `XFER-${Date.now().toString().slice(-5)}`,
    donorId: `HOSP-${sourceHosp.code || 'SRC'}`,
    donorName: `${sourceHosp.name} (Surplus Bank)`,
    donorBloodType: bType,
    hospitalId: targetHosp.id,
    hospitalName: targetHosp.name,
    transportType: 'Inter-Hospital Drone',
    currentLat: sourceHosp.lat,
    currentLng: sourceHosp.lng,
    targetLat: targetHosp.lat,
    targetLng: targetHosp.lng,
    status: 'En Route',
    remainingMiles: Number(distance.toFixed(2)),
    etaMinutes: Math.max(1, Math.ceil(distance * 1.8)),
    tempCelsius: 4.0,
    batteryPct: 98,
    speedMph: 52,
    altitudeMeters: 160,
    payloadUnits: qty,
    startTime: new Date().toISOString()
  };

  if (!db.dispatches) db.dispatches = [];
  db.dispatches.unshift(transferDispatch);

  if (!db.transfers) db.transfers = [];
  db.transfers.unshift({
    id: `TRF-${Date.now().toString().slice(-4)}`,
    dispatchId: transferDispatch.id,
    sourceHospitalId: sourceHosp.id,
    sourceHospitalName: sourceHosp.name,
    targetHospitalId: targetHosp.id,
    targetHospitalName: targetHosp.name,
    bloodType: bType,
    units: qty,
    timestamp: new Date().toISOString()
  });

  writeDB(db);

  res.status(201).json({
    message: `Initiated autonomous drone transfer of ${qty} units of ${bType} from ${sourceHosp.name} to ${targetHosp.name}.`,
    dispatch: transferDispatch,
    sourceHospital: sourceHosp,
    targetHospital: targetHosp
  });
});

module.exports = router;
