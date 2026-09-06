const express = require('express');
const { readDB, writeDB } = require('../db');
const {
  CANDIDATE_TALENT_POOL,
  ENTERPRISE_SUBSCRIPTION_TIERS,
  filterCandidates,
  provisionEnterpriseLicense
} = require('../services/recruiterEngine');

const router = express.Router();

// GET /api/recruiter/candidates — Query candidate talent pipeline
router.get('/candidates', (req, res) => {
  const { minPercentile, badge, specialty, q } = req.query;

  const candidates = filterCandidates({
    minPercentile: minPercentile ? Number(minPercentile) : 0,
    badge: badge || 'ALL',
    specialty: specialty || 'ALL',
    searchQuery: q || ''
  });

  const avgPercentile = candidates.length > 0
    ? Number((candidates.reduce((sum, c) => sum + c.percentile, 0) / candidates.length).toFixed(1))
    : 0;

  res.json({
    totalTalentCount: CANDIDATE_TALENT_POOL.length,
    matchedCount: candidates.length,
    averagePercentile: avgPercentile,
    candidates
  });
});

// GET /api/recruiter/candidates/:id — Candidate Detailed Dossier
router.get('/candidates/:id', (req, res) => {
  const candidate = CANDIDATE_TALENT_POOL.find(c => c.id === req.params.id);
  if (!candidate) {
    return res.status(404).json({ error: `Candidate ${req.params.id} not found.` });
  }

  res.json({ candidate });
});

// GET /api/recruiter/tiers — Enterprise B2B Subscription Tiers
router.get('/tiers', (req, res) => {
  res.json({
    tiers: ENTERPRISE_SUBSCRIPTION_TIERS
  });
});

// POST /api/recruiter/subscribe — Enterprise B2B License Procurement
router.post('/subscribe', (req, res) => {
  const { tierId, organizationName, contactEmail } = req.body;

  if (!organizationName || !contactEmail) {
    return res.status(400).json({ error: 'Organization name and contact email are required.' });
  }

  const licenseRecord = provisionEnterpriseLicense(tierId, organizationName, contactEmail);

  // Persist to database
  const db = readDB();
  if (!db.enterpriseLicenses) db.enterpriseLicenses = [];
  db.enterpriseLicenses.unshift(licenseRecord);
  writeDB(db);

  res.status(201).json({
    message: `Enterprise License successfully provisioned for ${organizationName}.`,
    license: licenseRecord
  });
});

module.exports = router;
