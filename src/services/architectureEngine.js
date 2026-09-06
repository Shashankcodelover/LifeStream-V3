/**
 * LifeStream V5.0 - Distributed System Design & Architecture Sandbox Engine
 * Benchmarked against ByteByteGo Enterprise Architecture Simulators.
 * Simulates high-throughput distributed medical dispatch topology:
 * Client -> Envoy Gateway -> Redis Cache -> Kubernetes Pods -> Neon Postgres DB -> IoT Telemetry Bus
 */

// Initial Topology Definition
const ARCHITECTURE_TOPOLOGY = {
  layers: [
    {
      id: 'client-tier',
      name: 'Tier 1: Client & Ingestion',
      nodes: [
        { id: 'client-ambulance', name: 'Mobile EMS Ambulance', type: 'CLIENT', ip: '10.0.1.12', status: 'HEALTHY', rps: 1200, cpu: 15, memory: '120MB' },
        { id: 'client-hospital', name: 'Trauma ER Surgeon Portal', type: 'CLIENT', ip: '10.0.1.15', status: 'HEALTHY', rps: 2400, cpu: 22, memory: '180MB' },
        { id: 'client-drone-hub', name: 'ADS-B Drone Telemetry Hub', type: 'CLIENT', ip: '10.0.1.28', status: 'HEALTHY', rps: 3800, cpu: 31, memory: '240MB' }
      ]
    },
    {
      id: 'gateway-tier',
      name: 'Tier 2: Ingress & Edge Proxy',
      nodes: [
        { id: 'gw-envoy', name: 'Envoy Edge API Gateway', type: 'GATEWAY', ip: '172.16.0.1', status: 'HEALTHY', activeConns: 7400, rateLimitQuota: '25,000 req/s', tlsVersion: 'TLS 1.3' }
      ]
    },
    {
      id: 'cache-tier',
      name: 'Tier 3: In-Memory Cache Tier',
      nodes: [
        { id: 'cache-redis', name: 'Redis Cluster (Spatial Geohash & State Locks)', type: 'CACHE', ip: '172.16.2.10', status: 'HEALTHY', hitRate: 98.6, memoryUsed: '1.42 GB', maxMemory: '4.00 GB', evictionPolicy: 'allkeys-lru' }
      ]
    },
    {
      id: 'compute-tier',
      name: 'Tier 4: Distributed Worker Pods',
      nodes: [
        { id: 'pod-match-1', name: 'Match-Worker Pod 1', type: 'WORKER', ip: '10.244.1.4', status: 'HEALTHY', cpu: 38, queueDepth: 12, memory: '480MB' },
        { id: 'pod-match-2', name: 'Match-Worker Pod 2', type: 'WORKER', ip: '10.244.2.8', status: 'HEALTHY', cpu: 42, queueDepth: 15, memory: '512MB' },
        { id: 'pod-mtp-3', name: 'MTP-Resuscitation Pod 3', type: 'WORKER', ip: '10.244.3.11', status: 'HEALTHY', cpu: 35, queueDepth: 8, memory: '460MB' },
        { id: 'pod-drone-4', name: 'Drone-Kinematics Pod 4', type: 'WORKER', ip: '10.244.4.19', status: 'HEALTHY', cpu: 49, queueDepth: 18, memory: '590MB' }
      ]
    },
    {
      id: 'storage-tier',
      name: 'Tier 5: Distributed Storage & Event Bus',
      nodes: [
        { id: 'db-postgres-primary', name: 'Neon Serverless Postgres (Primary)', type: 'DATABASE', ip: '192.168.1.100', status: 'HEALTHY', poolUsage: 28, maxPool: 100, iops: 4200, replicationLagMs: 0 },
        { id: 'db-postgres-replica', name: 'Postgres Read Replica (AZ-West)', type: 'DATABASE', ip: '192.168.1.101', status: 'HEALTHY', poolUsage: 19, maxPool: 100, iops: 2800, replicationLagMs: 1.2 },
        { id: 'bus-kafka', name: 'Kafka Audit & Custody Event Bus', type: 'QUEUE', ip: '192.168.2.50', status: 'HEALTHY', partitionCount: 16, lagOffset: 4, msgRate: '8,400 msg/s' }
      ]
    }
  ],
  links: [
    { source: 'client-ambulance', target: 'gw-envoy' },
    { source: 'client-hospital', target: 'gw-envoy' },
    { source: 'client-drone-hub', target: 'gw-envoy' },
    { source: 'gw-envoy', target: 'cache-redis' },
    { source: 'cache-redis', target: 'pod-match-1' },
    { source: 'cache-redis', target: 'pod-match-2' },
    { source: 'cache-redis', target: 'pod-mtp-3' },
    { source: 'cache-redis', target: 'pod-drone-4' },
    { source: 'pod-match-1', target: 'db-postgres-primary' },
    { source: 'pod-match-2', target: 'db-postgres-primary' },
    { source: 'pod-mtp-3', target: 'bus-kafka' },
    { source: 'pod-drone-4', target: 'bus-kafka' },
    { source: 'db-postgres-primary', target: 'db-postgres-replica' }
  ]
};

// Architecture Simulation Case Study Presets (ByteByteGo Standard)
const ARCHITECTURE_PRESETS = [
  {
    id: 'PRESET-OPTIMAL',
    name: 'Optimal STAT Dispatch (Steady State)',
    description: 'Warm in-memory Redis geohash cache handling 98.8% of proximity reads with sub-millisecond latency.',
    trafficRps: 5000,
    cacheWarm: true,
    dbPoolSaturated: false,
    partitionActive: false,
    failedPodId: null,
    expectedP50: 0.8,
    expectedP95: 2.1,
    expectedP99: 4.8,
    expectedSla: 99.999
  },
  {
    id: 'PRESET-CACHE-STAMPEDE',
    name: 'Cold-Start & Cache Stampede Failure',
    description: 'Redis cache invalidated or cold, causing 100% of read traffic to cascade directly onto the Postgres Primary database.',
    trafficRps: 8000,
    cacheWarm: false,
    dbPoolSaturated: false,
    partitionActive: false,
    failedPodId: null,
    expectedP50: 42.5,
    expectedP95: 84.0,
    expectedP99: 145.2,
    expectedSla: 99.850
  },
  {
    id: 'PRESET-MASS-CASUALTY-SURGE',
    name: 'Mass Casualty Surge & Connection Exhaustion',
    description: 'Spike of 18,000 emergency queries exhausts the database connection pool (100/100 connections), triggering backpressure and queue delays.',
    trafficRps: 18000,
    cacheWarm: false,
    dbPoolSaturated: true,
    partitionActive: false,
    failedPodId: null,
    expectedP50: 110.0,
    expectedP95: 280.4,
    expectedP99: 460.0,
    expectedSla: 98.420
  },
  {
    id: 'PRESET-SPLIT-BRAIN-CHAOS',
    name: 'Cross-Region Partition & Pod Crash Drill',
    description: 'Simulates network partition isolating the West replica and sudden crash of Match-Worker Pod 2 with instant failover.',
    trafficRps: 6500,
    cacheWarm: true,
    dbPoolSaturated: false,
    partitionActive: true,
    failedPodId: 'pod-match-2',
    expectedP50: 4.2,
    expectedP95: 18.6,
    expectedP99: 38.0,
    expectedSla: 99.920
  }
];

// Live Latency & Queue Depth Calculator
function calculateSystemMetrics({
  trafficRps = 5000,
  cacheWarm = true,
  dbPoolSaturated = false,
  partitionActive = false,
  failedPodId = null
}) {
  // Base latencies
  let p50 = 0.8;
  let p95 = 2.4;
  let p99 = 5.2;
  let errorRate = 0.0;
  let cacheHitRate = cacheWarm ? 98.6 : 4.2;
  let dbPoolUsage = Math.min(100, Math.round((trafficRps / 200) * (cacheWarm ? 0.35 : 1.4)));
  let workerCpu = Math.min(100, Math.round((trafficRps / 120) * (failedPodId ? 1.35 : 0.95)));

  // If cache is cold (Cache Stampede)
  if (!cacheWarm) {
    p50 += 38.4;
    p95 += 78.0;
    p99 += 135.0;
    dbPoolUsage = Math.min(100, dbPoolUsage + 45);
  }

  // If DB connection pool is exhausted
  if (dbPoolSaturated || dbPoolUsage >= 95) {
    dbPoolUsage = 100;
    p50 += 70.0;
    p95 += 190.0;
    p99 += 320.0;
    errorRate += 1.42; // Connection timeout drops
  }

  // If network partition is active (Split-Brain quarantine)
  if (partitionActive) {
    p50 += 3.2;
    p95 += 14.5;
    p99 += 28.0;
    errorRate += 0.08;
  }

  // If worker pod is dead
  if (failedPodId) {
    workerCpu = Math.min(100, workerCpu + 25);
    p95 += 8.2;
    p99 += 16.5;
  }

  // Calculate SLA (Three nines / Five nines)
  let sla = 99.999 - (errorRate * 0.95);
  sla = Math.max(95.0, Math.min(99.999, sla));

  // Determine packet route simulation
  const packetPath = [
    { step: 1, node: 'client-hospital', latencyMs: 0.1, event: 'STAT Request Created' },
    { step: 2, node: 'gw-envoy', latencyMs: 0.3, event: 'TLS 1.3 & Rate Limit Verified' },
    {
      step: 3,
      node: 'cache-redis',
      latencyMs: cacheWarm ? 0.4 : 1.2,
      event: cacheWarm ? 'CACHE HIT (Redis In-Memory Geohash)' : 'CACHE MISS (Key Evicted / Cold)'
    },
    {
      step: 4,
      node: failedPodId === 'pod-match-2' ? 'pod-match-1' : 'pod-match-2',
      latencyMs: failedPodId ? 3.8 : 1.4,
      event: failedPodId ? 'Failover: Re-routed from crashed Pod 2 to Pod 1' : 'Dispatched to healthy worker'
    },
    {
      step: 5,
      node: cacheWarm ? 'cache-redis' : 'db-postgres-primary',
      latencyMs: cacheWarm ? 0.0 : (dbPoolSaturated ? 65.0 : 28.5),
      event: cacheWarm ? 'State Lock Acquired (Sub-ms)' : (dbPoolSaturated ? 'Queue Delay: DB Connection Pool Saturated' : 'SQL Execution & WAL Committed')
    }
  ];

  return {
    trafficRps,
    p50: Number(p50.toFixed(2)),
    p95: Number(p95.toFixed(2)),
    p99: Number(p99.toFixed(2)),
    cacheHitRate: Number(cacheHitRate.toFixed(1)),
    dbPoolUsage,
    workerCpu,
    errorRate: Number(errorRate.toFixed(2)),
    systemAvailability: Number(sla.toFixed(3)),
    packetPath,
    topologyStatus: {
      cacheStatus: cacheWarm ? 'WARM_HIT' : 'COLD_MISS',
      dbPoolStatus: dbPoolUsage >= 95 ? 'SATURATED_EXHAUSTED' : 'OPTIMAL',
      partitionStatus: partitionActive ? 'PARTITION_QUORUM_DEGRADED' : 'UNIFIED_SYNC',
      crashedPod: failedPodId || 'NONE'
    }
  };
}

module.exports = {
  ARCHITECTURE_TOPOLOGY,
  ARCHITECTURE_PRESETS,
  calculateSystemMetrics
};
