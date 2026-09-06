/**
 * DAY 6 AUTONOMOUS ZERO-INPUT QA SUITE:
 * Autonomous AI Copilot & Voice/Text Clinical & Engineering Mentor
 * Verifies Semantic Knowledge Base, Sub-Second Zero-Quota Query Processing,
 * Code Invariant Synthesis, and Defensive Fallback SLA.
 */

const assert = require('assert');
const {
  SEMANTIC_KNOWLEDGE_BASE,
  SUGGESTED_PROMPTS,
  queryCopilotMentor
} = require('./src/services/copilotEngine');

let passedTests = 0;
let totalTests = 0;

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
    throw err;
  }
}

console.log('═════════════════════════════════════════════════════════════════════════════');
console.log('  DAY 6: AUTONOMOUS AI COPILOT & CLINICAL MENTOR — AUTONOMOUS QA SUITE');
console.log('═════════════════════════════════════════════════════════════════════════════\n');

(async () => {
  // 1. MODULE 1: SEMANTIC KNOWLEDGE BASE INTEGRITY
  console.log('▶ MODULE 1: INDEXED SEMANTIC KNOWLEDGE BASE INTEGRITY');
  await runAsyncTest('All 6 Core Medical/Aviation/Engineering Domains Configured', async () => {
    const keys = Object.keys(SEMANTIC_KNOWLEDGE_BASE);
    assert(keys.includes('mtp'), 'Must contain MTP resuscitation framework');
    assert(keys.includes('alloimmunization'), 'Must contain alloimmunization framework');
    assert(keys.includes('geospatial'), 'Must contain geospatial framework');
    assert(keys.includes('redis'), 'Must contain Redis caching framework');
    assert(keys.includes('drone_aviation'), 'Must contain drone aviation framework');
    assert(keys.includes('cold_chain'), 'Must contain cold chain framework');

    keys.forEach(k => {
      const f = SEMANTIC_KNOWLEDGE_BASE[k];
      assert(f.topic && f.explanation && f.codeSnippet && f.clinicalGuideline, `${k} missing fields`);
      assert(f.keywords.length >= 4, `${k} must define at least 4 semantic keywords`);
    });
  });

  // 2. MODULE 2: SUB-SECOND QUERY LATENCY & ZERO-QUOTA GUARANTEE
  console.log('\n▶ MODULE 2: SUB-SECOND LATENCY & ZERO-QUOTA SLA GUARANTEE');
  await runAsyncTest('Sub-500ms Query Latency on MTP Inquiry', async () => {
    const res = await queryCopilotMentor('How do I manage massive transfusion MTP 1:1:1 for a trauma patient in hemorrhagic shock?');
    assert.strictEqual(res.topic, 'Clinical Massive Transfusion Protocol (MTP 1:1:1)');
    assert(res.latencyMs < 500, `Latency must be < 500ms, got ${res.latencyMs}ms`);
    assert.strictEqual(res.quotaStatus, 'ZERO_QUOTA_GUARANTEED_100_PERCENT');
    assert(res.answer.includes('1:1:1'));
  });

  await runAsyncTest('Semantic Routing on Redis Spatial Geohash', async () => {
    const res = await queryCopilotMentor('Explain how Redis geohash enables sub-millisecond dispatch and avoids stampedes');
    assert.strictEqual(res.topic, 'High-Throughput Redis Spatial Geohash & Lock Allocation');
    assert(res.codeSnippet.includes('acquireDonorUnitLock'));
  });

  await runAsyncTest('Semantic Routing on FAA Drone TFR Airspace', async () => {
    const res = await queryCopilotMentor('What is the autonomous drone flight protocol for an active TFR corridor?');
    assert.strictEqual(res.topic, 'Autonomous Drone Flight Corridors & TFR Conflict Resolution');
    assert(res.codeSnippet.includes('computeTFRBypassWaypoint'));
  });

  // 3. MODULE 3: CODE SNIPPET EXECUTION & INVARIANT VALIDATION
  console.log('\n▶ MODULE 3: CODE INVARIANT EXECUTION & NUMERICAL ACCURACY');
  await runAsyncTest('MTP Calculator Code Snippet Correctness', async () => {
    const mtpCode = SEMANTIC_KNOWLEDGE_BASE.mtp.codeSnippet;
    const fn = new Function('estimatedBloodLossMl', `
      ${mtpCode}
      return calculateMTPRequirements(estimatedBloodLossMl);
    `);

    const result = fn(2800); // 2800 mL hemorrhage
    assert.strictEqual(result.rbcUnits, 8, '2800ml loss requires 8 units PRBC');
    assert.strictEqual(result.ffpUnits, 8, 'Requires 8 units FFP for 1:1:1 ratio');
    assert.strictEqual(result.plateletUnits, 2, 'Requires 2 apheresis platelet units');
  });

  await runAsyncTest('Haversine Code Snippet Precision', async () => {
    const geoCode = SEMANTIC_KNOWLEDGE_BASE.geospatial.codeSnippet;
    const fn = new Function('lat1', 'lon1', 'lat2', 'lon2', `
      ${geoCode}
      return calculateHaversineDistance(lat1, lon1, lat2, lon2);
    `);

    // SF General (37.7749, -122.4194) to UCSF Mission Bay (37.7679, -122.3923) ~1.5 miles
    const dist = fn(37.7749, -122.4194, 37.7679, -122.3923);
    assert(dist >= 1.4 && dist <= 1.7, `Calculated distance must be approx 1.55 miles, got ${dist}`);
  });

  // 4. MODULE 4: SUGGESTED QUICK PROMPTS
  console.log('\n▶ MODULE 4: SUGGESTED QUICK PROMPTS INTEGRITY');
  await runAsyncTest('Quick Prompts Available for Rapid UI Suggestions', async () => {
    assert(SUGGESTED_PROMPTS.length >= 4, 'Must provide at least 4 prompt suggestions');
  });

  console.log('\n═════════════════════════════════════════════════════════════════════════════');
  console.log(`  DAY 6 ZERO-INPUT QA SUITE RESULT: ${passedTests}/${totalTests} TESTS PASSED (100% SUCCESS)`);
  console.log('═════════════════════════════════════════════════════════════════════════════\n');
})();
