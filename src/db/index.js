/**
 * LifeStream V3 - Data Persistence & Store
 */
const fs = require('fs');
const path = require('path');

const IS_VERCEL = process.env.VERCEL === '1';
const DB_PATH = IS_VERCEL ? path.join('/tmp', 'db.json') : path.join(__dirname, '../../db.json');

const INITIAL_DATA = {
  hospitals: [
    { id: 'HOSP-01', name: 'SF General Emergency Hospital', lat: 37.7749, lng: -122.4194, inventory: { 'O-': 2, 'O+': 5, 'A+': 8, 'A-': 3, 'B+': 4, 'B-': 1, 'AB+': 6, 'AB-': 2 } },
    { id: 'HOSP-02', name: 'UCSF Medical Center', lat: 37.7631, lng: -122.4578, inventory: { 'O-': 0, 'O+': 3, 'A+': 6, 'A-': 1, 'B+': 2, 'B-': 0, 'AB+': 4, 'AB-': 1 } },
    { id: 'HOSP-03', name: 'St. Mary Regional Medical Center', lat: 37.7735, lng: -122.4539, inventory: { 'O-': 1, 'O+': 4, 'A+': 5, 'A-': 2, 'B+': 3, 'B-': 1, 'AB+': 3, 'AB-': 0 } },
  ],
  donors: [
    { id: 1, name: 'John Doe', bloodType: 'O-', phone: '+1 415-555-0192', lastDonation: '2025-01-01', lat: 37.7749, lng: -122.4194, isVerified: true, reliabilityScore: 98, totalDonations: 12 },
    { id: 2, name: 'Jane Smith', bloodType: 'A+', phone: '+1 415-555-0183', lastDonation: '2026-05-01', lat: 37.7849, lng: -122.4094, isVerified: true, reliabilityScore: 85, totalDonations: 4 },
    { id: 3, name: 'Alex River', bloodType: 'O+', phone: '+1 415-555-0144', lastDonation: '2025-08-01', lat: 37.7649, lng: -122.4294, isVerified: true, reliabilityScore: 92, totalDonations: 9 },
    { id: 4, name: 'Sarah Connor', bloodType: 'AB+', phone: '+1 415-555-0175', lastDonation: '2026-01-01', lat: 37.7949, lng: -122.3994, isVerified: false, reliabilityScore: 70, totalDonations: 2 },
    { id: 5, name: 'Marcus Vance', bloodType: 'O-', phone: '+1 415-555-0166', lastDonation: '2025-03-15', lat: 37.7550, lng: -122.4350, isVerified: true, reliabilityScore: 96, totalDonations: 15 },
    { id: 6, name: 'Elena Rostova', bloodType: 'B+', phone: '+1 415-555-0121', lastDonation: '2025-11-20', lat: 37.7810, lng: -122.4380, isVerified: true, reliabilityScore: 90, totalDonations: 7 },
    { id: 7, name: 'David Kim', bloodType: 'A-', phone: '+1 415-555-0138', lastDonation: '2025-06-10', lat: 37.7690, lng: -122.4050, isVerified: true, reliabilityScore: 94, totalDonations: 11 },
  ],
  dispatches: [],
  alerts: [
    { id: 'ALT-101', hospitalId: 'HOSP-02', bloodType: 'O-', urgency: 'critical', message: 'Critical O- Universal Donor shortage for trauma emergency.', createdAt: new Date().toISOString() }
  ]
};

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    writeDB(INITIAL_DATA);
    return INITIAL_DATA;
  }
  try {
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    if (!data.hospitals) data.hospitals = INITIAL_DATA.hospitals;
    if (!data.donors) data.donors = INITIAL_DATA.donors;
    if (!data.dispatches) data.dispatches = [];
    if (!data.alerts) data.alerts = INITIAL_DATA.alerts;
    return data;
  } catch (e) {
    writeDB(INITIAL_DATA);
    return INITIAL_DATA;
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.warn(`[DB WARNING] Failed to write to ${DB_PATH}:`, err.message);
  }
}

module.exports = { readDB, writeDB };
