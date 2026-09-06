/**
 * LifeStream V5.0 - Startup B2B Enterprise & Recruiter Talent Clearinghouse Engine
 * Benchmarked against LinkedIn Recruiter Enterprise, RippleMatch, and Stripe Billing.
 * Powers enterprise clinical recruitment, talent pipeline matching, and B2B hospital licensing.
 */

const crypto = require('crypto');

// Initial Verified Talent Pool (Populated with Clinical Directors & Drone Navigators)
const CANDIDATE_TALENT_POOL = [
  {
    id: 'CAND-01',
    name: 'Dr. Marcus Vance, MD',
    title: 'Chief Trauma Anesthesiologist & MTP Coordinator',
    hospital: 'San Francisco General Hospital',
    location: 'San Francisco, CA',
    percentile: 99.4,
    finalScore: 100,
    badge: 'MASTER_DIRECTOR_DISTINCTION',
    specialty: 'Trauma Surgery & MTP 1:1:1',
    solveSpeedSeconds: 295,
    certificateId: 'CERT-TRAUMA-994101-4421',
    availableForHire: true,
    expectedSalary: '$340,000/yr',
    skills: ['Haversine Proximity', 'Massive Transfusion Protocol', 'Rh/Kell Compatibility', 'FAA Part 107'],
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    bio: '12+ years directing Level-1 trauma resuscitations with zero cold-chain degradation. Pioneered drone-mediated blood dispatch protocols.'
  },
  {
    id: 'CAND-02',
    name: 'Sarah Chen, MEng',
    title: 'Autonomous Flight Kinematics & Drone Fleet Engineer',
    hospital: 'LifeStream Aerospace / Wing Aviation',
    location: 'Palo Alto, CA',
    percentile: 98.2,
    finalScore: 95,
    badge: 'MASTER_DIRECTOR_DISTINCTION',
    specialty: 'Airspace Vector Optimization',
    solveSpeedSeconds: 310,
    certificateId: 'CERT-TRAUMA-982054-8832',
    availableForHire: true,
    expectedSalary: '$210,000/yr',
    skills: ['Dynamic TFR Avoidance', 'ADS-B In/Out', 'Path Planning', 'PID Altitude Stabilization'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    bio: 'Lead flight software architect for high-speed eVTOL medical delivery corridors across urban Class-G airspace.'
  },
  {
    id: 'CAND-03',
    name: 'Dr. Elena Rostova',
    title: 'Regional Blood Bank & Immunohematology Director',
    hospital: 'Stanford Health Care',
    location: 'Stanford, CA',
    percentile: 96.2,
    finalScore: 88,
    badge: 'CERTIFIED_SENIOR_COORDINATOR',
    specialty: 'Rare Antigen Alloimmunization',
    solveSpeedSeconds: 380,
    certificateId: 'CERT-TRAUMA-962187-1904',
    availableForHire: false,
    expectedSalary: '$285,000/yr',
    skills: ['Kell Antigens', 'Rh Phenotyping', 'Cross-matching', 'Cold-Chain IoT'],
    avatar: 'https://images.unsplash.com/photo-1594824813681-36a568b209e5?w=150&auto=format&fit=crop&q=80',
    bio: 'Specialist in rapid bedside antibody detection and mitigating delayed hemolytic transfusion reactions in poly-transfused trauma patients.'
  },
  {
    id: 'CAND-04',
    name: 'Devon Miller, RN, BSN',
    title: 'Critical Care Flight Paramedic & Triage Lead',
    hospital: 'Oakland Kaiser Medical Center',
    location: 'Oakland, CA',
    percentile: 88.5,
    finalScore: 78,
    badge: 'CERTIFIED_SENIOR_COORDINATOR',
    specialty: 'Emergency Resuscitation & Transit',
    solveSpeedSeconds: 440,
    certificateId: 'CERT-TRAUMA-885092-7711',
    availableForHire: true,
    expectedSalary: '$165,000/yr',
    skills: ['MTP 1:1:1', 'Thermal Packaging', 'Emergency Airway', 'Rapid Infuser Operation'],
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
    bio: '8 years of high-acuity rotorcraft and fixed-wing inter-facility critical transport with deep experience in airborne whole blood resuscitation.'
  },
  {
    id: 'CAND-05',
    name: 'Aiden Patel',
    title: 'IoT Cold-Chain & Thermodynamics Specialist',
    hospital: 'UCSF Medical Center at Mission Bay',
    location: 'San Francisco, CA',
    percentile: 84.0,
    finalScore: 75,
    badge: 'QUALIFIED_PRACTITIONER',
    specialty: 'Thermodynamics & IoT Cold-Chain',
    solveSpeedSeconds: 490,
    certificateId: 'CERT-TRAUMA-840112-3210',
    availableForHire: true,
    expectedSalary: '$140,000/yr',
    skills: ['Phase-Change Mitigation', 'Telemetry Sensors', 'Micro-Peltier Regulators', 'AABB Storage Rules'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Engineered Phase-Change Material (PCM) thermal containers maintaining 1-6°C whole blood envelope under desert ambient conditions.'
  }
];

// Enterprise B2B Subscription Tiers (Institutional Procurement)
const ENTERPRISE_SUBSCRIPTION_TIERS = [
  {
    id: 'TIER-COMMUNITY',
    name: 'Community Hospital License',
    priceMonthly: 1490,
    billingCycle: 'MONTHLY',
    seatsIncluded: 5,
    features: [
      'Up to 5 Emergency Dispatch Seats',
      'Real-Time Radar & Telemetry View',
      'Standard Clinical MTP Calculator',
      'Verified Recruiter Talent Discovery (5 Contacts/mo)',
      '99.9% Availability SLA'
    ],
    recommended: false
  },
  {
    id: 'TIER-REGIONAL-NETWORK',
    name: 'Regional Trauma Health System',
    priceMonthly: 4990,
    billingCycle: 'MONTHLY',
    seatsIncluded: 25,
    features: [
      'Up to 25 Clinical & Dispatch Seats',
      'Autonomous Drone Fleet Dispatch & ADS-B Tracking',
      'AI 7-Day Shortage Forecasting & Auto-Balancing',
      'Unlimited Recruiter Talent Pipeline & Candidate Dossiers',
      'Cryptographic SHA-256 Proof-of-Custody Ledger',
      '99.99% Availability SLA & 24/7 Dedicated Support'
    ],
    recommended: true
  },
  {
    id: 'TIER-NATIONAL-DEFENSE',
    name: 'National Aviation & Defense Enterprise',
    priceMonthly: 14500,
    billingCycle: 'MONTHLY',
    seatsIncluded: 100,
    features: [
      'Unlimited Enterprise Dispatcher & Pilot Seats',
      'Dedicated Kafka Telemetry Stream & Low-Latency Mesh',
      'Priority FAA Emergency Airspace Corridor Waivers',
      'Algorithmic Studio & Custom Heuristic Deployment',
      'Direct API Ingestion & ERP Integration',
      '99.999% Five-Nines Mission-Critical SLA'
    ],
    recommended: false
  }
];

// Search and Filter Candidates
function filterCandidates({ minPercentile = 0, badge = 'ALL', specialty = 'ALL', searchQuery = '' }) {
  return CANDIDATE_TALENT_POOL.filter(candidate => {
    if (candidate.percentile < minPercentile) return false;
    if (badge !== 'ALL' && candidate.badge !== badge) return false;
    if (specialty !== 'ALL' && candidate.specialty !== specialty) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = candidate.name.toLowerCase().includes(q);
      const matchTitle = candidate.title.toLowerCase().includes(q);
      const matchSkills = candidate.skills.some(s => s.toLowerCase().includes(q));
      if (!matchName && !matchTitle && !matchSkills) return false;
    }
    return true;
  });
}

// Issue Enterprise License & Invoice
function provisionEnterpriseLicense(tierId, organizationName, contactEmail) {
  const tier = ENTERPRISE_SUBSCRIPTION_TIERS.find(t => t.id === tierId) || ENTERPRISE_SUBSCRIPTION_TIERS[1];
  const licenseKey = `LIC-LIFESTREAM-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const invoiceNumber = `INV-B2B-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

  const subscriptionRecord = {
    licenseKey,
    invoiceNumber,
    tierId: tier.id,
    tierName: tier.name,
    organizationName: organizationName || 'San Francisco Health System',
    contactEmail: contactEmail || 'procurement@sfhealth.org',
    seatsAllocated: tier.seatsIncluded,
    amountBilled: tier.priceMonthly,
    currency: 'USD',
    status: 'ACTIVE_PROVISIONED',
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 365).toISOString(), // 1-year agreement
    complianceHash: crypto.createHash('sha256').update(licenseKey + organizationName).digest('hex')
  };

  return subscriptionRecord;
}

module.exports = {
  CANDIDATE_TALENT_POOL,
  ENTERPRISE_SUBSCRIPTION_TIERS,
  filterCandidates,
  provisionEnterpriseLicense
};
