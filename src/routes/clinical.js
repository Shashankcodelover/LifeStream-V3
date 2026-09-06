const express = require('express');
const { readDB } = require('../db');
const {
  BLOOD_COMPONENTS,
  checkAntigenCompatibility,
  calculateMTPBundle,
  generateShortageForecast,
  generateCustodySeal
} = require('../services/clinicalEngine');

const router = express.Router();

// GET /api/clinical/components — Return specs for all blood components
router.get('/components', (req, res) => {
  res.json(BLOOD_COMPONENTS);
});

// POST /api/clinical/antigen-crossmatch — Extended Rh & Kell Phenotype matching
router.post('/antigen-crossmatch', (req, res) => {
  const { donorPhenotype, recipientPhenotype } = req.body;
  const result = checkAntigenCompatibility(donorPhenotype, recipientPhenotype);
  res.json(result);
});

// POST /api/clinical/mtp-calculate — Massive Transfusion Protocol 1:1:1 bundle generator
router.post('/mtp-calculate', (req, res) => {
  const { traumaSeverity, estimatedBloodLossMl, patientWeightKg } = req.body;
  const bundle = calculateMTPBundle(traumaSeverity, estimatedBloodLossMl, patientWeightKg);
  res.json(bundle);
});

// GET /api/clinical/shortage-forecast — 7-day regional AI predictive shortage forecast
router.get('/shortage-forecast', (req, res) => {
  const db = readDB();
  const forecast = generateShortageForecast(db.hospitals || []);
  res.json(forecast);
});

// GET /api/clinical/verify-seal/:hash — Cryptographic validation of digital custody seal
router.get('/verify-seal/:hash', (req, res) => {
  const { hash } = req.params;
  const db = readDB();

  const foundDispatch = (db.dispatches || []).find(d => 
    (d.custodySeal && d.custodySeal.custodySealHash === hash) ||
    (d.custodySealHash === hash)
  );

  if (!foundDispatch) {
    return res.status(404).json({
      valid: false,
      message: 'Cryptographic hash not found on regional ledger. Possible counterfeit or corrupted token.'
    });
  }

  res.json({
    valid: true,
    message: 'Cryptographic Proof-of-Custody Verified against SHA-256 Ledger.',
    dispatchId: foundDispatch.id,
    bloodType: foundDispatch.donorBloodType,
    verifiedAt: new Date().toISOString(),
    intakeStatus: foundDispatch.status
  });
});

module.exports = router;
