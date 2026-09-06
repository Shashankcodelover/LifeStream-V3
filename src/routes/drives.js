const express = require('express');
const { readDB, writeDB } = require('../db');

const router = express.Router();

// Sample regional mobile blood donation drives
const DEFAULT_DRIVES = [
  {
    id: 'DRV-101',
    title: 'Mission District Trauma Center Mobile Bus',
    organization: 'Google Health & SF General Blood Bank',
    address: '24th St & Mission St, San Francisco, CA',
    lat: 37.7522,
    lng: -122.4184,
    date: '2026-09-12',
    time: '09:00 AM - 04:00 PM',
    targetUnits: 45,
    registeredDonors: 32,
    acceptingTypes: ['O-', 'O+', 'A-', 'B-'],
    incentive: 'Free Comprehensive Health Panel & Digital Hero Pass'
  },
  {
    id: 'DRV-102',
    title: 'Silicon Valley Tech Campus Blood Drive',
    organization: 'LifeStream Community Lifesavers',
    address: '1600 Amphitheatre Pkwy, Mountain View, CA',
    lat: 37.4220,
    lng: -122.0841,
    date: '2026-09-15',
    time: '10:00 AM - 05:00 PM',
    targetUnits: 70,
    registeredDonors: 58,
    acceptingTypes: ['All Blood Types', 'Platelets (Apheresis)'],
    incentive: 'Priority Trauma Guardian Status + Google Hero Badge'
  },
  {
    id: 'DRV-103',
    title: 'Golden Gate Park Weekend Rapid Drive',
    organization: 'California Trauma Network & UCSF',
    address: 'Kezar Stadium Concourse, San Francisco, CA',
    lat: 37.7671,
    lng: -122.4566,
    date: '2026-09-20',
    time: '08:30 AM - 03:30 PM',
    targetUnits: 50,
    registeredDonors: 24,
    acceptingTypes: ['O- (Emergency Focus)', 'A+', 'B+'],
    incentive: 'Free Hemoglobin & Lipid Screening'
  }
];

// GET /api/drives — List upcoming regional mobile blood drives
router.get('/', (req, res) => {
  const db = readDB();
  if (!db.drives) {
    db.drives = DEFAULT_DRIVES;
    writeDB(db);
  }
  res.json(db.drives);
});

// POST /api/drives/:id/rsvp — RSVP for a community blood drive
router.post('/:id/rsvp', (req, res) => {
  const { donorName, bloodType, phone, timeSlot } = req.body;
  const db = readDB();
  if (!db.drives) db.drives = DEFAULT_DRIVES;

  const drive = db.drives.find(d => d.id === req.params.id);
  if (!drive) return res.status(404).json({ error: 'Blood drive event not found' });

  drive.registeredDonors = (drive.registeredDonors || 0) + 1;

  const rsvp = {
    id: `RSVP-${Date.now().toString().slice(-5)}`,
    driveId: drive.id,
    driveTitle: drive.title,
    donorName: donorName || 'Voluntary Lifesaver',
    bloodType: bloodType || 'O-',
    timeSlot: timeSlot || '10:30 AM',
    qrPassCode: `PASS-DRV-${drive.id}-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString()
  };

  if (!db.driveRSVPs) db.driveRSVPs = [];
  db.driveRSVPs.push(rsvp);

  writeDB(db);

  res.status(201).json({
    message: `RSVP confirmed for ${drive.title}! Digital pass generated.`,
    rsvp
  });
});

module.exports = router;
