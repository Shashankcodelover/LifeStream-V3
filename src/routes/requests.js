const express = require('express');
const { readDB, writeDB } = require('../db');
const { filterEligibleDonors, findHospitalSurplusMatches } = require('../services/matchingEngine');

const router = express.Router();

// GET /api/requests — List patient emergency blood requests
router.get('/', (req, res) => {
  const db = readDB();
  res.json(db.requests || []);
});

// POST /api/requests — Submit emergency blood request from patient / hospital ER
router.post('/', (req, res) => {
  const { patientName, bloodType, unitsRequired, urgency, hospitalId, contactPhone, medicalReason } = req.body;

  if (!patientName || !bloodType) {
    return res.status(400).json({ error: 'Patient name and bloodType are required.' });
  }

  const db = readDB();
  const hospital = db.hospitals.find(h => h.id === (hospitalId || 'HOSP-01')) || db.hospitals[0];

  const newRequest = {
    id: `REQ-${Date.now().toString().slice(-5)}`,
    patientName,
    bloodType: bloodType.toUpperCase(),
    unitsRequired: Number(unitsRequired) || 1,
    urgency: urgency || 'critical',
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    status: 'In Progress',
    contactPhone: contactPhone || '+1 415-555-0911',
    medicalReason: medicalReason || 'STAT Emergency Blood Requirement',
    createdAt: new Date().toISOString()
  };

  if (!db.requests) db.requests = [];
  db.requests.unshift(newRequest);

  // If critical, also auto-create a system alert
  if (urgency === 'critical') {
    if (!db.alerts) db.alerts = [];
    db.alerts.unshift({
      id: `ALT-${Date.now().toString().slice(-4)}`,
      hospitalId: hospital.id,
      bloodType: bloodType.toUpperCase(),
      urgency: 'critical',
      message: `EMERGENCY STAT: ${unitsRequired || 1} units of ${bloodType.toUpperCase()} needed for patient ${patientName} at ${hospital.name}.`,
      createdAt: new Date().toISOString()
    });
  }

  writeDB(db);

  // Return request along with instant AI matches
  const matches = filterEligibleDonors(db.donors, newRequest.bloodType, hospital.lat, hospital.lng, true);
  const hospitalSurplus = findHospitalSurplusMatches(db.hospitals, hospital.id, newRequest.bloodType);

  res.status(201).json({
    request: newRequest,
    matchingDonors: matches.slice(0, 5),
    hospitalSurplus
  });
});

// POST /api/requests/upload — Bulk upload patient emergency requests
router.post('/upload', (req, res) => {
  const { csvText, requestsList } = req.body;
  const db = readDB();
  const imported = [];
  const errors = [];

  let rawList = [];
  if (Array.isArray(requestsList)) {
    rawList = requestsList;
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
        rawList.push({
          patientName: row.patient || row.patientname || row.name,
          bloodType: row.bloodtype || row['blood type'] || row.type,
          unitsRequired: parseInt(row.units || row.unitsrequired || '1', 10),
          urgency: row.urgency || 'critical',
          hospitalId: row.hospitalid || row.hospital || 'HOSP-01',
          contactPhone: row.phone || row.contactphone,
          medicalReason: row.reason || row.medicalreason
        });
      }
    }
  }

  if (!db.requests) db.requests = [];

  rawList.forEach((item, idx) => {
    if (!item.patientName || !item.bloodType) {
      errors.push({ row: idx + 1, error: 'Missing patientName or bloodType' });
      return;
    }
    const hospital = db.hospitals.find(h => h.id === item.hospitalId) || db.hospitals[0];
    const newReq = {
      id: `REQ-${Date.now().toString().slice(-4)}${idx}`,
      patientName: item.patientName,
      bloodType: item.bloodType.toUpperCase(),
      unitsRequired: Number(item.unitsRequired) || 1,
      urgency: item.urgency || 'critical',
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      status: 'In Progress',
      contactPhone: item.contactPhone || '+1 415-555-0911',
      medicalReason: item.medicalReason || 'Batch Emergency Blood Requirement',
      createdAt: new Date().toISOString()
    };
    db.requests.unshift(newReq);
    imported.push(newReq);
  });

  writeDB(db);

  res.status(201).json({
    message: `Batch imported ${imported.length} emergency requests successfully.`,
    count: imported.length,
    imported,
    errors
  });
});

// GET /api/requests/:id — Fetch request details with live donor & surplus matching
router.get('/:id', (req, res) => {
  const db = readDB();
  const request = (db.requests || []).find(r => r.id === req.params.id);

  if (!request) return res.status(404).json({ error: 'Emergency request not found' });

  const hospital = db.hospitals.find(h => h.id === request.hospitalId) || db.hospitals[0];
  const matchingDonors = filterEligibleDonors(db.donors, request.bloodType, hospital.lat, hospital.lng, request.urgency === 'critical');
  const hospitalSurplus = findHospitalSurplusMatches(db.hospitals, hospital.id, request.bloodType);

  res.json({
    request,
    hospital,
    matchingDonors,
    hospitalSurplus
  });
});

// PATCH /api/requests/:id/status — Update request lifecycle status
router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  const db = readDB();
  const request = (db.requests || []).find(r => r.id === req.params.id);

  if (!request) return res.status(404).json({ error: 'Emergency request not found' });

  request.status = status || 'Fulfilled';
  if (status === 'Fulfilled') request.fulfilledAt = new Date().toISOString();
  writeDB(db);

  res.json(request);
});

// DELETE /api/requests/:id — Delete/Cancel emergency request
router.delete('/:id', (req, res) => {
  const reqId = req.params.id;
  const db = readDB();
  if (!db.requests) db.requests = [];

  const initialLen = db.requests.length;
  db.requests = db.requests.filter(r => r.id !== reqId);

  if (db.requests.length === initialLen) {
    return res.status(404).json({ error: 'Emergency request not found' });
  }

  writeDB(db);
  res.json({ message: 'Emergency request deleted successfully', id: reqId });
});

module.exports = router;
