const express = require('express');
const { readDB, writeDB } = require('../db');
const { hashPassword, verifyPassword, generateToken, verifyToken } = require('../services/authService');

const router = express.Router();

// Middleware: Authenticate JWT Bearer token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Authentication token required' });

  const decoded = verifyToken(token);
  if (!decoded) return res.status(403).json({ error: 'Invalid or expired token' });

  req.user = decoded;
  next();
}

// GET /api/auth/demo-accounts — Preconfigured 1-click demo profiles
router.get('/demo-accounts', (req, res) => {
  res.json([
    {
      role: 'hospital',
      title: 'Trauma Clinician / ER Doctor',
      email: 'doctor@sfgeneral.org',
      password: 'doctor123',
      name: 'Dr. Evelyn Vance, MD',
      hospital: 'SF General Trauma Center',
      description: 'Trigger STAT trauma protocols, manage hospital bank reserves & receive rooftop drone payloads.'
    },
    {
      role: 'donor',
      title: 'Verified O- Hero Donor',
      email: 'marcus@lifestream.org',
      password: 'donor123',
      name: 'Marcus Vance',
      bloodType: 'O-',
      description: 'Universal Red Cell Vanguard, 15 donations, instant dispatch alerts & appointment scheduling.'
    },
    {
      role: 'patient',
      title: 'Emergency Patient / Requester',
      email: 'robert@martinez.com',
      password: 'patient123',
      name: 'Robert Martinez',
      bloodType: 'O-',
      description: 'Track live emergency blood orders, multi-step Amazon-style cold-chain delivery timeline.'
    },
    {
      role: 'admin',
      title: 'Fleet Operations Commander',
      email: 'admin@lifestream.org',
      password: 'admin123',
      name: 'Chief Logistics Officer Alex Sterling',
      description: 'Full root telemetry command, fleet monitoring, donor verifications & emergency alert broadcasts.'
    }
  ]);
});

// GET /api/auth/donor-pass — Digital NFC Google Wallet Pass data
router.get('/donor-pass', (req, res) => {
  const db = readDB();
  const donor = (db.donors || [])[0] || {
    name: 'Marcus Vance',
    bloodType: 'O-',
    totalDonations: 15,
    reliabilityScore: 98,
    isVerified: true
  };

  const estimatedLivesSaved = (donor.totalDonations || 1) * 3;
  const nextEligibleDate = new Date(Date.now() + 86400000 * 28).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  res.json({
    passId: `PASS-NFC-${Date.now().toString().slice(-6)}`,
    passHolderName: donor.name,
    bloodType: donor.bloodType,
    phenotype: 'RhD+ | Kell(K-) | C+ c+ E- e+',
    donorTier: donor.totalDonations > 10 ? 'PLATINUM GUARDIAN' : 'GOLD LIFESAVER',
    totalDonations: donor.totalDonations || 15,
    estimatedLivesSaved,
    reliabilityScore: donor.reliabilityScore || 98,
    nextEligibleDate,
    nfcTagId: `04:A2:88:1B:3E:90`,
    barcode: `W982400192841`,
    verifiedBy: 'American Red Cross & Google Health LifeStream Registry',
    qrPayload: `LIFESTREAM:PASS:${donor.name}:${donor.bloodType}:VERIFIED`
  });
});

// POST /api/auth/login — User login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const db = readDB();
  const user = (db.users || []).find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || !verifyPassword(password, user.passwordHash, user.salt)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    bloodType: user.bloodType,
    hospitalId: user.hospitalId
  });

  const { passwordHash, salt, ...safeUser } = user;

  res.json({
    token,
    user: safeUser
  });
});

// POST /api/auth/register — User registration
router.post('/register', (req, res) => {
  const { name, email, password, role, bloodType, phone, hospitalId } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const db = readDB();
  if (!db.users) db.users = [];

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) return res.status(400).json({ error: 'An account with this email already exists' });

  const { hash, salt } = hashPassword(password);
  const userRole = role || 'patient';

  const newUser = {
    id: `USR-${Date.now().toString().slice(-6)}`,
    name,
    email: email.toLowerCase(),
    passwordHash: hash,
    salt,
    role: userRole,
    bloodType: bloodType ? bloodType.toUpperCase() : 'O-',
    phone: phone || '+1 415-555-0100',
    hospitalId: hospitalId || 'HOSP-01',
    createdAt: new Date().toISOString()
  };

  // If registering as a donor, also link into donor registry
  if (userRole === 'donor') {
    if (!db.donors) db.donors = [];
    const newDonor = {
      id: Date.now(),
      name,
      bloodType: newUser.bloodType,
      phone: newUser.phone,
      lastDonation: null,
      lat: 37.7749 + (Math.random() - 0.5) * 0.05,
      lng: -122.4194 + (Math.random() - 0.5) * 0.05,
      isVerified: true,
      reliabilityScore: 92,
      totalDonations: 0,
      badges: ['New Recruit']
    };
    db.donors.unshift(newDonor);
    newUser.donorId = newDonor.id;
  }

  db.users.push(newUser);
  writeDB(db);

  const token = generateToken({
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
    bloodType: newUser.bloodType,
    hospitalId: newUser.hospitalId
  });

  const { passwordHash: ph, salt: s, ...safeUser } = newUser;

  res.status(201).json({
    token,
    user: safeUser
  });
});

// GET /api/auth/me — Current authenticated user profile
router.get('/me', authenticateToken, (req, res) => {
  const db = readDB();
  const user = (db.users || []).find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { passwordHash, salt, ...safeUser } = user;
  res.json(safeUser);
});

// PATCH /api/auth/profile — Update user profile details
router.patch('/profile', authenticateToken, (req, res) => {
  const db = readDB();
  const user = (db.users || []).find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { name, phone, bloodType, availabilityStatus, emergencyContact, medicalNotes, lat, lng } = req.body;

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (bloodType !== undefined) user.bloodType = bloodType.toUpperCase();
  if (availabilityStatus !== undefined) user.availabilityStatus = availabilityStatus;
  if (emergencyContact !== undefined) user.emergencyContact = emergencyContact;
  if (medicalNotes !== undefined) user.medicalNotes = medicalNotes;
  if (lat !== undefined) user.lat = Number(lat);
  if (lng !== undefined) user.lng = Number(lng);

  // If user is donor, update corresponding donor record
  if (user.donorId) {
    const donor = (db.donors || []).find(d => d.id === user.donorId);
    if (donor) {
      if (name !== undefined) donor.name = name;
      if (phone !== undefined) donor.phone = phone;
      if (bloodType !== undefined) donor.bloodType = bloodType.toUpperCase();
      if (lat !== undefined) donor.lat = Number(lat);
      if (lng !== undefined) donor.lng = Number(lng);
    }
  }

  writeDB(db);

  const { passwordHash, salt, ...safeUser } = user;
  res.json(safeUser);
});

// POST /api/auth/change-password — Update password
router.post('/change-password', authenticateToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }

  const db = readDB();
  const user = (db.users || []).find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (!verifyPassword(currentPassword, user.passwordHash, user.salt)) {
    return res.status(400).json({ error: 'Incorrect current password' });
  }

  const { hash, salt } = hashPassword(newPassword);
  user.passwordHash = hash;
  user.salt = salt;
  writeDB(db);

  res.json({ message: 'Password updated successfully' });
});

// GET /api/auth/appointments — List appointments for current user/donor
router.get('/appointments', (req, res) => {
  const db = readDB();
  res.json(db.appointments || []);
});

// POST /api/auth/appointments — Schedule donation appointment
router.post('/appointments', (req, res) => {
  const { donorName, hospitalId, date, timeSlot, donationType } = req.body;
  const db = readDB();
  const hospital = (db.hospitals || []).find(h => h.id === hospitalId) || db.hospitals[0];

  const newAppt = {
    id: `APT-${Date.now().toString().slice(-4)}`,
    donorName: donorName || 'Voluntary Donor',
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    date: date || new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    timeSlot: timeSlot || '10:00 AM',
    donationType: donationType || 'Whole Blood',
    status: 'Confirmed',
    createdAt: new Date().toISOString()
  };

  if (!db.appointments) db.appointments = [];
  db.appointments.unshift(newAppt);
  writeDB(db);

  res.status(201).json(newAppt);
});

module.exports = { router, authenticateToken };
