import React, { useState, useEffect } from 'react';
import {
  Layers, Server, Database, Cpu, Zap, Activity, AlertTriangle,
  RotateCcw, ShieldCheck, HardDrive, Wifi, Sliders, Play, CheckCircle2,
  XCircle, Clock, Info, ArrowRight, Radio, RefreshCw, ChevronRight
} from 'lucide-react';
import { resilientFetch } from '../api/client';

export function ArchitectureSandboxView() {
  const [topology, setTopology] = useState(null);
  const [presets, setPresets] = useState([]);
  const [selectedPresetId, setSelectedPresetId] = useState('PRESET-OPTIMAL');

  // Simulation Controls State
  const [trafficRps, setTrafficRps] = useState(5000);
  const [cacheWarm, setCacheWarm] = useState(true);
  const [dbPoolSaturated, setDbPoolSaturated] = useState(false);
  const [partitionActive, setPartitionActive] = useState(false);
  const [failedPodId, setFailedPodId] = useState(null);

  // Live Metrics & Output
  const [metrics, setMetrics] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

  // Load Topology and Presets on mount
  useEffect(() => {
    (async () => {
      try {
        const topData = await resilientFetch('/api/architecture/topology');
        if (topData && topData.topology) {
          setTopology(topData.topology);
          setMetrics(topData.metrics);
        }
        const presetData = await resilientFetch('/api/architecture/presets');
        if (presetData && presetData.presets) {
          setPresets(presetData.presets);
        }
      } catch (err) {
        console.warn('Failed to load architecture topology:', err);
      }
    })();
  }, []);

  // Trigger Live Simulation recalculation on parameter changes
  useEffect(() => {
    let isCancelled = false;
    const updateSimulation = async () => {
      setIsSimulating(true);
      try {
        const simResult = await resilientFetch('/api/architecture/simulate', {
          method: 'POST',
          body: JSON.stringify({
            trafficRps,
            cacheWarm,
            dbPoolSaturated,
            partitionActive,
            failedPodId
          })
        });
        if (!isCancelled && simResult) {
          setMetrics(simResult);
          setPulseKey(prev => prev + 1);
        }
      } catch (err) {
        console.warn('Simulation update failed:', err);
      } finally {
        if (!isCancelled) setIsSimulating(false);
      }
    };

    const timer = setTimeout(updateSimulation, 80);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [trafficRps, cacheWarm, dbPoolSaturated, partitionActive, failedPodId]);

  // Handle Preset selection
  const applyPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setTrafficRps(preset.trafficRps);
    setCacheWarm(preset.cacheWarm);
    setDbPoolSaturated(preset.dbPoolSaturated);
    setPartitionActive(preset.partitionActive);
    setFailedPodId(preset.failedPodId);
  };

  // Reset all to optimal steady-state
  const handleReset = () => {
    setSelectedPresetId('PRESET-OPTIMAL');
    setTrafficRps(5000);
    setCacheWarm(true);
    setDbPoolSaturated(false);
    setPartitionActive(false);
    setFailedPodId(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f8fafd] text-[#202124] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner & Standard Header */}
      <div className="bg-white border border-[#dadce0] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 rounded-xl bg-[#e8f0fe] text-[#1a73e8]">
              <Layers className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#202124]">
              Distributed System Design & Latency Sandbox
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]">
              ByteByteGo Enterprise Benchmark
            </span>
          </div>
          <p className="text-sm text-[#5f6368] max-w-3xl">
            Simulate real-time microsecond request latencies, cache hit vs. miss stampedes, database connection pool exhaustion, and cross-region partition chaos across LifeStream’s distributed drone and medical dispatch topology.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-[#5f6368] bg-[#f1f3f4] hover:bg-[#e8eaed] rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Topology
          </button>
        </div>
      </div>

      {/* Case Study Presets Dock */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {presets.map(p => (
          <button
            key={p.id}
            onClick={() => applyPreset(p)}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              selectedPresetId === p.id
                ? 'bg-[#e8f0fe] border-[#1a73e8] shadow-sm'
                : 'bg-white border-[#dadce0] hover:border-[#bdc1c6]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-bold ${selectedPresetId === p.id ? 'text-[#1a73e8]' : 'text-[#202124]'}`}>
                {p.name}
              </span>
              {selectedPresetId === p.id && (
                <CheckCircle2 className="w-4 h-4 text-[#1a73e8]" />
              )}
            </div>
            <p className="text-[11px] text-[#5f6368] line-clamp-2 leading-relaxed">
              {p.description}
            </p>
          </button>
        ))}
      </div>

      {/* Real-Time Metrics HUD Bar */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* P50 Latency */}
          <div className="bg-white border border-[#dadce0] p-4 rounded-xl shadow-xs">
            <div className="text-[11px] font-medium text-[#5f6368] flex items-center justify-between">
              <span>P50 Latency</span>
              <Clock className="w-3.5 h-3.5 text-[#1a73e8]" />
            </div>
            <div className="text-xl font-extrabold mt-1 tracking-tight text-[#202124]">
              {metrics.p50} <span className="text-xs font-normal text-[#5f6368]">ms</span>
            </div>
            <div className="text-[10px] text-[#34a853] mt-1 font-medium">
              Median Response
            </div>
          </div>

          {/* P95 Latency */}
          <div className="bg-white border border-[#dadce0] p-4 rounded-xl shadow-xs">
            <div className="text-[11px] font-medium text-[#5f6368] flex items-center justify-between">
              <span>P95 Latency</span>
              <Activity className="w-3.5 h-3.5 text-[#fbbc04]" />
            </div>
            <div className="text-xl font-extrabold mt-1 tracking-tight text-[#202124]">
              {metrics.p95} <span className="text-xs font-normal text-[#5f6368]">ms</span>
            </div>
            <div className="text-[10px] text-[#5f6368] mt-1">
              95th Percentile
            </div>
          </div>

          {/* P99 Latency */}
          <div className={`p-4 rounded-xl border shadow-xs ${
            metrics.p99 > 100 ? 'bg-[#fce8e6] border-[#ea4335]' : 'bg-white border-[#dadce0]'
          }`}>
            <div className="text-[11px] font-medium text-[#5f6368] flex items-center justify-between">
              <span>P99 Tail Latency</span>
              <AlertTriangle className={`w-3.5 h-3.5 ${metrics.p99 > 100 ? 'text-[#ea4335]' : 'text-[#5f6368]'}`} />
            </div>
            <div className={`text-xl font-extrabold mt-1 tracking-tight ${metrics.p99 > 100 ? 'text-[#ea4335]' : 'text-[#202124]'}`}>
              {metrics.p99} <span className="text-xs font-normal text-[#5f6368]">ms</span>
            </div>
            <div className={`text-[10px] mt-1 font-medium ${metrics.p99 > 100 ? 'text-[#ea4335]' : 'text-[#5f6368]'}`}>
              Worst-case tail
            </div>
          </div>

          {/* Cache Hit Rate */}
          <div className="bg-white border border-[#dadce0] p-4 rounded-xl shadow-xs">
            <div className="text-[11px] font-medium text-[#5f6368] flex items-center justify-between">
              <span>Cache Hit Ratio</span>
              <Zap className="w-3.5 h-3.5 text-[#1a73e8]" />
            </div>
            <div className={`text-xl font-extrabold mt-1 tracking-tight ${
              metrics.cacheHitRate > 80 ? 'text-[#34a853]' : 'text-[#ea4335]'
            }`}>
              {metrics.cacheHitRate}%
            </div>
            <div className="text-[10px] text-[#5f6368] mt-1">
              Redis In-Memory
            </div>
          </div>

          {/* DB Pool Usage */}
          <div className={`p-4 rounded-xl border shadow-xs ${
            metrics.dbPoolUsage >= 95 ? 'bg-[#fce8e6] border-[#ea4335]' : 'bg-white border-[#dadce0]'
          }`}>
            <div className="text-[11px] font-medium text-[#5f6368] flex items-center justify-between">
              <span>DB Pool Usage</span>
              <Database className="w-3.5 h-3.5 text-[#1a73e8]" />
            </div>
            <div className={`text-xl font-extrabold mt-1 tracking-tight ${
              metrics.dbPoolUsage >= 95 ? 'text-[#ea4335]' : 'text-[#202124]'
            }`}>
              {metrics.dbPoolUsage}%
            </div>
            <div className="text-[10px] text-[#5f6368] mt-1">
              100 Max Connections
            </div>
          </div>

          {/* Availability SLA */}
          <div className="bg-white border border-[#dadce0] p-4 rounded-xl shadow-xs">
            <div className="text-[11px] font-medium text-[#5f6368] flex items-center justify-between">
              <span>System SLA</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#34a853]" />
            </div>
            <div className="text-xl font-extrabold mt-1 tracking-tight text-[#34a853]">
              {metrics.systemAvailability}%
            </div>
            <div className="text-[10px] text-[#5f6368] mt-1">
              Five-Nines Target
            </div>
          </div>
        </div>
      )}

      {/* Main Interactive Grid: Architecture Canvas & Controls Dock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Architecture Topology Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#dadce0] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-[#202124] flex items-center gap-2">
                <Server className="w-4 h-4 text-[#1a73e8]" />
                Live Distributed Topology Canvas
              </h2>
              <p className="text-xs text-[#5f6368]">
                Click on any node to inspect internal thread pools, memory buffers, and live IP configuration.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e6f4ea] text-[#137333] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#34a853] animate-ping" />
                {trafficRps.toLocaleString()} req/s Active
              </span>
            </div>
          </div>

          {/* SVG Diagram Canvas */}
          <div className="relative border border-[#e8eaed] rounded-xl bg-[#fcfdfe] p-6 min-h-[440px] flex flex-col justify-between overflow-x-auto">
            {/* Layer 1: Client Ingestion Tier */}
            <div className="mb-6">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#70757a] mb-2">
                Tier 1: Client & Ingestion Layer
              </div>
              <div className="grid grid-cols-3 gap-3">
                {topology?.layers[0]?.nodes.map(node => (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`cursor-pointer p-3 rounded-xl border transition-all text-left ${
                      selectedNode?.id === node.id
                        ? 'border-[#1a73e8] bg-[#e8f0fe] shadow-sm'
                        : 'border-[#dadce0] bg-white hover:border-[#1a73e8]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Radio className="w-3.5 h-3.5 text-[#1a73e8]" />
                      <span className="text-xs font-semibold truncate text-[#202124]">{node.name}</span>
                    </div>
                    <div className="text-[11px] text-[#5f6368] flex items-center justify-between">
                      <span>{node.ip}</span>
                      <span className="font-mono font-medium text-[#1a73e8]">{node.rps} rps</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Connecting Pulse Vector 1 */}
            <div className="flex justify-center my-1">
              <div className="flex items-center gap-2 text-xs text-[#1a73e8] font-mono bg-[#e8f0fe] px-3 py-0.5 rounded-full animate-pulse">
                <span>Anycast Ingress</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Layer 2 & 3: Envoy Gateway & Redis In-Memory Cache */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
              {/* Envoy Gateway */}
              <div
                onClick={() => setSelectedNode(topology?.layers[1]?.nodes[0])}
                className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                  selectedNode?.id === 'gw-envoy'
                    ? 'border-[#1a73e8] bg-[#e8f0fe] shadow-sm'
                    : 'border-[#dadce0] bg-white hover:border-[#1a73e8]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-[#1a73e8]" />
                    <span className="text-xs font-bold text-[#202124]">Envoy Edge API Gateway</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e6f4ea] text-[#137333]">
                    TLS 1.3
                  </span>
                </div>
                <div className="text-[11px] text-[#5f6368] flex items-center justify-between">
                  <span>Quota: 25k req/s</span>
                  <span className="font-mono text-[#1a73e8]">Conns: 7.4k</span>
                </div>
              </div>

              {/* Redis Cache */}
              <div
                onClick={() => setSelectedNode(topology?.layers[2]?.nodes[0])}
                className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                  !cacheWarm
                    ? 'border-[#ea4335] bg-[#fce8e6]'
                    : selectedNode?.id === 'cache-redis'
                    ? 'border-[#1a73e8] bg-[#e8f0fe]'
                    : 'border-[#dadce0] bg-white hover:border-[#1a73e8]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Zap className={`w-4 h-4 ${cacheWarm ? 'text-[#34a853]' : 'text-[#ea4335]'}`} />
                    <span className="text-xs font-bold text-[#202124]">Redis Spatial Geohash</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    cacheWarm ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-[#fce8e6] text-[#c5221f]'
                  }`}>
                    {cacheWarm ? 'HIT (0.8ms)' : 'COLD MISS'}
                  </span>
                </div>
                <div className="text-[11px] text-[#5f6368] flex items-center justify-between">
                  <span>RAM: 1.42 GB</span>
                  <span className="font-mono">{cacheWarm ? '98.6% Hit' : '4.2% Hit'}</span>
                </div>
              </div>
            </div>

            {/* Connecting Pulse Vector 2 */}
            <div className="flex justify-center my-1">
              <div className="flex items-center gap-2 text-xs text-[#5f6368] font-mono bg-[#f1f3f4] px-3 py-0.5 rounded-full">
                <span>gRPC Connection Mesh</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Layer 4: Scalable Worker Pods */}
            <div className="my-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#70757a] mb-2">
                Tier 4: Distributed Worker Compute Pods
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {topology?.layers[3]?.nodes.map(pod => {
                  const isCrashed = failedPodId === pod.id;
                  return (
                    <div
                      key={pod.id}
                      onClick={() => setSelectedNode(pod)}
                      className={`cursor-pointer p-3 rounded-xl border transition-all text-left ${
                        isCrashed
                          ? 'border-[#ea4335] bg-[#fce8e6]'
                          : selectedNode?.id === pod.id
                          ? 'border-[#1a73e8] bg-[#e8f0fe]'
                          : 'border-[#dadce0] bg-white hover:border-[#1a73e8]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Cpu className={`w-3.5 h-3.5 ${isCrashed ? 'text-[#ea4335]' : 'text-[#1a73e8]'}`} />
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          isCrashed ? 'bg-[#ea4335] text-white' : 'bg-[#e6f4ea] text-[#137333]'
                        }`}>
                          {isCrashed ? 'CRASHED' : 'HEALTHY'}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-[#202124] truncate">{pod.name}</div>
                      <div className="text-[10px] text-[#5f6368] mt-1">
                        CPU: {isCrashed ? '0%' : `${metrics?.workerCpu || pod.cpu}%`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Connecting Pulse Vector 3 */}
            <div className="flex justify-center my-1">
              <div className="flex items-center gap-2 text-xs text-[#5f6368] font-mono bg-[#f1f3f4] px-3 py-0.5 rounded-full">
                <span>SQL Connection Pool & WAL Replication</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Layer 5: Database & Event Bus */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              {/* Postgres Primary */}
              <div
                onClick={() => setSelectedNode(topology?.layers[4]?.nodes[0])}
                className={`cursor-pointer p-3 rounded-xl border transition-all ${
                  dbPoolSaturated
                    ? 'border-[#ea4335] bg-[#fce8e6]'
                    : selectedNode?.id === 'db-postgres-primary'
                    ? 'border-[#1a73e8] bg-[#e8f0fe]'
                    : 'border-[#dadce0] bg-white hover:border-[#1a73e8]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-[#1a73e8]" />
                    <span className="text-xs font-bold text-[#202124]">Neon Postgres Primary</span>
                  </div>
                </div>
                <div className="text-[11px] text-[#5f6368] flex items-center justify-between">
                  <span>Pool: {metrics?.dbPoolUsage || 28}%</span>
                  <span className="font-mono text-[#1a73e8]">4,200 IOPS</span>
                </div>
              </div>

              {/* Postgres Read Replica */}
              <div
                onClick={() => setSelectedNode(topology?.layers[4]?.nodes[1])}
                className={`cursor-pointer p-3 rounded-xl border transition-all ${
                  partitionActive
                    ? 'border-[#fbbc04] bg-[#fef7e0]'
                    : selectedNode?.id === 'db-postgres-replica'
                    ? 'border-[#1a73e8] bg-[#e8f0fe]'
                    : 'border-[#dadce0] bg-white hover:border-[#1a73e8]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-[#34a853]" />
                    <span className="text-xs font-bold text-[#202124]">Read Replica (AZ-West)</span>
                  </div>
                  {partitionActive && (
                    <span className="text-[10px] font-bold text-[#b06000]">ISOLATED</span>
                  )}
                </div>
                <div className="text-[11px] text-[#5f6368] flex items-center justify-between">
                  <span>Lag: {partitionActive ? '∞' : '1.2ms'}</span>
                  <span className="font-mono">Read-Only</span>
                </div>
              </div>

              {/* Kafka Event Bus */}
              <div
                onClick={() => setSelectedNode(topology?.layers[4]?.nodes[2])}
                className={`cursor-pointer p-3 rounded-xl border transition-all ${
                  selectedNode?.id === 'bus-kafka'
                    ? 'border-[#1a73e8] bg-[#e8f0fe]'
                    : 'border-[#dadce0] bg-white hover:border-[#1a73e8]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-[#e37400]" />
                    <span className="text-xs font-bold text-[#202124]">Kafka Event Stream</span>
                  </div>
                </div>
                <div className="text-[11px] text-[#5f6368] flex items-center justify-between">
                  <span>16 Partitions</span>
                  <span className="font-mono text-[#e37400]">8.4k msg/s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Packet Trace Journey */}
          {metrics?.packetPath && (
            <div className="mt-4 pt-4 border-t border-[#dadce0]">
              <div className="text-xs font-bold text-[#202124] mb-2 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#1a73e8]" />
                Simulated Request Packet Journey
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px]">
                {metrics.packetPath.map(step => (
                  <div key={step.step} className="p-2 rounded-lg bg-[#f8fafd] border border-[#dadce0]">
                    <div className="font-bold text-[#1a73e8] flex items-center justify-between">
                      <span>Step {step.step}</span>
                      <span>{step.latencyMs}ms</span>
                    </div>
                    <div className="text-[#202124] font-medium truncate mt-0.5">{step.node}</div>
                    <div className="text-[#5f6368] text-[10px] mt-0.5 line-clamp-1">{step.event}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Chaos Engineering & System Control Deck (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Traffic Throttler & Slider */}
          <div className="bg-white border border-[#dadce0] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#1a73e8]" />
                Traffic Ingestion Control
              </h3>
              <span className="text-xs font-mono font-bold text-[#1a73e8] bg-[#e8f0fe] px-2.5 py-1 rounded-full">
                {trafficRps.toLocaleString()} RPS
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs text-[#5f6368] mb-1.5 font-medium">
                <span>Low (100)</span>
                <span>Peak (10,000)</span>
                <span>Surge (25,000)</span>
              </div>
              <input
                type="range"
                min="100"
                max="25000"
                step="500"
                value={trafficRps}
                onChange={(e) => setTrafficRps(Number(e.target.value))}
                className="w-full accent-[#1a73e8] cursor-pointer"
              />
            </div>
          </div>

          {/* Chaos Engineering Injectors */}
          <div className="bg-white border border-[#dadce0] rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#ea4335]" />
              Chaos Failure Injectors
            </h3>

            <div className="space-y-2.5">
              {/* Cache Invalidation / Stampede */}
              <button
                onClick={() => setCacheWarm(!cacheWarm)}
                className={`w-full p-3 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all ${
                  !cacheWarm
                    ? 'bg-[#fce8e6] border-[#ea4335] text-[#c5221f]'
                    : 'bg-[#f8fafd] border-[#dadce0] text-[#202124] hover:bg-[#e8f0fe]'
                }`}
              >
                <div>
                  <div className="font-bold">Invalidate Redis Geohash Cache</div>
                  <div className="text-[11px] text-[#5f6368]">
                    {cacheWarm ? 'Currently warm (0.8ms hits)' : 'Stampede: 100% hits drop to DB'}
                  </div>
                </div>
                <Zap className={`w-4 h-4 ${!cacheWarm ? 'text-[#ea4335]' : 'text-[#5f6368]'}`} />
              </button>

              {/* Saturate Connection Pool */}
              <button
                onClick={() => setDbPoolSaturated(!dbPoolSaturated)}
                className={`w-full p-3 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all ${
                  dbPoolSaturated
                    ? 'bg-[#fce8e6] border-[#ea4335] text-[#c5221f]'
                    : 'bg-[#f8fafd] border-[#dadce0] text-[#202124] hover:bg-[#e8f0fe]'
                }`}
              >
                <div>
                  <div className="font-bold">Exhaust DB Connection Pool (100/100)</div>
                  <div className="text-[11px] text-[#5f6368]">
                    {dbPoolSaturated ? 'Connections 100% locked; queue spikes' : 'Connections available (28%)'}
                  </div>
                </div>
                <Database className={`w-4 h-4 ${dbPoolSaturated ? 'text-[#ea4335]' : 'text-[#5f6368]'}`} />
              </button>

              {/* Kill Worker Pod 2 */}
              <button
                onClick={() => setFailedPodId(failedPodId ? null : 'pod-match-2')}
                className={`w-full p-3 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all ${
                  failedPodId
                    ? 'bg-[#fce8e6] border-[#ea4335] text-[#c5221f]'
                    : 'bg-[#f8fafd] border-[#dadce0] text-[#202124] hover:bg-[#e8f0fe]'
                }`}
              >
                <div>
                  <div className="font-bold">Kill Worker Pod 2 (Crash Simulation)</div>
                  <div className="text-[11px] text-[#5f6368]">
                    {failedPodId ? 'Pod dead: Traffic re-routed to Pod 1' : 'All 4 pods healthy'}
                  </div>
                </div>
                <Cpu className={`w-4 h-4 ${failedPodId ? 'text-[#ea4335]' : 'text-[#5f6368]'}`} />
              </button>

              {/* Network Partition */}
              <button
                onClick={() => setPartitionActive(!partitionActive)}
                className={`w-full p-3 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all ${
                  partitionActive
                    ? 'bg-[#fef7e0] border-[#fbbc04] text-[#b06000]'
                    : 'bg-[#f8fafd] border-[#dadce0] text-[#202124] hover:bg-[#e8f0fe]'
                }`}
              >
                <div>
                  <div className="font-bold">Sever West AZ Cross-Region Link</div>
                  <div className="text-[11px] text-[#5f6368]">
                    {partitionActive ? 'CAP Theorem Partition: Read-only replica isolated' : 'Replication synchronized'}
                  </div>
                </div>
                <Wifi className={`w-4 h-4 ${partitionActive ? 'text-[#fbbc04]' : 'text-[#5f6368]'}`} />
              </button>
            </div>
          </div>

          {/* Node Deep Dive Telemetry Drawer */}
          <div className="bg-white border border-[#dadce0] rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#202124] flex items-center gap-2">
              <Info className="w-4 h-4 text-[#1a73e8]" />
              Node Inspector
            </h3>

            {selectedNode ? (
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-[#f8fafd] rounded-xl border border-[#dadce0] space-y-1">
                  <div className="text-[10px] text-[#70757a] font-bold uppercase">Component Identity</div>
                  <div className="font-bold text-sm text-[#202124]">{selectedNode.name}</div>
                  <div className="text-[11px] text-[#5f6368] font-mono">ID: {selectedNode.id}</div>
                  <div className="text-[11px] text-[#5f6368] font-mono">IP: {selectedNode.ip || '10.0.0.1'}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 bg-[#f8fafd] rounded-lg border border-[#dadce0]">
                    <span className="text-[#5f6368]">Node Type:</span>
                    <div className="font-bold text-[#202124]">{selectedNode.type}</div>
                  </div>
                  <div className="p-2.5 bg-[#f8fafd] rounded-lg border border-[#dadce0]">
                    <span className="text-[#5f6368]">Status:</span>
                    <div className="font-bold text-[#34a853]">
                      {failedPodId === selectedNode.id ? 'CRASHED' : selectedNode.status}
                    </div>
                  </div>
                </div>

                {selectedNode.cpu && (
                  <div className="p-2.5 bg-[#f8fafd] rounded-lg border border-[#dadce0] text-[11px]">
                    <div className="flex justify-between mb-1">
                      <span className="text-[#5f6368]">CPU Utilization:</span>
                      <span className="font-bold text-[#202124]">{selectedNode.cpu}%</span>
                    </div>
                    <div className="w-full bg-[#dadce0] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#1a73e8] h-full" style={{ width: `${selectedNode.cpu}%` }} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-[#5f6368] border border-dashed border-[#dadce0] rounded-xl">
                Click any node in the topology canvas to inspect live connection threads, memory buffers, and configuration.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
