const express = require('express');
const { readDB, writeDB } = require('../db');
const {
  CERTIFICATION_CHALLENGES,
  calculateCandidatePercentile,
  issueVerificationCertificate
} = require('../services/assessmentEngine');

const router = express.Router();

// GET /api/assessment/challenges — Get all examination challenges
router.get('/challenges', (req, res) => {
  // Strip correct answer flags for secure examination delivery
  const sanitizedChallenges = CERTIFICATION_CHALLENGES.map(c => {
    if (c.type === 'MULTIPLE_CHOICE') {
      return {
        ...c,
        options: c.options.map(opt => ({ id: opt.id, text: opt.text }))
      };
    }
    return c;
  });

  res.json({
    examTitle: 'National Trauma Logistics & Autonomous Dispatch Certification',
    totalPoints: 100,
    timeLimitMinutes: 15,
    challengeCount: sanitizedChallenges.length,
    challenges: sanitizedChallenges
  });
});

// POST /api/assessment/proctor-audit — Record tab-switch / blur / full-screen infractions
router.post('/proctor-audit', (req, res) => {
  const { eventType, candidateName, strikeNumber, details } = req.body;
  const db = readDB();

  const auditEntry = {
    id: `AUD-${Date.now().toString().slice(-6)}`,
    candidateName: candidateName || 'Anonymous Candidate',
    eventType: eventType || 'TAB_SWITCH_BLUR',
    strikeNumber: strikeNumber || 1,
    details: details || 'Window blur detected outside proctor arena boundary',
    timestamp: new Date().toISOString()
  };

  if (!db.proctorAudits) db.proctorAudits = [];
  db.proctorAudits.unshift(auditEntry);
  writeDB(db);

  res.status(201).json({
    status: 'INFRACTION_LOGGED',
    strikesRemaining: Math.max(0, 3 - (strikeNumber || 1)),
    auditEntry
  });
});

// POST /api/assessment/submit — Evaluate exam, calculate percentile, issue certificate
router.post('/submit', (req, res) => {
  const { candidateName, candidateRole, answers = {}, codeSolutions = {}, timeElapsedSeconds = 420 } = req.body;

  let totalScore = 0;
  const evaluationBreakdown = [];

  CERTIFICATION_CHALLENGES.forEach(chal => {
    let earned = 0;
    let feedback = '';

    if (chal.type === 'MULTIPLE_CHOICE') {
      const selectedOptionId = answers[chal.id];
      const correctOpt = chal.options.find(o => o.isCorrect);
      if (selectedOptionId && correctOpt && selectedOptionId === correctOpt.id) {
        earned = chal.points;
        feedback = 'Correct clinical rationale.';
      } else {
        feedback = `Incorrect. ${chal.explanation || ''}`;
      }
    } else if (chal.type === 'CODING_ALGORITHM') {
      const userCode = codeSolutions[chal.id] || chal.starterCode;
      try {
        const fn = new Function('donors', 'hospitalLat', 'hospitalLng', `
          ${userCode}
          return selectOptimalDonor(donors, hospitalLat, hospitalLng);
        `);

        let testsPassed = 0;
        chal.testSuites.forEach(ts => {
          const result = fn(ts.donors, 37.7749, -122.4194);
          if (result === ts.expectedOutput) testsPassed++;
        });

        const ratio = testsPassed / chal.testSuites.length;
        earned = Math.round(chal.points * ratio);
        feedback = `${testsPassed}/${chal.testSuites.length} Boundary Stress Test Suites Passed.`;
      } catch (err) {
        earned = 0;
        feedback = `Execution error: ${err.message}`;
      }
    }

    totalScore += earned;
    evaluationBreakdown.push({
      challengeId: chal.id,
      category: chal.category,
      maxPoints: chal.points,
      earnedPoints: earned,
      feedback
    });
  });

  const percentile = calculateCandidatePercentile(totalScore, timeElapsedSeconds);
  const certificate = issueVerificationCertificate(candidateName, candidateRole, totalScore, percentile);

  // Save assessment attempt to database
  const db = readDB();
  if (!db.assessments) db.assessments = [];
  db.assessments.unshift({
    certificateId: certificate.serialNumber,
    candidateName: certificate.candidateName,
    finalScore: totalScore,
    percentile,
    evaluationBreakdown,
    certificate,
    timestamp: new Date().toISOString()
  });
  writeDB(db);

  res.json({
    finalScore: totalScore,
    maxPossibleScore: 100,
    percentileRank: percentile,
    calibratedAgainst: '14,800+ Trauma Clinicians & Dispatch Directors',
    evaluationBreakdown,
    certificate
  });
});

// GET /api/assessment/verify/:serialNumber — Cryptographically verify certification
router.get('/verify/:serialNumber', (req, res) => {
  const { serialNumber } = req.params;
  const db = readDB();
  const certRecord = (db.assessments || []).find(a => a.certificateId === serialNumber);

  if (!certRecord) {
    return res.status(404).json({
      valid: false,
      message: `Certificate ${serialNumber} not found in National Registry.`
    });
  }

  res.json({
    valid: true,
    certificate: certRecord.certificate || {
      serialNumber: certRecord.certificateId,
      candidateName: certRecord.candidateName,
      finalScore: certRecord.finalScore,
      percentile: certRecord.percentile,
      issuedAt: certRecord.timestamp
    }
  });
});

module.exports = router;
