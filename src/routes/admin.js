const express = require('express');
const { readDB, writeDB } = require('../db');

const router = express.Router();

// GET /api/admin/stats — System-wide operational overview
router.get('/stats', (req, res) => {
  const db = readDB();
  
  const totalDonors = db.donors.length;
  const verifiedDonors = db.donors.filter(d => d.isVerified).length;
  const totalHospitals = db.hospitals.length;
  const activeDispatches = db.dispatches.filter(d => d.status !== 'Arrived' && d.status !== 'Cancelled').length;
  const completedDispatches = db.dispatches.filter(d => d.status === 'Arrived').length;
  const activeAlerts = (db.alerts || []).length;

  const avgReliability = totalDonors > 0
    ? Math.round(db.donors.reduce((acc, d) => acc + (d.reliabilityScore || 80), 0) / totalDonors)
    : 0;

  // Aggregate regional blood bank reserve units
  const aggregateInventory = { 'O-': 0, 'O+': 0, 'A-': 0, 'A+': 0, 'B-': 0, 'B+': 0, 'AB-': 0, 'AB+': 0 };
  let totalReserveUnits = 0;

  db.hospitals.forEach(h => {
    if (h.inventory) {
      Object.entries(h.inventory).forEach(([type, units]) => {
        if (aggregateInventory[type] !== undefined) {
          aggregateInventory[type] += units;
          totalReserveUnits += units;
        }
      });
    }
  });

  res.json({
    totalDonors,
    verifiedDonors,
    verifiedPercentage: totalDonors > 0 ? Math.round((verifiedDonors / totalDonors) * 100) : 0,
    totalHospitals,
    activeDispatches,
    completedDispatches,
    activeAlerts,
    avgReliability,
    totalReserveUnits,
    aggregateInventory
  });
});

// GET /api/admin/donors — List donors with optional filtering
router.get('/donors', (req, res) => {
  const { search, bloodType, verified } = req.query;
  const db = readDB();
  let donors = [...db.donors];

  if (search) {
    const q = search.toLowerCase();
    donors = donors.filter(d => d.name.toLowerCase().includes(q) || (d.phone && d.phone.includes(q)));
  }

  if (bloodType) {
    donors = donors.filter(d => d.bloodType.toUpperCase() === bloodType.toUpperCase());
  }

  if (verified !== undefined && verified !== '') {
    const isV = verified === 'true';
    donors = donors.filter(d => Boolean(d.isVerified) === isV);
  }

  res.json(donors);
});

// POST /api/admin/donors — Admin create new donor record
router.post('/donors', (req, res) => {
  const { name, bloodType, phone, lat, lng, isVerified, reliabilityScore, totalDonations } = req.body;
  if (!name || !bloodType) return res.status(400).json({ error: 'Name and bloodType are required' });

  const db = readDB();
  const newDonor = {
    id: Date.now(),
    name,
    bloodType: bloodType.toUpperCase(),
    phone: phone || '+1 415-555-0000',
    lastDonation: null,
    lat: Number(lat) || (37.7749 + (Math.random() - 0.5) * 0.05),
    lng: Number(lng) || (-122.4194 + (Math.random() - 0.5) * 0.05),
    isVerified: isVerified !== undefined ? Boolean(isVerified) : true,
    reliabilityScore: Number(reliabilityScore) || 90,
    totalDonations: Number(totalDonations) || 0
  };

  db.donors.unshift(newDonor);
  writeDB(db);

  res.status(201).json(newDonor);
});

// PATCH /api/admin/donors/:id — Update donor properties
router.patch('/donors/:id', (req, res) => {
  const donorId = Number(req.params.id);
  const db = readDB();
  const donor = db.donors.find(d => d.id === donorId);

  if (!donor) return res.status(404).json({ error: 'Donor not found' });

  const { name, bloodType, phone, isVerified, reliabilityScore, totalDonations, lat, lng } = req.body;

  if (name !== undefined) donor.name = name;
  if (bloodType !== undefined) donor.bloodType = bloodType.toUpperCase();
  if (phone !== undefined) donor.phone = phone;
  if (isVerified !== undefined) donor.isVerified = Boolean(isVerified);
  if (reliabilityScore !== undefined) donor.reliabilityScore = Number(reliabilityScore);
  if (totalDonations !== undefined) donor.totalDonations = Number(totalDonations);
  if (lat !== undefined) donor.lat = Number(lat);
  if (lng !== undefined) donor.lng = Number(lng);

  writeDB(db);
  res.json(donor);
});

// DELETE /api/admin/donors/:id — Delete donor record
router.delete('/donors/:id', (req, res) => {
  const donorId = Number(req.params.id);
  const db = readDB();
  const initialLength = db.donors.length;
  db.donors = db.donors.filter(d => d.id !== donorId);

  if (db.donors.length === initialLength) {
    return res.status(404).json({ error: 'Donor not found' });
  }

  writeDB(db);
  res.json({ message: 'Donor removed successfully', id: donorId });
});

// GET /api/admin/hospitals — List hospitals with inventory
router.get('/hospitals', (req, res) => {
  const db = readDB();
  res.json(db.hospitals);
});

// POST /api/admin/hospitals — Add new hospital
router.post('/hospitals', (req, res) => {
  const { name, lat, lng, inventory } = req.body;
  if (!name) return res.status(400).json({ error: 'Hospital name is required' });

  const db = readDB();
  const newHospital = {
    id: `HOSP-0${db.hospitals.length + 1}`,
    name,
    lat: Number(lat) || 37.7749,
    lng: Number(lng) || -122.4194,
    inventory: inventory || { 'O-': 2, 'O+': 4, 'A+': 5, 'A-': 2, 'B+': 3, 'B-': 1, 'AB+': 4, 'AB-': 1 }
  };

  db.hospitals.push(newHospital);
  writeDB(db);

  res.status(201).json(newHospital);
});

// PATCH /api/admin/hospitals/:id/inventory — Adjust blood inventory units
router.patch('/hospitals/:id/inventory', (req, res) => {
  const hospitalId = req.params.id;
  const { bloodType, delta, units } = req.body;
  const db = readDB();

  const hospital = db.hospitals.find(h => h.id === hospitalId);
  if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

  if (!hospital.inventory) hospital.inventory = {};

  if (bloodType) {
    const bType = bloodType.toUpperCase();
    if (units !== undefined) {
      hospital.inventory[bType] = Math.max(0, Number(units));
    } else if (delta !== undefined) {
      hospital.inventory[bType] = Math.max(0, (hospital.inventory[bType] || 0) + Number(delta));
    }
  } else if (req.body.inventory) {
    hospital.inventory = { ...hospital.inventory, ...req.body.inventory };
  }

  writeDB(db);
  res.json(hospital);
});

// GET /api/admin/dispatches — Full dispatch audit log
router.get('/dispatches', (req, res) => {
  const db = readDB();
  res.json(db.dispatches);
});

// PATCH /api/admin/dispatches/:id/status — Abort or update dispatch status
router.patch('/dispatches/:id/status', (req, res) => {
  const dispatchId = req.params.id;
  const { status } = req.body;
  const db = readDB();

  const dispatch = db.dispatches.find(d => d.id === dispatchId);
  if (!dispatch) return res.status(404).json({ error: 'Dispatch session not found' });

  dispatch.status = status || 'Cancelled';
  writeDB(db);

  res.json(dispatch);
});

// DELETE /api/admin/dispatches/:id — Clear dispatch log
router.delete('/dispatches/:id', (req, res) => {
  const dispatchId = req.params.id;
  const db = readDB();
  db.dispatches = db.dispatches.filter(d => d.id !== dispatchId);
  writeDB(db);

  res.json({ message: 'Dispatch log cleared', id: dispatchId });
});

// GET /api/admin/alerts — List emergency alerts
router.get('/alerts', (req, res) => {
  const db = readDB();
  res.json(db.alerts || []);
});

// POST /api/admin/alerts — Broadcast new emergency alert
router.post('/alerts', (req, res) => {
  const { hospitalId, bloodType, urgency, message } = req.body;
  if (!bloodType || !message) return res.status(400).json({ error: 'bloodType and message are required' });

  const db = readDB();
  if (!db.alerts) db.alerts = [];

  const newAlert = {
    id: `ALT-${Date.now().toString().slice(-4)}`,
    hospitalId: hospitalId || 'HOSP-01',
    bloodType: bloodType.toUpperCase(),
    urgency: urgency || 'critical',
    message,
    createdAt: new Date().toISOString()
  };

  db.alerts.unshift(newAlert);
  writeDB(db);

  res.status(201).json(newAlert);
});

// DELETE /api/admin/alerts/:id — Dismiss emergency alert
router.delete('/alerts/:id', (req, res) => {
  const alertId = req.params.id;
  const db = readDB();
  if (!db.alerts) db.alerts = [];
  
  db.alerts = db.alerts.filter(a => a.id !== alertId);
  writeDB(db);

  res.json({ message: 'Alert resolved and dismissed', id: alertId });
});

// GET /api/admin/relations — List inter-hospital network relations & mutual aid corridors
router.get('/relations', (req, res) => {
  const db = readDB();
  res.json(db.relations || []);
});

// POST /api/admin/relations — Create new inter-hospital relationship edge
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
    relationType: relationType || 'trauma_escalation',
    notes: notes || 'Strategic Regional Healthcare Mutual Aid Link',
    createdAt: new Date().toISOString()
  };

  db.relations.unshift(newRelation);
  writeDB(db);

  res.status(201).json(newRelation);
});

// DELETE /api/admin/relations/:id — Sever inter-hospital relationship edge
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

// DELETE /api/admin/requests/:id — Delete/Cancel emergency request
router.delete('/requests/:id', (req, res) => {
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
