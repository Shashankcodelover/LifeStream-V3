const express = require('express');
const { readDB, writeDB } = require('../db');
const { filterEligibleDonors } = require('../services/matchingEngine');

const router = express.Router();

// GET /api/donors — List donors with optional filtering
router.get('/', (req, res) => {
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

// GET /api/donors/matches/:bloodType?urgency=critical&hospitalId=HOSP-01
router.get('/matches/:bloodType', (req, res) => {
  const recipientType = req.params.bloodType.toUpperCase();
  const isCritical = req.query.urgency === 'critical';
  const hospitalId = req.query.hospitalId || 'HOSP-01';

  const db = readDB();
  const hospital = db.hospitals.find(h => h.id === hospitalId) || db.hospitals[0];

  const matches = filterEligibleDonors(db.donors, recipientType, hospital.lat, hospital.lng, isCritical);
  res.json({ hospital, matches });
});

// GET /api/donors/leaderboard — Hero donor community rankings & impact metrics
router.get('/leaderboard', (req, res) => {
  const db = readDB();
  const sorted = [...db.donors]
    .map(d => {
      const livesImpacted = (d.totalDonations || 1) * 3; // 1 blood donation can save up to 3 lives
      return {
        ...d,
        livesImpacted,
        rankTier: (d.totalDonations || 0) >= 12 ? 'Platinum Vanguard' : (d.totalDonations || 0) >= 8 ? 'Gold LifeSaver' : 'Silver Guardian'
      };
    })
    .sort((a, b) => (b.totalDonations * 100 + b.reliabilityScore) - (a.totalDonations * 100 + a.reliabilityScore));

  res.json(sorted);
});

// GET /api/donors/:id — Get single donor details
router.get('/:id', (req, res) => {
  const donorId = Number(req.params.id);
  const db = readDB();
  const donor = db.donors.find(d => d.id === donorId);
  if (!donor) return res.status(404).json({ error: 'Donor not found' });
  res.json(donor);
});

// POST /api/donors/check-eligibility — 5-point rapid health screening questionnaire
router.post('/check-eligibility', (req, res) => {
  const { weightKg, age, lastDonationDays, feelingWell, pregnantOrMedication } = req.body;

  const errors = [];
  if (Number(age) < 18 || Number(age) > 65) errors.push('Donor must be between 18 and 65 years of age.');
  if (Number(weightKg) < 50) errors.push('Minimum weight requirement is 50kg (110 lbs).');
  if (Number(lastDonationDays) < 56) errors.push('Must wait at least 56 days between standard red blood cell donations.');
  if (feelingWell === false || feelingWell === 'false') errors.push('Must be in good general health without active fever or illness.');
  if (pregnantOrMedication === true || pregnantOrMedication === 'true') errors.push('Temporary medical deferral based on active medication or pregnancy.');

  const isEligible = errors.length === 0;

  res.json({
    isEligible,
    clearanceStatus: isEligible ? 'MEDICALLY CLEARED FOR RAPID DISPATCH' : 'TEMPORARY DEFERRAL',
    errors,
    nextEligibleDays: isEligible ? 0 : Math.max(0, 56 - (Number(lastDonationDays) || 0))
  });
});

// POST /api/donors/ping/:id — Emergency SMS alert notification simulation
router.post('/ping/:id', (req, res) => {
  const donorId = Number(req.params.id);
  const { hospitalName, bloodType, urgency } = req.body;
  const db = readDB();

  const donor = db.donors.find(d => d.id === donorId);
  if (!donor) return res.status(404).json({ error: 'Donor not found' });

  const notification = {
    messageId: `SMS-${Date.now().toString().slice(-6)}`,
    recipient: donor.name,
    phone: donor.phone,
    sentAt: new Date().toISOString(),
    status: 'Delivered',
    payload: `🚨 STAT EMERGENCY: Urgent need for ${bloodType || donor.bloodType} blood at ${hospitalName || 'SF Trauma Center'}. Autonomous drone dispatch requested. Reply 1 to Accept.`
  };

  res.json({ success: true, notification });
});

// POST /api/donors — Register a new donor
router.post('/', (req, res) => {
  const { name, bloodType, phone, lat, lng, hospitalAffiliation } = req.body;
  if (!name || !bloodType) return res.status(400).json({ error: 'Name and bloodType are required' });

  const db = readDB();
  const newDonor = {
    id: Date.now(),
    name,
    bloodType: bloodType.toUpperCase(),
    phone: phone || '+1 415-555-9999',
    lastDonation: null,
    lat: Number(lat) || (37.7749 + (Math.random() - 0.5) * 0.05),
    lng: Number(lng) || (-122.4194 + (Math.random() - 0.5) * 0.05),
    isVerified: true,
    reliabilityScore: 92,
    totalDonations: 1,
    hospitalAffiliation: hospitalAffiliation || 'HOSP-01',
    badges: ['New Recruit', 'Rapid Volunteer']
  };

  db.donors.unshift(newDonor);
  writeDB(db);

  res.status(201).json(newDonor);
});

// POST /api/donors/upload — Batch upload donors from CSV text or JSON array
router.post('/upload', (req, res) => {
  const { csvText, donorsList } = req.body;
  const db = readDB();
  const imported = [];
  const errors = [];

  let rawDonors = [];

  if (Array.isArray(donorsList)) {
    rawDonors = donorsList;
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
        rawDonors.push({
          name: row.name || row['full name'] || row.donor,
          bloodType: row.bloodtype || row['blood type'] || row.type,
          phone: row.phone || row['phone number'],
          lat: parseFloat(row.lat || row.latitude),
          lng: parseFloat(row.lng || row.longitude),
          hospitalAffiliation: row.hospital || row.hospitalid || row['hospital id']
        });
      }
    }
  }

  rawDonors.forEach((item, idx) => {
    if (!item.name || !item.bloodType) {
      errors.push({ row: idx + 1, error: 'Missing name or bloodType' });
      return;
    }
    const donor = {
      id: Date.now() + idx + Math.floor(Math.random() * 1000),
      name: item.name,
      bloodType: item.bloodType.toUpperCase(),
      phone: item.phone || '+1 415-555-' + Math.floor(1000 + Math.random() * 9000),
      lastDonation: item.lastDonation || null,
      lat: Number(item.lat) || (37.7749 + (Math.random() - 0.5) * 0.06),
      lng: Number(item.lng) || (-122.4194 + (Math.random() - 0.5) * 0.06),
      isVerified: true,
      reliabilityScore: Number(item.reliabilityScore) || 90,
      totalDonations: Number(item.totalDonations) || 1,
      hospitalAffiliation: item.hospitalAffiliation || 'HOSP-01',
      badges: ['Batch Verified', 'Emergency Reserve']
    };
    db.donors.unshift(donor);
    imported.push(donor);
  });

  writeDB(db);

  res.status(201).json({
    message: `Batch imported ${imported.length} donors successfully.`,
    count: imported.length,
    imported,
    errors
  });
});

// POST /api/donors/:id/affiliate — Create or update hospital affiliation relationship
router.post('/:id/affiliate', (req, res) => {
  const donorId = Number(req.params.id);
  const { hospitalId } = req.body;
  const db = readDB();

  const donor = db.donors.find(d => d.id === donorId);
  if (!donor) return res.status(404).json({ error: 'Donor not found' });

  const hospital = db.hospitals.find(h => h.id === hospitalId);
  if (!hospital) return res.status(404).json({ error: 'Hospital not found' });

  donor.hospitalAffiliation = hospital.id;
  donor.hospitalName = hospital.name;
  writeDB(db);

  res.json({
    message: `Donor ${donor.name} affiliated with ${hospital.name}.`,
    donor,
    hospital
  });
});

// DELETE /api/donors/:id — Delete donor record
router.delete('/:id', (req, res) => {
  const donorId = Number(req.params.id);
  const db = readDB();
  const initialLength = db.donors.length;
  db.donors = db.donors.filter(d => d.id !== donorId);

  if (db.donors.length === initialLength) {
    return res.status(404).json({ error: 'Donor not found' });
  }

  writeDB(db);
  res.json({ message: 'Donor removed successfully from dispatch registry', id: donorId });
});

module.exports = router;
