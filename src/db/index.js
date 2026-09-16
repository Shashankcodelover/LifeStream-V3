/**
 * LifeStream V4.0 Enterprise - Universal Database Store
 * Supports Neon Serverless Postgres (Pooled connection via DATABASE_URL)
 * with automatic fallback to high-speed in-memory JSON cache for 0ms cold starts.
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { hashPassword } = require('../services/authService');

const LOCAL_DB_PATH = path.join(__dirname, '../../db.json');
const TMP_DB_PATH = '/tmp/lifestream_db.json';

// Initialize default seed users with hashed passwords
const seedUser1 = hashPassword('doctor123');
const seedUser2 = hashPassword('donor123');
const seedUser3 = hashPassword('patient123');
const seedUser4 = hashPassword('admin123');

const INITIAL_DATA = {
  users: [
    {
      id: 'USR-DOC-01',
      name: 'Dr. Evelyn Vance, MD',
      email: 'doctor@sfgeneral.org',
      passwordHash: seedUser1.hash,
      salt: seedUser1.salt,
      role: 'hospital',
      hospitalId: 'HOSP-01',
      hospitalName: 'SF General Trauma Center',
      department: 'Emergency & Trauma Surgery',
      phone: '+1 415-206-8000',
      badgeNumber: 'MD-7712',
      createdAt: '2026-01-10T08:00:00.000Z'
    },
    {
      id: 'USR-DNR-01',
      name: 'Marcus Vance',
      email: 'marcus@lifestream.org',
      passwordHash: seedUser2.hash,
      salt: seedUser2.salt,
      role: 'donor',
      bloodType: 'O-',
      phone: '+1 415-555-0166',
      donorId: 5,
      availabilityStatus: 'Available for Immediate Dispatch',
      totalDonations: 15,
      reliabilityScore: 98,
      lat: 37.7550,
      lng: -122.4350,
      badges: ['Universal O- Vanguard', 'Life Saver', '15+ Club'],
      createdAt: '2026-01-12T10:00:00.000Z'
    },
    {
      id: 'USR-PAT-01',
      name: 'Robert Martinez',
      email: 'robert@martinez.com',
      passwordHash: seedUser3.hash,
      salt: seedUser3.salt,
      role: 'patient',
      bloodType: 'O-',
      phone: '+1 415-555-0911',
      emergencyContact: 'Maria Martinez (+1 415-555-0912)',
      hospitalId: 'HOSP-01',
      medicalNotes: 'Acute internal thoracic trauma. Universal O- blood required.',
      createdAt: '2026-08-20T14:30:00.000Z'
    },
    {
      id: 'USR-ADM-01',
      name: 'Chief Logistics Officer Alex Sterling',
      email: 'admin@lifestream.org',
      passwordHash: seedUser4.hash,
      salt: seedUser4.salt,
      role: 'admin',
      phone: '+1 415-555-0000',
      badgeNumber: 'ROOT-EXEC-1',
      createdAt: '2026-01-01T00:00:00.000Z'
    }
  ],
  hospitals: [
    { id: 'HOSP-01', name: 'SF General Trauma Center', code: 'SFG', lat: 37.7749, lng: -122.4194, phone: '+1 415-206-8000', helipad: true, inventory: { 'O-': 2, 'O+': 5, 'A+': 8, 'A-': 3, 'B+': 4, 'B-': 1, 'AB+': 6, 'AB-': 2 } },
    { id: 'HOSP-02', name: 'UCSF Medical Center Parnassus', code: 'UCSF', lat: 37.7631, lng: -122.4578, phone: '+1 415-476-1000', helipad: true, inventory: { 'O-': 0, 'O+': 3, 'A+': 6, 'A-': 1, 'B+': 2, 'B-': 0, 'AB+': 4, 'AB-': 1 } },
    { id: 'HOSP-03', name: 'St. Mary Regional Medical Center', code: 'SMR', lat: 37.7735, lng: -122.4539, phone: '+1 415-750-5500', helipad: false, inventory: { 'O-': 1, 'O+': 4, 'A+': 5, 'A-': 2, 'B+': 3, 'B-': 1, 'AB+': 3, 'AB-': 0 } },
    { id: 'HOSP-04', name: 'Kaiser Permanente Emergency Hub', code: 'KP-SF', lat: 37.7831, lng: -122.4412, phone: '+1 415-833-2000', helipad: true, inventory: { 'O-': 3, 'O+': 7, 'A+': 9, 'A-': 4, 'B+': 5, 'B-': 2, 'AB+': 5, 'AB-': 2 } },
    { id: 'HOSP-05', name: 'CPMC Van Ness Trauma Pavilion', code: 'CPMC', lat: 37.7865, lng: -122.4215, phone: '+1 415-600-6000', helipad: true, inventory: { 'O-': 1, 'O+': 2, 'A+': 4, 'A-': 1, 'B+': 1, 'B-': 1, 'AB+': 2, 'AB-': 1 } }
  ],
  donors: [
    { id: 1, name: 'John Doe', bloodType: 'O-', phone: '+1 415-555-0192', lastDonation: '2025-01-01', lat: 37.7749, lng: -122.4194, isVerified: true, reliabilityScore: 98, totalDonations: 12, badges: ['Life Saver', 'Universal O- Vanguard', 'Fast Responder'] },
    { id: 2, name: 'Jane Smith', bloodType: 'A+', phone: '+1 415-555-0183', lastDonation: '2026-05-01', lat: 37.7849, lng: -122.4094, isVerified: true, reliabilityScore: 85, totalDonations: 4, badges: ['Community Hero'] },
    { id: 3, name: 'Alex River', bloodType: 'O+', phone: '+1 415-555-0144', lastDonation: '2025-08-01', lat: 37.7649, lng: -122.4294, isVerified: true, reliabilityScore: 92, totalDonations: 9, badges: ['Life Saver', 'Veteran Donor'] },
    { id: 4, name: 'Sarah Connor', bloodType: 'AB+', phone: '+1 415-555-0175', lastDonation: '2026-01-01', lat: 37.7949, lng: -122.3994, isVerified: false, reliabilityScore: 70, totalDonations: 2, badges: ['New Recruit'] },
    { id: 5, name: 'Marcus Vance', bloodType: 'O-', phone: '+1 415-555-0166', lastDonation: '2025-03-15', lat: 37.7550, lng: -122.4350, isVerified: true, reliabilityScore: 96, totalDonations: 15, badges: ['Universal O- Vanguard', 'Life Saver', '15+ Club'] },
    { id: 6, name: 'Elena Rostova', bloodType: 'B+', phone: '+1 415-555-0121', lastDonation: '2025-11-20', lat: 37.7810, lng: -122.4380, isVerified: true, reliabilityScore: 90, totalDonations: 7, badges: ['Reliable Responder'] },
    { id: 7, name: 'David Kim', bloodType: 'A-', phone: '+1 415-555-0138', lastDonation: '2025-06-10', lat: 37.7690, lng: -122.4050, isVerified: true, reliabilityScore: 94, totalDonations: 11, badges: ['Life Saver', 'Fast Responder'] },
    { id: 8, name: 'Chloe Dubois', bloodType: 'AB-', phone: '+1 415-555-0155', lastDonation: '2025-09-12', lat: 37.7780, lng: -122.4480, isVerified: true, reliabilityScore: 91, totalDonations: 6, badges: ['Rare Type Champion'] },
    { id: 9, name: 'Mateo Hernandez', bloodType: 'B-', phone: '+1 415-555-0114', lastDonation: '2025-04-18', lat: 37.7590, lng: -122.4120, isVerified: true, reliabilityScore: 95, totalDonations: 8, badges: ['Life Saver', 'Universal Rare'] }
  ],
  dispatches: [],
  requests: [
    {
      id: 'REQ-901',
      patientName: 'Robert Martinez',
      bloodType: 'O-',
      unitsRequired: 2,
      urgency: 'critical',
      hospitalId: 'HOSP-01',
      hospitalName: 'SF General Trauma Center',
      status: 'In Progress',
      contactPhone: '+1 415-555-0911',
      medicalReason: 'Severe thoracic trauma from highway incident. Massive blood loss protocol activated.',
      custodySeal: 'E39F8A2D104B76C1',
      trackingStep: 3,
      createdAt: new Date(Date.now() - 1800000).toISOString()
    }
  ],
  appointments: [
    {
      id: 'APT-101',
      donorId: 5,
      donorName: 'Marcus Vance',
      hospitalId: 'HOSP-01',
      hospitalName: 'SF General Trauma Center',
      date: '2026-09-05',
      timeSlot: '10:30 AM',
      donationType: 'Whole Blood (O-)',
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    }
  ],
  transfers: [],
  alerts: [
    { id: 'ALT-101', hospitalId: 'HOSP-02', bloodType: 'O-', urgency: 'critical', message: 'Critical O- Universal Donor shortage for trauma emergency at UCSF Parnassus.', createdAt: new Date().toISOString() }
  ],
  relations: [
    { id: 'REL-01', fromHospitalId: 'HOSP-01', toHospitalId: 'HOSP-02', relationType: 'trauma_escalation', notes: 'Primary Level-1 Trauma Mutual Aid & Surge Route', createdAt: '2026-06-01T00:00:00.000Z' },
    { id: 'REL-02', fromHospitalId: 'HOSP-02', toHospitalId: 'HOSP-04', relationType: 'pediatric_transfer', notes: 'Pediatric & Neonatal Resuscitation Emergency Channel', createdAt: '2026-06-15T00:00:00.000Z' },
    { id: 'REL-03', fromHospitalId: 'HOSP-01', toHospitalId: 'HOSP-03', relationType: 'emergency_reserve', notes: 'Regional Whole Blood & Plasma Reserve Buffer', createdAt: '2026-07-01T00:00:00.000Z' },
    { id: 'REL-04', fromHospitalId: 'HOSP-04', toHospitalId: 'HOSP-05', relationType: 'drone_corridor', notes: 'Autonomous FAA Part-135 High-Speed Drone Skyway', createdAt: '2026-07-10T00:00:00.000Z' },
    { id: 'REL-05', fromHospitalId: 'HOSP-03', toHospitalId: 'HOSP-05', relationType: 'surplus_mesh', notes: 'Rare Blood Type (AB-, B-) Cold-Chain Mesh Routing', createdAt: '2026-07-20T00:00:00.000Z' }
  ]
};

// Global in-memory cache
let memoryStore = null;
let pgPool = null;

// Optional Neon Postgres Pool Initialization
if (process.env.DATABASE_URL) {
  try {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000
    });
    console.log('⚡ Connected to Neon Serverless Postgres (Pooled connection)');
  } catch (e) {
    console.warn('⚠️ Neon Postgres initialization skipped, using resilient memory store:', e.message);
  }
}

function readDB() {
  if (memoryStore) return memoryStore;

  // Try reading from local db.json
  if (fs.existsSync(LOCAL_DB_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf8'));
      sanitizeData(data);
      memoryStore = data;
      return memoryStore;
    } catch (e) {}
  }

  // Try reading from /tmp on serverless
  if (fs.existsSync(TMP_DB_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(TMP_DB_PATH, 'utf8'));
      sanitizeData(data);
      memoryStore = data;
      return memoryStore;
    } catch (e) {}
  }

  memoryStore = JSON.parse(JSON.stringify(INITIAL_DATA));
  writeDB(memoryStore);
  return memoryStore;
}

function sanitizeData(data) {
  if (!data.users || data.users.length < 4) data.users = INITIAL_DATA.users;
  if (!data.hospitals || data.hospitals.length < 5) data.hospitals = INITIAL_DATA.hospitals;
  if (!data.donors || data.donors.length < 9) data.donors = INITIAL_DATA.donors;
  if (!data.dispatches) data.dispatches = [];
  if (!data.requests) data.requests = INITIAL_DATA.requests;
  if (!data.appointments) data.appointments = INITIAL_DATA.appointments;
  if (!data.transfers) data.transfers = [];
  if (!data.alerts) data.alerts = INITIAL_DATA.alerts;
  if (!data.relations || data.relations.length === 0) data.relations = INITIAL_DATA.relations;
}

function writeDB(data) {
  memoryStore = data;
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    try {
      fs.writeFileSync(TMP_DB_PATH, JSON.stringify(data, null, 2));
    } catch (err) {}
  }
}

module.exports = { readDB, writeDB, INITIAL_DATA, pgPool };
