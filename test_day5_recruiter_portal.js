/**
 * DAY 5 AUTONOMOUS ZERO-INPUT QA SUITE:
 * Startup B2B Enterprise & Recruiter Talent Clearinghouse
 * Verifies Verified Talent Pipeline, Multi-factor Filtering, Candidate Dossiers,
 * B2B Subscription Packages, and SHA-256 Enterprise License Provisioning.
 */

const assert = require('assert');
const {
  CANDIDATE_TALENT_POOL,
  ENTERPRISE_SUBSCRIPTION_TIERS,
  filterCandidates,
  provisionEnterpriseLicense
} = require('./src/services/recruiterEngine');
const { readDB, writeDB } = require('./src/db');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
    throw err;
  }
}

console.log('═════════════════════════════════════════════════════════════════════════════');
console.log('  DAY 5: B2B ENTERPRISE & RECRUITER CLEARINGHOUSE — AUTONOMOUS QA SUITE');
console.log('═════════════════════════════════════════════════════════════════════════════\n');

// 1. MODULE 1: TALENT POOL SPECIFICATION & ACCREDITATION
console.log('▶ MODULE 1: CANDIDATE TALENT POOL & ACCREDITATION INTEGRITY');
runTest('Verified Talent Pool Completeness & Schema', () => {
  assert(CANDIDATE_TALENT_POOL.length >= 5, 'Must contain at least 5 certified clinical specialists');
  CANDIDATE_TALENT_POOL.forEach(c => {
    assert(c.id && c.name && c.title && c.hospital, `${c.id} missing core identity fields`);
    assert(c.percentile >= 70 && c.percentile <= 100, `${c.id} percentile must be valid 70-100`);
    assert(c.certificateId.startsWith('CERT-TRAUMA-'), `${c.id} certificate must start with CERT-TRAUMA-`);
    assert(Array.isArray(c.skills) && c.skills.length >= 3, `${c.id} must define at least 3 clinical skills`);
  });
});

// 2. MODULE 2: MULTI-FACTOR TALENT SEARCH & FILTERING
console.log('\n▶ MODULE 2: MULTI-FACTOR RECRUITER FILTERING & SEARCH');
runTest('Filter by Minimum Percentile (Top 5% Elite: >= 95th)', () => {
  const eliteCandidates = filterCandidates({ minPercentile: 95 });
  assert.strictEqual(eliteCandidates.length, 3, 'Must match exactly 3 candidates >= 95th percentile');
  eliteCandidates.forEach(c => {
    assert(c.percentile >= 95, `Candidate ${c.name} has percentile ${c.percentile} < 95`);
  });
});

runTest('Filter by Competency Tier Badge', () => {
  const masterDirectors = filterCandidates({ badge: 'MASTER_DIRECTOR_DISTINCTION' });
  assert.strictEqual(masterDirectors.length, 2, 'Must match exactly 2 Master Directors');
  assert(masterDirectors.some(c => c.name.includes('Marcus Vance')));
  assert(masterDirectors.some(c => c.name.includes('Sarah Chen')));
});

runTest('Filter by Clinical Specialty', () => {
  const droneEngineers = filterCandidates({ specialty: 'Airspace Vector Optimization' });
  assert.strictEqual(droneEngineers.length, 1);
  assert.strictEqual(droneEngineers[0].name, 'Sarah Chen, MEng');
});

runTest('Fuzzy Keyword Search across Skills & Bio', () => {
  const mtpCandidates = filterCandidates({ searchQuery: 'MTP' });
  assert(mtpCandidates.length >= 2, 'Search for MTP must return multiple candidates');
  assert(mtpCandidates.some(c => c.name.includes('Marcus Vance')));
});

// 3. MODULE 3: B2B ENTERPRISE SUBSCRIPTION TIERS
console.log('\n▶ MODULE 3: B2B ENTERPRISE SUBSCRIPTION TIERS & PRICING');
runTest('3 Institutional Subscription Tiers Configured', () => {
  assert.strictEqual(ENTERPRISE_SUBSCRIPTION_TIERS.length, 3, 'Must define 3 institutional subscription tiers');
  const tierIds = ENTERPRISE_SUBSCRIPTION_TIERS.map(t => t.id);
  assert(tierIds.includes('TIER-COMMUNITY'));
  assert(tierIds.includes('TIER-REGIONAL-NETWORK'));
  assert(tierIds.includes('TIER-NATIONAL-DEFENSE'));

  const regional = ENTERPRISE_SUBSCRIPTION_TIERS.find(t => t.id === 'TIER-REGIONAL-NETWORK');
  assert.strictEqual(regional.priceMonthly, 4990, 'Regional network must be $4,990/mo');
  assert.strictEqual(regional.seatsIncluded, 25, 'Regional network must include 25 seats');
});

// 4. MODULE 4: LICENSE PROVISIONING & INVOICE GENERATION
console.log('\n▶ MODULE 4: ENTERPRISE LICENSE KEY & INVOICE ISSUANCE');
runTest('Provision Enterprise License & Cryptographic Compliance Hash', () => {
  const license = provisionEnterpriseLicense('TIER-REGIONAL-NETWORK', 'Stanford Health Care Trauma Center', 'procurement@stanford.edu');
  
  assert(license.licenseKey.startsWith('LIC-LIFESTREAM-'), 'License key must match LIC-LIFESTREAM- format');
  assert(license.invoiceNumber.startsWith('INV-B2B-'), 'Invoice must match INV-B2B- format');
  assert.strictEqual(license.organizationName, 'Stanford Health Care Trauma Center');
  assert.strictEqual(license.amountBilled, 4990);
  assert.strictEqual(license.seatsAllocated, 25);
  assert.strictEqual(license.status, 'ACTIVE_PROVISIONED');
  assert(license.complianceHash && license.complianceHash.length === 64, 'Must compute 64-char SHA-256 compliance hash');
});

// 5. MODULE 5: DATABASE REGISTRY PERSISTENCE
console.log('\n▶ MODULE 5: DATABASE AUDIT TRAIL PERSISTENCE');
runTest('Persist Enterprise License Record into Database', () => {
  const license = provisionEnterpriseLicense('TIER-COMMUNITY', 'Oakland Children Hospital', 'billing@oaklandchildren.org');
  const db = readDB();
  if (!db.enterpriseLicenses) db.enterpriseLicenses = [];
  db.enterpriseLicenses.unshift(license);
  writeDB(db);

  const reloadedDB = readDB();
  const found = (reloadedDB.enterpriseLicenses || []).find(l => l.licenseKey === license.licenseKey);
  assert(found, 'License record must be retrievable from DB');
  assert.strictEqual(found.organizationName, 'Oakland Children Hospital');
});

console.log('\n═════════════════════════════════════════════════════════════════════════════');
console.log(`  DAY 5 ZERO-INPUT QA SUITE RESULT: ${passedTests}/${totalTests} TESTS PASSED (100% SUCCESS)`);
console.log('═════════════════════════════════════════════════════════════════════════════\n');
