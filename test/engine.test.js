const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getDistanceMiles,
  calculateMatchScore,
  WHOLE_BLOOD_DONOR_COMPATIBILITY,
  PLASMA_DONOR_COMPATIBILITY
} = require('../src/services/matchingEngine');
const { updateDispatchPosition } = require('../src/services/telemetry');

test('Haversine Geospatial Distance Calculation', () => {
  // SF General Hospital to UCSF Parnassus
  const dist = getDistanceMiles(37.7557, -122.4044, 37.7631, -122.4578);
  assert.ok(dist > 2.5 && dist < 3.5, `Distance should be ~3.0 miles, got ${dist.toFixed(2)}`);

  // Same coordinates should yield 0 miles
  const zeroDist = getDistanceMiles(37.7557, -122.4044, 37.7557, -122.4044);
  assert.equal(zeroDist, 0, 'Distance between identical points must be 0');
});

test('Clinical Red Blood Cell Compatibility Matrix (Universal Donor Rules)', () => {
  const oNegRecipients = WHOLE_BLOOD_DONOR_COMPATIBILITY['O-'];
  assert.equal(oNegRecipients.length, 8, 'O- must be universal red cell donor compatible with all 8 types');
  assert.ok(oNegRecipients.includes('AB+'));
  assert.ok(oNegRecipients.includes('O-'));

  const abPosRecipients = WHOLE_BLOOD_DONOR_COMPATIBILITY['AB+'];
  assert.equal(abPosRecipients.length, 1, 'AB+ whole blood is only compatible with AB+ recipients');
  assert.equal(abPosRecipients[0], 'AB+');
});

test('Clinical Plasma Compatibility Matrix (Universal Plasma Rules)', () => {
  const abPosPlasmaRecipients = PLASMA_DONOR_COMPATIBILITY['AB+'];
  assert.equal(abPosPlasmaRecipients.length, 8, 'AB+ must be universal plasma donor to all 8 blood types');

  const oNegPlasmaRecipients = PLASMA_DONOR_COMPATIBILITY['O-'];
  assert.equal(oNegPlasmaRecipients.length, 2, 'O- plasma is only compatible with O- and O+');
});

test('AI Donor Proximity & Reliability Scoring Engine', () => {
  const standardDonor = {
    lat: 37.7560,
    lng: -122.4050,
    reliabilityScore: 90,
    totalDonations: 8,
    isVerified: true,
    bloodType: 'O-'
  };

  const resNonCritical = calculateMatchScore(standardDonor, 37.7557, -122.4044, false);
  const resCritical = calculateMatchScore(standardDonor, 37.7557, -122.4044, true);

  assert.ok(resNonCritical.score >= 30 && resNonCritical.score <= 99, 'Score must be in valid [30, 99] bounds');
  assert.ok(resCritical.score >= resNonCritical.score, 'STAT critical emergency should boost match priority');
  assert.ok(typeof resNonCritical.distanceMiles === 'number', 'Should compute distanceMiles');
});

test('Cold-Chain IoT Thermal Regulation Simulation', () => {
  const mockDispatch = {
    status: 'In Transit',
    currentLat: 37.7557,
    currentLng: -122.4044,
    targetLat: 37.7631,
    targetLng: -122.4578,
    tempCelsius: 4.0,
    transportType: 'Autonomous Drone',
    batteryPct: 95
  };

  const updated = updateDispatchPosition(mockDispatch);

  // Biological safe window: 2.0°C to 6.0°C
  assert.ok(
    updated.tempCelsius >= 2.0 && updated.tempCelsius <= 6.0,
    `Cold-chain temperature must remain strictly within 2.0°C - 6.0°C, got ${updated.tempCelsius}°C`
  );
  assert.ok(updated.altitudeMeters >= 120 && updated.altitudeMeters <= 185, 'Drone altitude in FAA corridor');
  assert.ok(updated.batteryPct <= 95, 'Battery should consume energy during flight');
});

const {
  haversineDistanceKm,
  distancePointToSegmentKm,
  calculateAirspaceReroute,
  generateATCClearance,
  generateCustodyPassport
} = require('../src/services/airspaceEngine');

test('Autonomous Airspace Dynamic Obstacle Detection & Waypoint Bypass Engine', () => {
  const origin = { lat: 37.7650, lng: -122.4180 };
  const destination = { lat: 37.7558, lng: -122.4047 };

  // 1. Direct route with no obstacles
  const nominalRoute = calculateAirspaceReroute(origin, destination, []);
  assert.equal(nominalRoute.rerouted, false);
  assert.equal(nominalRoute.intersectingObstaclesCount, 0);
  assert.equal(nominalRoute.waypoints.length, 2);
  assert.ok(nominalRoute.directDistKm > 1.0 && nominalRoute.directDistKm < 2.5);

  // 2. Obstacle placed directly in corridor
  const obstacleInPath = {
    id: 'OBS-TEST-1',
    type: 'HIGH_WIND_MICROBURST',
    center: { lat: 37.7604, lng: -122.4113 }, // directly between origin and dest
    radiusMeters: 600,
    description: 'Test Microburst Hazard'
  };

  const rerouted = calculateAirspaceReroute(origin, destination, [obstacleInPath]);
  assert.equal(rerouted.rerouted, true);
  assert.equal(rerouted.intersectingObstaclesCount, 1);
  assert.ok(rerouted.waypoints.length >= 3, 'Must inject bypass waypoint');
  assert.ok(rerouted.totalPathDistKm >= rerouted.directDistKm, 'Bypass path distance >= direct distance');
  assert.ok(rerouted.revisedEtaMin >= rerouted.directEtaMin, 'Revised ETA reflects detour');
  assert.ok(rerouted.isColdChainSafe, 'Cold chain must remain within 2.0°C - 6.0°C limits during detour');
  assert.ok(rerouted.peltierCoolingWatts >= 38.0, 'Peltier active cooling power should compensate for detour');
});

test('FAA Part 135 ATC Clearances & Aviation Radio Synthesis Engine', () => {
  const mockDrone = 'LifeStream Lifter-01';
  const dest = { name: 'SF General Trauma Heliport' };

  // Nominal clearance
  const nominalClearance = generateATCClearance(mockDrone, null, dest, { rerouted: false });
  assert.equal(nominalClearance.callsign, mockDrone);
  assert.ok(nominalClearance.squawk.length === 4, 'Squawk code must be 4 digits');
  assert.equal(nominalClearance.altitudeAssignmentMeters, 120);
  assert.ok(nominalClearance.radioClearanceText.includes('Bay Approach'));
  assert.equal(nominalClearance.faaPart135Compliant, true);

  // Rerouted clearance with bypass directive
  const mockReroutePlan = {
    rerouted: true,
    waypoints: [
      { name: 'ORIGIN', isBypass: false },
      { name: 'WP-WEATHER-BYPASS-1', isBypass: true },
      { name: 'DEST', isBypass: false }
    ]
  };
  const bypassClearance = generateATCClearance(mockDrone, null, dest, mockReroutePlan);
  assert.equal(bypassClearance.altitudeAssignmentMeters, 150);
  assert.ok(bypassClearance.radioClearanceText.includes('WP-WEATHER-BYPASS-1'));
  assert.ok(bypassClearance.flightDirectives.some(d => d.includes('WP-WEATHER-BYPASS-1')));
});

test('Cryptographic SHA-256 Cold-Chain Chain of Custody (CoC) Passport Engine', () => {
  const payload = {
    bloodType: 'O-',
    component: 'Packed Red Blood Cells (PRBC)',
    units: 4
  };

  const passport = generateCustodyPassport('DRONE-V5-ALPHA', payload, 3.8);
  assert.ok(passport.passportId.startsWith('COC-PASS-'));
  assert.ok(passport.batchHash.startsWith('0x'));
  assert.equal(passport.batchHash.length, 66); // 0x + 64 hex characters
  assert.equal(passport.phlebotomySealVerified, true);
  assert.equal(passport.thermalBoundaryLog.status, 'CERTIFIED_WITHIN_LIMITS');
  assert.ok(passport.digitalSignature.startsWith('SHA256:ECDSA:'));
});

