import React, { useState, useEffect, useRef } from 'react';
import {
  Code, Play, RotateCcw, FastForward, Rewind, Layers, Zap,
  Activity, Cpu, CheckCircle2, ChevronRight, Sparkles, Sliders,
  Gauge, AlertCircle, Database, Eye, Terminal
} from 'lucide-react';
import { resilientFetch } from '../api/client';

export function AlgorithmStudioView() {
  const [presets, setPresets] = useState({});
  const [benchmarks, setBenchmarks] = useState([]);
  const [selectedPresetId, setSelectedPresetId] = useState('COMPOSITE_MATCHING');
  const [code, setCode] = useState('');
  
  // Execution & Tracer State
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionMetrics, setExecutionMetrics] = useState(null);
  const [traces, setTraces] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1); // 1x, 2x, 5x
  const [benchmarkResult, setBenchmarkResult] = useState(null);

  const playTimerRef = useRef(null);
  const textareaRef = useRef(null);

  // Fetch presets and benchmarks
  useEffect(() => {
    (async () => {
      try {
        const [presetData, benchData] = await Promise.all([
          resilientFetch('/api/algorithm/presets'),
          resilientFetch('/api/algorithm/benchmarks')
        ]);
        if (presetData) {
          setPresets(presetData);
          if (presetData.COMPOSITE_MATCHING) {
            setCode(presetData.COMPOSITE_MATCHING.code);
          }
        }
        if (Array.isArray(benchData)) {
          setBenchmarks(benchData);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Handle Preset Switch
  const handleSelectPreset = (presetId) => {
    setSelectedPresetId(presetId);
    if (presets[presetId]) {
      setCode(presets[presetId].code);
      setTraces([]);
      setCurrentStepIndex(0);
      setExecutionMetrics(null);
      setBenchmarkResult(null);
    }
  };

  // Run Algorithm Simulation
  const handleRunSimulation = async () => {
    setIsExecuting(true);
    setIsPlaying(false);
    if (playTimerRef.current) clearInterval(playTimerRef.current);

    try {
      const data = await resilientFetch('/api/algorithm/run', {
        method: 'POST',
        body: JSON.stringify({ code, presetId: selectedPresetId })
      });
      setExecutionMetrics({
        latencyMicroseconds: data.latencyMicroseconds,
        memoryAllocatedKb: data.memoryAllocatedKb,
        success: data.success,
        error: data.error
      });
      setTraces(data.traces || []);
      setCurrentStepIndex(0);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExecuting(false);
    }
  };

  // Run Multi-Suite Benchmark
  const handleRunBenchmark = async (suiteId) => {
    setIsExecuting(true);
    try {
      const data = await resilientFetch(`/api/algorithm/benchmark-suite/${suiteId}`, {
        method: 'POST',
        body: JSON.stringify({ code })
      });
      setBenchmarkResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExecuting(false);
    }
  };

  // Auto Play Tracer Loop
  useEffect(() => {
    if (isPlaying && traces.length > 0) {
      playTimerRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= traces.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000 / playSpeed);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, traces.length, playSpeed]);

  // Tab key indentation support in code editor
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunSimulation();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const currentTrace = traces[currentStepIndex] || null;
  const lineCount = (code.match(/\n/g) || []).length + 1;

  return (
    <div className="pt-20 pb-12 px-4 sm:px-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      {/* View Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#1a73e8]" />
            <h2 className="text-xl font-bold text-[#202124] tracking-tight">
              LifeStream Studio • Algorithmic Dispatch Engine & Visual State Tracer
            </h2>
            <span className="text-[10px] font-bold bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] px-2.5 py-0.5 rounded-full">
              DAY 2 STARTUP BENCHMARK
            </span>
          </div>
          <p className="text-xs text-[#5f6368] mt-1">
            In-browser developer sandbox, animated memory array execution trace, and microsecond multi-suite benchmark analyzer
          </p>
        </div>

        {/* Algorithm Preset Switcher */}
        <div className="flex items-center gap-1.5 bg-[#f1f3f4] p-1 rounded-2xl border border-[#dadce0]">
          {Object.keys(presets).map(presetKey => (
            <button
              key={presetKey}
              onClick={() => handleSelectPreset(presetKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedPresetId === presetKey
                  ? 'bg-white text-[#1a73e8] shadow-sm'
                  : 'text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              {presets[presetKey].complexity} · {presetKey === 'COMPOSITE_MATCHING' ? 'AI Composite' : presetKey === 'PRIORITY_QUEUE_HEAP' ? 'Priority Heap' : 'Cold-Chain'}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Studio Grid: Code Editor (Left) & Visual Tracer (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT 6 COLS: Monaco-Grade Code Editor */}
        <div className="lg:col-span-6 bg-slate-900 text-white rounded-3xl border border-slate-700 shadow-xl overflow-hidden flex flex-col font-mono">
          {/* Editor Header Bar */}
          <div className="p-3 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Terminal className="w-4 h-4 text-[#1a73e8]" />
              <span className="font-bold">{presets[selectedPresetId]?.name || 'dispatchAlgorithm.js'}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">Ctrl + Enter to Run</span>
              <button
                onClick={handleRunSimulation}
                disabled={isExecuting}
                className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50 font-sans"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isExecuting ? 'Tracing...' : 'Run & Trace'}</span>
              </button>
            </div>
          </div>

          {/* Editor Code Area with Line Numbers */}
          <div className="flex-1 flex min-h-[380px] p-2 bg-[#0d1117] text-xs leading-relaxed overflow-hidden">
            {/* Dynamic Line Numbers */}
            <div className="select-none pr-3 pl-2 text-right text-slate-600 font-mono text-[11px] border-r border-slate-800 space-y-0.5">
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i + 1}>{i + 1}</div>
              ))}
            </div>

            {/* Code Textarea */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck="false"
              className="w-full flex-1 bg-transparent text-emerald-400 px-3 font-mono text-xs outline-none resize-none selection:bg-[#1a73e8]/40 leading-relaxed google-scrollbar"
            />
          </div>

          {/* Editor Status Bar */}
          {executionMetrics && (
            <div className="p-2.5 bg-slate-800/90 border-t border-slate-700 flex items-center justify-between text-[11px] text-slate-300">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${executionMetrics.success ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <span>{executionMetrics.success ? 'Execution Succeeded' : `Error: ${executionMetrics.error}`}</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[10px]">
                <span className="text-sky-400">⚡ {executionMetrics.latencyMicroseconds} μs</span>
                <span className="text-amber-400">💾 {executionMetrics.memoryAllocatedKb} KB Memory</span>
                <span className="text-emerald-400">📊 {traces.length} States Traced</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT 6 COLS: Visual Algorithmic State Tracer */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-[#dadce0] shadow-[0_1px_3px_rgba(60,64,67,0.08)] space-y-4">
            {/* Tracer Header & Scrubber Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#f1f3f4]">
              <div>
                <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#1a73e8]" />
                  <span>Visual Algorithmic State Tracer</span>
                </h3>
                <span className="text-[10px] text-[#5f6368]">
                  Step {traces.length > 0 ? currentStepIndex + 1 : 0} of {traces.length}
                </span>
              </div>

              {/* Scrubber Player Buttons */}
              <div className="flex items-center gap-1 bg-[#f8fafd] p-1 rounded-2xl border border-[#dadce0]">
                <button
                  onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentStepIndex === 0 || traces.length === 0}
                  className="p-1.5 rounded-xl hover:bg-white text-[#5f6368] disabled:opacity-30"
                  title="Step Backward"
                >
                  <Rewind className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={traces.length === 0}
                  className="px-2.5 py-1 rounded-xl bg-[#1a73e8] text-white text-xs font-bold flex items-center gap-1 disabled:opacity-40"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                <button
                  onClick={() => setCurrentStepIndex(prev => Math.min(traces.length - 1, prev + 1))}
                  disabled={currentStepIndex >= traces.length - 1 || traces.length === 0}
                  className="p-1.5 rounded-xl hover:bg-white text-[#5f6368] disabled:opacity-30"
                  title="Step Forward"
                >
                  <FastForward className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => { setCurrentStepIndex(0); setIsPlaying(false); }}
                  disabled={traces.length === 0}
                  className="p-1.5 rounded-xl hover:bg-white text-[#5f6368] disabled:opacity-30"
                  title="Reset Tracer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Speed selector */}
                <button
                  onClick={() => setPlaySpeed(prev => prev === 1 ? 2 : prev === 2 ? 5 : 1)}
                  className="px-2 py-0.5 text-[10px] font-bold text-[#1a73e8] bg-white rounded-lg border border-[#dadce0]"
                >
                  {playSpeed}x
                </button>
              </div>
            </div>

            {/* Slider Scrubber Bar */}
            {traces.length > 0 && (
              <div>
                <input
                  type="range"
                  min="0"
                  max={traces.length - 1}
                  value={currentStepIndex}
                  onChange={e => { setCurrentStepIndex(Number(e.target.value)); setIsPlaying(false); }}
                  className="w-full accent-[#1a73e8] cursor-pointer"
                />
              </div>
            )}

            {/* Memory Array Cells Visualization */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#5f6368] uppercase tracking-wider block">
                Memory Array Buffer (Candidate Donors Evaluation Array):
              </span>
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-1.5 bg-[#f8fafd] p-2.5 rounded-2xl border border-[#dadce0]">
                {traces.map((tr, idx) => {
                  const isActive = idx === currentStepIndex;
                  const isProcessed = idx < currentStepIndex;
                  return (
                    <div
                      key={idx}
                      onClick={() => { setCurrentStepIndex(idx); setIsPlaying(false); }}
                      className={`p-2 rounded-xl text-center font-mono cursor-pointer transition-all border ${
                        isActive
                          ? 'bg-[#1a73e8] text-white border-[#1557b0] shadow-md scale-105 font-bold ring-2 ring-[#1a73e8]/30'
                          : isProcessed
                          ? 'bg-[#e6f4ea] text-[#137333] border-[#ceead6]'
                          : 'bg-white text-[#5f6368] border-[#dadce0]'
                      }`}
                    >
                      <span className="text-[8px] block opacity-70">i={idx}</span>
                      <span className="text-xs font-bold">{tr.computedScore || tr.priorityRank || tr.initialTemp}°</span>
                    </div>
                  );
                })}

                {traces.length === 0 && (
                  <div className="col-span-8 py-6 text-center text-xs text-[#70757a]">
                    Click "Run & Trace" to visualize step-by-step memory allocation.
                  </div>
                )}
              </div>
            </div>

            {/* Active Step Inspection Card (Variable Watch) */}
            {currentTrace ? (
              <div className="bg-[#f8fafd] p-4 rounded-2xl border border-[#dadce0] space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-[#dadce0]">
                  <span className="font-bold text-[#202124] flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#1a73e8]" />
                    <span>Pointer State (Step #{currentTrace.stepIndex}):</span>
                  </span>
                  <span className="text-[10px] font-bold bg-[#e8f0fe] text-[#1a73e8] px-2 py-0.5 rounded-full font-mono">
                    Candidate: {currentTrace.donorName || currentTrace.dispatchId || currentTrace.heapExtractMin}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-[11px] pt-1">
                  {currentTrace.distanceMiles !== undefined && (
                    <div className="bg-white p-2 rounded-xl border border-[#dadce0]">
                      <span className="text-[9px] text-[#5f6368] block font-sans">DISTANCE</span>
                      <span className="font-bold text-[#202124]">{currentTrace.distanceMiles} mi</span>
                    </div>
                  )}

                  {currentTrace.computedScore !== undefined && (
                    <div className="bg-white p-2 rounded-xl border border-[#dadce0]">
                      <span className="text-[9px] text-[#5f6368] block font-sans">AI SCORE</span>
                      <span className="font-bold text-[#137333]">{currentTrace.computedScore}%</span>
                    </div>
                  )}

                  {currentTrace.proximityScore !== undefined && (
                    <div className="bg-white p-2 rounded-xl border border-[#dadce0]">
                      <span className="text-[9px] text-[#5f6368] block font-sans">PROXIMITY DECAY</span>
                      <span className="font-bold text-[#1a73e8]">{currentTrace.proximityScore}/100</span>
                    </div>
                  )}

                  {currentTrace.estArrivalMins !== undefined && (
                    <div className="bg-white p-2 rounded-xl border border-[#dadce0]">
                      <span className="text-[9px] text-[#5f6368] block font-sans">PRIORITY ETA</span>
                      <span className="font-bold text-[#b06000]">~{currentTrace.estArrivalMins}m</span>
                    </div>
                  )}

                  {currentTrace.projectedTemp !== undefined && (
                    <div className="bg-white p-2 rounded-xl border border-[#dadce0]">
                      <span className="text-[9px] text-[#5f6368] block font-sans">PROJECTED TEMP</span>
                      <span className="font-bold text-[#137333]">{currentTrace.projectedTemp}°C</span>
                    </div>
                  )}
                </div>

                {/* Memory Snapshot Watch */}
                {currentTrace.memorySnapshot && (
                  <div className="mt-2 p-2.5 rounded-xl bg-white border border-[#dadce0] text-[10px] text-[#5f6368] font-mono flex items-center justify-between">
                    <span>Memory Snapshot:</span>
                    <span className="text-[#1a73e8] font-bold">
                      {JSON.stringify(currentTrace.memorySnapshot)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#f8fafd] border border-[#dadce0] text-center text-xs text-[#70757a]">
                Execute the algorithm to inspect live pointer states and variable watch.
              </div>
            )}
          </div>

          {/* Multi-Suite Benchmark Runner */}
          <div className="bg-white p-5 rounded-3xl border border-[#dadce0] shadow-[0_1px_3px_rgba(60,64,67,0.08)] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-[#ea4335]" />
                <span>Multi-Suite Benchmark Diff Harness</span>
              </h3>
              <span className="text-[10px] text-[#5f6368]">O(N) vs O(N log K) Stress Testing</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {benchmarks.map(suite => (
                <button
                  key={suite.id}
                  onClick={() => handleRunBenchmark(suite.id)}
                  disabled={isExecuting}
                  className="p-2.5 rounded-2xl bg-[#f8fafd] hover:bg-[#e8f0fe] border border-[#dadce0] text-left transition-all text-xs space-y-1"
                >
                  <span className="font-bold text-[#202124] block leading-tight">{suite.name}</span>
                  <span className="text-[10px] text-[#1a73e8] block">N={suite.inputSize} Candidates</span>
                </button>
              ))}
            </div>

            {/* Benchmark Result Card */}
            {benchmarkResult && (
              <div className="p-3.5 rounded-2xl bg-[#e6f4ea] border border-[#ceead6] space-y-2 text-xs animate-fade-in font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#137333] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Benchmark Passed: {benchmarkResult.suiteName}</span>
                  </span>
                  <span className="text-[10px] bg-white text-[#137333] px-2 py-0.5 rounded-full border border-[#ceead6]">
                    N={benchmarkResult.inputSize}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1">
                  <div className="bg-white p-2 rounded-xl border border-[#ceead6]">
                    <span className="text-[#5f6368] block">EXEC LATENCY</span>
                    <span className="text-xs font-bold text-[#1a73e8]">{benchmarkResult.performance.latencyMicroseconds} μs</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-[#ceead6]">
                    <span className="text-[#5f6368] block">THROUGHPUT</span>
                    <span className="text-xs font-bold text-[#137333]">{benchmarkResult.performance.throughputOpsPerSec.toLocaleString()} ops/s</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-[#ceead6]">
                    <span className="text-[#5f6368] block">ALLOCATION</span>
                    <span className="text-xs font-bold text-[#b06000]">{benchmarkResult.performance.memoryAllocatedKb} KB</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
