/**
 * traumaDroneNetwork.js
 * LifeStream Enterprise V5.0 - Trauma Center Priority Triage, Autonomous Drone Airspace & Inter-Hospital Swap Engine
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Regional Level 1 & Level 2 Trauma Centers
const TRAUMA_CENTERS = [
  {
    id: 'trauma-sfgh',
    name: 'Zuckerberg San Francisco General Hospital (SFGH)',
    level: 'Level 1 Adult & Pediatric Trauma Center',
    latitude: 37.7558,
    longitude: -122.4047,
    icuBedsAvailable: 8,
    totalIcuBeds: 32,
    bloodBankReserve: {
      'O-': 14,
      'O+': 28,
      'A-': 10,
      'A+': 35,
      'B-': 6,
      'B+': 18,
      'AB-': 4,
      'AB+': 12,
      platelets: 18,
      ffp: 42,
      cryo: 25
    },
    heliportStatus: 'ACTIVE_CLEAR',
    distanceKm: 4.2,
    estimatedDriveMin: 14.5,
    estimatedDroneMin: 4.8
  },
  {
    id: 'trauma-ucsf',
    name: 'UCSF Helen Diller Medical Center - Parnassus',
    level: 'Level 1 Comprehensive Academic Trauma Center',
    latitude: 37.7631,
    longitude: -122.4583,
    icuBedsAvailable: 12,
    totalIcuBeds: 48,
    bloodBankReserve: {
      'O-': 19,
      'O+': 32,
      'A-': 14,
      'A+': 40,
      'B-': 8,
      'B+': 22,
      'AB-': 5,
      'AB+': 15,
      platelets: 24,
      ffp: 55,
      cryo: 38
    },
    heliportStatus: 'ACTIVE_CLEAR',
    distanceKm: 7.8,
    estimatedDriveMin: 22.0,
    estimatedDroneMin: 6.9
  },
  {
    id: 'trauma-stanford',
    name: 'Stanford Health Care - Marc and Laura Andreessen ED',
    level: 'Level 1 Regional Trauma & Quaternary Center',
    latitude: 37.4348,
    longitude: -122.1755,
    icuBedsAvailable: 16,
    totalIcuBeds: 64,
    bloodBankReserve: {
      'O-': 26,
      'O+': 45,
      'A-': 18,
      'A+': 52,
      'B-': 12,
      'B+': 28,
      'AB-': 8,
      'AB+': 20,
      platelets: 36,
      ffp: 70,
      cryo: 50
    },
    heliportStatus: 'ACTIVE_CLEAR',
    distanceKm: 42.5,
    estimatedDriveMin: 55.0,
    estimatedDroneMin: 16.2
  },
  {
    id: 'trauma-cpmc',
    name: 'CPMC Van Ness Campus - Sutter Health',
    level: 'Level 2 Emergency Trauma Receiving Center',
    latitude: 37.7854,
    longitude: -122.4223,
    icuBedsAvailable: 5,
    totalIcuBeds: 24,
    bloodBankReserve: {
      'O-': 8,
      'O+': 20,
      'A-': 6,
      'A+': 25,
      'B-': 4,
      'B+': 12,
      'AB-': 2,
      'AB+': 8,
      platelets: 10,
      ffp: 28,
      cryo: 16
    },
    heliportStatus: 'MAINTENANCE_HOLD',
    distanceKm: 5.1,
    estimatedDriveMin: 16.0,
    estimatedDroneMin: 5.5
  }
];

// Active Autonomous Medical Drones
let ACTIVE_DRONE_FLEET = [
  {
    id: 'DRONE-V5-ALPHA',
    callsign: 'LifeStream Lifter-01',
    model: 'Zipline P2 Autonomous eVTOL Carrier',
    currentLocation: { lat: 37.7650, lng: -122.4180, altitudeMeters: 120 },
    destination: 'Zuckerberg SF General Hospital',
    destinationCoords: { lat: 37.7558, lng: -122.4047 },
    speedKmh: 110,
    batteryPercent: 88,
    payload: {
      bloodType: 'O-',
      component: 'pRBC 1:1:1 MTP Stage 1 Pack',
      units: 4,
      sealHash: '0xa4f28e9c1b753d08f72a912c'
    },
    coldChain: {
      temperatureCelsius: 3.8,
      minAllowable: 2.0,
      maxAllowable: 6.0,
      peltierWatts: 38.5,
      chamberPressureKpa: 101.3,
      status: 'OPTIMAL_COLD_CHAIN'
    },
    airspaceCorridor: 'Bay Area Airway Corridor Alpha-9',
    nfzAvoidanceActive: true,
    status: 'IN_FLIGHT_DELIVERY'
  },
  {
    id: 'DRONE-V5-BRAVO',
    callsign: 'LifeStream Lifter-02',
    model: 'Wingcopter 198 Heavy-Payload Medic',
    currentLocation: { lat: 37.7720, lng: -122.4450, altitudeMeters: 135 },
    destination: 'UCSF Helen Diller Medical Center',
    destinationCoords: { lat: 37.7631, lng: -122.4583 },
    speedKmh: 125,
    batteryPercent: 74,
    payload: {
      bloodType: 'AB-',
      component: 'Fresh Frozen Plasma (FFP)',
      units: 6,
      sealHash: '0x3c7b9e1a8f2d5046e819ac21'
    },
    coldChain: {
      temperatureCelsius: -19.4,
      minAllowable: -30.0,
      maxAllowable: -18.0,
      peltierWatts: 62.0,
      chamberPressureKpa: 101.2,
      status: 'OPTIMAL_CRYO_PLASMA'
    },
    airspaceCorridor: 'Twin Peaks Bypass Skyway-3',
    nfzAvoidanceActive: true,
    status: 'IN_FLIGHT_DELIVERY'
  }
];

// No Fly Zones (NFZ)
const NO_FLY_ZONES = [
  {
    id: 'nfz-sfo',
    name: 'SFO International Airport Class B Airspace',
    center: { lat: 37.6213, lng: -122.3790 },
    radiusMeters: 5500,
    minAltitude: 0,
    maxAltitude: 3000,
    severity: 'STRICT_RESTRICTED'
  },
  {
    id: 'nfz-sutro',
    name: 'Sutro Tower High-Tension Transmission Mast',
    center: { lat: 37.7552, lng: -122.4528 },
    radiusMeters: 800,
    minAltitude: 0,
    maxAltitude: 450,
    severity: 'PHYSICAL_OBSTACLE'
  },
  {
    id: 'nfz-financial',
    name: 'Salesforce Tower Urban Canyon Turbulence Zone',
    center: { lat: 37.7897, lng: -122.3972 },
    radiusMeters: 600,
    minAltitude: 0,
    maxAltitude: 350,
    severity: 'WIND_SHEAR_CORRIDOR'
  }
];

// Inter-Hospital Swaps Ledger
let ACTIVE_SWAP_RECORDS = [
  {
    id: 'SWAP-2026-089',
    requestingHospital: 'Zuckerberg San Francisco General Hospital',
    offeringHospital: 'Stanford Health Care',
    componentRequested: 'Platelets (Apheresis, Single Donor)',
    unitsRequested: 4,
    componentOffered: 'Packed Red Blood Cells (PRBC, O+)',
    unitsOffered: 6,
    reason: 'Critical Class IV Trauma Mass Casualty Surge',
    status: 'DISPATCH_IN_PROGRESS',
    timestamp: new Date().toISOString(),
    escrowVoucherHash: '0x992b8c4d1e2f3a5b6c7d8e9f0a1b2c3d4e5f6a7b'
  },
  {
    id: 'SWAP-2026-090',
    requestingHospital: 'CPMC Van Ness Campus',
    offeringHospital: 'UCSF Helen Diller Medical Center',
    componentRequested: 'Cryoprecipitate (A-)',
    unitsRequested: 10,
    componentOffered: 'Fresh Frozen Plasma (AB+)',
    unitsOffered: 4,
    reason: 'Postpartum Disseminated Intravascular Coagulation (DIC)',
    status: 'COMPLETED_VERIFIED',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    escrowVoucherHash: '0x441a7b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a'
  }
];

/**
 * POST /api/trauma-network/triage-assessment
 * Evaluates Shock Index, assigns ATLS Class I-IV Hemorrhagic Shock,
 * computes MTP components, and matches optimal Trauma Center destination.
 */
router.post('/triage-assessment', (req, res) => {
  try {
    const {
      patientAge = 34,
      heartRate = 128,
      systolicBp = 82,
      respiratoryRate = 28,
      lactateMmol = 4.8,
      gcs = 13,
      knownBloodType = 'UNKNOWN',
      mechanismOfInjury = 'High-Speed Motor Vehicle Collision'
    } = req.body;

    // Shock Index SI = HR / SBP
    const shockIndex = +(heartRate / systolicBp).toFixed(2);
    // Age Shock Index = SI * Age
    const ageShockIndex = +(shockIndex * patientAge).toFixed(1);

    // Hemorrhagic Shock Classification
    let shockClass = 'Class I';
    let estimatedBloodLossPercent = '< 15% (< 750 mL)';
    let mtpIndicated = false;
    let mtpPack = null;

    if (shockIndex >= 1.4 || systolicBp < 80 || lactateMmol >= 4.0) {
      shockClass = 'Class IV (Life-Threatening Exsanguination)';
      estimatedBloodLossPercent = '> 40% (> 2000 mL)';
      mtpIndicated = true;
      mtpPack = {
        stage: 'STAT MTP Stage 1 Exsanguination Pack',
        pRBCUnits: 6,
        pRBCSpec: 'Universal O-Negative Uncrossmatched',
        ffpUnits: 6,
        plateletUnits: 1, // 1 apheresis pack = 6 pooled units
        cryoprecipitateUnits: 10,
        txaDosage: '1g IV bolus over 10 min, followed by 1g infusion over 8 hrs',
        calciumChlorideDosage: '1g IV for every 4 units blood (hypocalcemia prevention)',
        targetRatio: '1:1:1 Balanced Hemostatic Resuscitation'
      };
    } else if (shockIndex >= 1.0 || systolicBp <= 90 || lactateMmol >= 2.5) {
      shockClass = 'Class III (Severe Hypoperfusion)';
      estimatedBloodLossPercent = '30% - 40% (1500 - 2000 mL)';
      mtpIndicated = true;
      mtpPack = {
        stage: 'MTP Stage 1 Balanced Pack',
        pRBCUnits: 4,
        pRBCSpec: 'Type-Specific or O-Negative',
        ffpUnits: 4,
        plateletUnits: 1,
        cryoprecipitateUnits: 0,
        txaDosage: '1g IV bolus over 10 min',
        calciumChlorideDosage: '1g IV',
        targetRatio: '1:1:1 Balanced Hemostatic Resuscitation'
      };
    } else if (shockIndex >= 0.75 || heartRate > 100) {
      shockClass = 'Class II (Moderate Vasoconstrictive Compensation)';
      estimatedBloodLossPercent = '15% - 30% (750 - 1500 mL)';
      mtpIndicated = false;
    } else {
      shockClass = 'Class I (Hemodynamically Stable)';
      estimatedBloodLossPercent = '< 15% (< 750 mL)';
      mtpIndicated = false;
    }

    // Rank Trauma Centers based on:
    // 0.40 * O-Neg reserve + 0.35 * ICU capacity + 0.25 * (1 / Drone ETA)
    const rankedTraumaCenters = TRAUMA_CENTERS.map(tc => {
      const oNegUnits = tc.bloodBankReserve['O-'] || 0;
      const icuScore = tc.icuBedsAvailable / tc.totalIcuBeds;
      const speedScore = 1 / (tc.estimatedDroneMin / 10);
      const compositeSuitabilityScore = +( (oNegUnits * 0.40) + (icuScore * 35) + (speedScore * 25) ).toFixed(1);

      return {
        ...tc,
        suitabilityScore: compositeSuitabilityScore,
        recommendedDestination: false
      };
    }).sort((a, b) => b.suitabilityScore - a.suitabilityScore);

    if (rankedTraumaCenters.length > 0) {
      rankedTraumaCenters[0].recommendedDestination = true;
    }

    res.json({
      success: true,
      triageEvaluation: {
        timestamp: new Date().toISOString(),
        shockIndex,
        ageShockIndex,
        shockClass,
        estimatedBloodLossPercent,
        lactateMmol,
        mtpIndicated,
        mtpPack,
        optimalTraumaCenter: rankedTraumaCenters[0],
        allRankedCenters: rankedTraumaCenters
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/trauma-network/drone-airspace
 * Returns live drone fleet telemetry, NFZs, and real-time cold chain metrics.
 */
router.get('/drone-airspace', (req, res) => {
  try {
    res.json({
      success: true,
      fleetCount: ACTIVE_DRONE_FLEET.length,
      activeDrones: ACTIVE_DRONE_FLEET,
      noFlyZones: NO_FLY_ZONES,
      telemetryStatus: 'ALL_FLIGHTS_NOMINAL'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/trauma-network/cross-match-matrix
 * Simulates Major & Minor Cross-Match and Indirect Antiglobulin Test (Coombs IAT)
 */
router.post('/cross-match-matrix', (req, res) => {
  try {
    const { donorBloodType, recipientBloodType, antibodiesScreened = [] } = req.body;

    // ABO/Rh Compatibility rules
    const RBC_COMPATIBILITY = {
      'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
      'O+': ['O+', 'A+', 'B+', 'AB+'],
      'A-': ['A-', 'A+', 'AB-', 'AB+'],
      'A+': ['A+', 'AB+'],
      'B-': ['B-', 'B+', 'AB-', 'AB+'],
      'B+': ['B+', 'AB+'],
      'AB-': ['AB-', 'AB+'],
      'AB+': ['AB+']
    };

    const isAboRhCompatible = (RBC_COMPATIBILITY[donorBloodType] || []).includes(recipientBloodType);

    // Minor Antigen Screen (Kell, Rh sub-antigens, Duffy, Kidd)
    const dangerousAntibodies = ['Anti-D', 'Anti-K', 'Anti-Fy(a)', 'Anti-Jk(a)'];
    const detectedIncompatibilities = antibodiesScreened.filter(ab => dangerousAntibodies.includes(ab));

    const isFullySafe = isAboRhCompatible && detectedIncompatibilities.length === 0;

    const coombsTestResult = isFullySafe ? 'NEGATIVE (No agglutination / No hemolysis)' : 'POSITIVE (Incompatible Agglutination Grade 3+)';
    const safetyToken = crypto.createHash('sha256').update(`${donorBloodType}:${recipientBloodType}:${isFullySafe}:${Date.now()}`).digest('hex');

    res.json({
      success: true,
      donorBloodType,
      recipientBloodType,
      aboRhCompatible: isAboRhCompatible,
      antibodiesDetected: detectedIncompatibilities,
      coombsTestResult,
      transfusionClearance: isFullySafe ? 'APPROVED_FOR_CLINICAL_INFUSION' : 'STRICT_CONTRAINDICATED_CLINICAL_HAZARD',
      cryptographicClearanceToken: `0x${safetyToken.substring(0, 32)}`,
      clinicalNotes: isFullySafe
        ? 'Cross-match confirmed: zero hemagglutination observed under 37°C incubation with anti-human globulin.'
        : `Immediate hemolytic reaction risk detected: ${!isAboRhCompatible ? 'ABO/Rh Mismatch' : detectedIncompatibilities.join(', ')}.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/trauma-network/inter-hospital-swaps
 * Returns all active and historical inter-hospital inventory rebalancing swaps.
 */
router.get('/inter-hospital-swaps', (req, res) => {
  try {
    res.json({
      success: true,
      swaps: ACTIVE_SWAP_RECORDS
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/trauma-network/execute-swap
 * Executes an instant emergency blood component swap between hospitals.
 */
router.post('/execute-swap', (req, res) => {
  try {
    const { requestingHospital, offeringHospital, componentRequested, unitsRequested, componentOffered, unitsOffered, reason } = req.body;

    const swapId = `SWAP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const escrowHash = `0x${crypto.createHash('sha256').update(`${swapId}:${requestingHospital}:${offeringHospital}:${Date.now()}`).digest('hex')}`;

    const newSwap = {
      id: swapId,
      requestingHospital: requestingHospital || 'Zuckerberg San Francisco General Hospital',
      offeringHospital: offeringHospital || 'Stanford Health Care',
      componentRequested: componentRequested || 'Platelets (Apheresis)',
      unitsRequested: unitsRequested || 2,
      componentOffered: componentOffered || 'Packed Red Blood Cells (PRBC, O+)',
      unitsOffered: unitsOffered || 4,
      reason: reason || 'STAT Trauma Resuscitation Swap',
      status: 'DISPATCH_IN_PROGRESS',
      timestamp: new Date().toISOString(),
      escrowVoucherHash: escrowHash
    };

    ACTIVE_SWAP_RECORDS.unshift(newSwap);

    res.json({
      success: true,
      swap: newSwap,
      message: 'Autonomous Inter-Hospital Rebalancing Swap executed. Drone courier scheduled.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
