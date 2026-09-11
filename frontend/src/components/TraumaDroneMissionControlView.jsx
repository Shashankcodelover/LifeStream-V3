import React, { useState, useEffect, useRef } from 'react';
import {
  Radio, ShieldAlert, HeartPulse, Droplet, ArrowRight, CheckCircle2,
  AlertTriangle, Compass, Wind, Thermometer, BatteryCharging, RefreshCw,
  Send, ExternalLink, Zap, Lock, Cpu
} from 'lucide-react';

export function TraumaDroneMissionControlView() {
  // State: Triage Inputs & Results
  const [patientAge, setPatientAge] = useState(34);
  const [heartRate, setHeartRate] = useState(128);
  const [systolicBp, setSystolicBp] = useState(82);
  const [lactateMmol, setLactateMmol] = useState(4.8);
  const [mechanism, setMechanism] = useState('High-Speed Motor Vehicle Collision');
  const [triageData, setTriageData] = useState(null);
  const [triageLoading, setTriageLoading] = useState(false);

  // State: Airspace Telemetry
  const [airspaceData, setAirspaceData] = useState(null);

  // State: Cross-Match Lab
  const [donorType, setDonorType] = useState('O-');
  const [recipientType, setRecipientType] = useState('A+');
  const [crossMatchResult, setCrossMatchResult] = useState(null);
  const [crossMatchLoading, setCrossMatchLoading] = useState(false);

  // State: Inter-Hospital Swaps
  const [swaps, setSwaps] = useState([]);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [swapReqHospital, setSwapReqHospital] = useState('Zuckerberg San Francisco General Hospital');
  const [swapOffHospital, setSwapOffHospital] = useState('Stanford Health Care');
  const [swapComponentReq, setSwapComponentReq] = useState('Platelets (Apheresis)');
  const [swapUnitsReq, setSwapUnitsReq] = useState(2);
  const [dispatchFeedback, setDispatchFeedback] = useState(null);

  const canvasRef = useRef(null);

  // Fetch initial triage assessment
  const evaluateTriage = async () => {
    setTriageLoading(true);
    try {
      const res = await fetch('/api/trauma-network/triage-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientAge: Number(patientAge),
          heartRate: Number(heartRate),
          systolicBp: Number(systolicBp),
          lactateMmol: Number(lactateMmol),
          mechanismOfInjury: mechanism
        })
      });
      const data = await res.json();
      if (data.success) {
        setTriageData(data.triageEvaluation);
      }
    } catch (err) {
      console.error('Triage assessment failed:', err);
    } finally {
      setTriageLoading(false);
    }
  };

  // Fetch Airspace Telemetry
  const fetchAirspace = async () => {
    try {
      const res = await fetch('/api/trauma-network/drone-airspace');
      const data = await res.json();
      if (data.success) {
        setAirspaceData(data);
      }
    } catch (err) {
      console.error('Airspace fetch failed:', err);
    }
  };

  // Fetch Swaps
  const fetchSwaps = async () => {
    try {
      const res = await fetch('/api/trauma-network/inter-hospital-swaps');
      const data = await res.json();
      if (data.success) {
        setSwaps(data.swaps);
      }
    } catch (err) {
      console.error('Swaps fetch failed:', err);
    }
  };

  // Execute Cross-Match Test
  const testCrossMatch = async () => {
    setCrossMatchLoading(true);
    try {
      const res = await fetch('/api/trauma-network/cross-match-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorBloodType: donorType,
          recipientBloodType: recipientType,
          antibodiesScreened: ['Anti-D']
        })
      });
      const data = await res.json();
      if (data.success) {
        setCrossMatchResult(data);
      }
    } catch (err) {
      console.error('Cross-match failed:', err);
    } finally {
      setCrossMatchLoading(false);
    }
  };

  // Execute Inter-Hospital Swap
  const handleExecuteSwap = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/trauma-network/execute-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestingHospital: swapReqHospital,
          offeringHospital: swapOffHospital,
          componentRequested: swapComponentReq,
          unitsRequested: Number(swapUnitsReq),
          componentOffered: 'Packed Red Blood Cells (PRBC, O+)',
          unitsOffered: 4,
          reason: 'Emergency Regional Trauma Re-balancing'
        })
      });
      const data = await res.json();
      if (data.success) {
        setSwapModalOpen(false);
        fetchSwaps();
        setDispatchFeedback('Emergency swap verified & automated drone courier scheduled.');
        setTimeout(() => setDispatchFeedback(null), 5000);
      }
    } catch (err) {
      console.error('Swap execution failed:', err);
    }
  };

  useEffect(() => {
    evaluateTriage();
    fetchAirspace();
    fetchSwaps();
    testCrossMatch();

    const interval = setInterval(() => {
      fetchAirspace();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Airspace Canvas Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let t = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      // Dark Radar Grid
      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(0, 0, w, h);

      // Grid Lines
      ctx.strokeStyle = 'rgba(66, 133, 244, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Rotating Radar Sweep
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(t * 0.02);
      const sweepGrad = ctx.createLinearGradient(0, 0, w / 2, h / 2);
      sweepGrad.addColorStop(0, 'rgba(52, 168, 83, 0.25)');
      sweepGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, Math.min(w, h) * 0.48, 0, Math.PI / 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // No Fly Zones (NFZ Rings)
      const nfzList = [
        { x: w * 0.78, y: h * 0.72, r: 42, label: 'SFO Class B' },
        { x: w * 0.35, y: h * 0.55, r: 26, label: 'Sutro Tower' },
        { x: w * 0.65, y: h * 0.25, r: 24, label: 'Salesforce Mast' }
      ];

      nfzList.forEach(nfz => {
        ctx.strokeStyle = 'rgba(234, 67, 53, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(nfz.x, nfz.y, nfz.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(234, 67, 53, 0.15)';
        ctx.fill();

        ctx.fillStyle = '#ea4335';
        ctx.font = '10px monospace';
        ctx.fillText(nfz.label, nfz.x - 22, nfz.y + 4);
      });

      // Trauma Centers
      const centers = [
        { x: w * 0.52, y: h * 0.58, label: 'SFGH Trauma 1', beds: '8 ICU' },
        { x: w * 0.38, y: h * 0.42, label: 'UCSF Parnassus', beds: '12 ICU' },
        { x: w * 0.55, y: h * 0.28, label: 'CPMC Van Ness', beds: '5 ICU' }
      ];

      centers.forEach(c => {
        ctx.fillStyle = '#4285f4';
        ctx.beginPath();
        ctx.arc(c.x, c.y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(c.label, c.x + 10, c.y - 2);
        ctx.fillStyle = '#34a853';
        ctx.font = '10px monospace';
        ctx.fillText(c.beds, c.x + 10, c.y + 11);
      });

      // In-flight Drones & Corridors
      const droneA_x = (w * 0.38) + (Math.sin(t * 0.03) * 60) + 40;
      const droneA_y = (h * 0.42) + (Math.cos(t * 0.03) * 40) + 30;

      // Flight Vector Trajectory Line
      ctx.strokeStyle = 'rgba(52, 168, 83, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.38, h * 0.42);
      ctx.lineTo(w * 0.52, h * 0.58);
      ctx.stroke();

      // Drone Beacon
      ctx.fillStyle = '#34a853';
      ctx.beginPath();
      ctx.arc(droneA_x, droneA_y, 7, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing Ring
      const pulseR = 7 + (Math.sin(t * 0.1) + 1) * 6;
      ctx.strokeStyle = 'rgba(52, 168, 83, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(droneA_x, droneA_y, pulseR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#34a853';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('LIFEDRONE-ALPHA (3.8°C | 110 km/h)', droneA_x + 12, droneA_y + 4);

      t += 1;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="pt-20 pb-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0d1b2a] via-[#1b263b] to-[#0a1128] rounded-2xl p-6 border border-[#415a77]/40 shadow-xl text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f0fe]/10 text-[#64b5f6] border border-[#64b5f6]/30 text-xs font-semibold mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>LifeStream Enterprise V5.0 · Autonomous Trauma Network</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Trauma Triage, Autonomous Airspace & Inter-Hospital Swaps
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl">
              Real-time ATLS Class I-IV Hemorrhagic Shock staging, automated MTP hemostatic pack synthesis,
              dynamic eVTOL obstacle avoidance routing, and 2°C–6°C IoT cold-chain telemetry.
            </p>
          </div>

          <button
            onClick={() => setSwapModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1a73e8] to-[#4285f4] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Initiate Hospital Swap</span>
          </button>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="text-xs text-slate-400">Active Airspace Couriers</div>
            <div className="text-xl font-black text-[#4ade80] flex items-center gap-2 mt-0.5">
              <span>2 In-Flight</span>
              <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-ping" />
            </div>
            <div className="text-[11px] text-slate-300">100% On-Schedule</div>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="text-xs text-slate-400">Level 1 Trauma Capacity</div>
            <div className="text-xl font-black text-[#60a5fa] mt-0.5">41 Available Beds</div>
            <div className="text-[11px] text-slate-300">Across 4 Facilities</div>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="text-xs text-slate-400">O-Negative Reserves</div>
            <div className="text-xl font-black text-[#f87171] mt-0.5">67 Units Total</div>
            <div className="text-[11px] text-slate-300">SF Bay Area Grid</div>
          </div>

          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="text-xs text-slate-400">IoT Cold-Chain Integrity</div>
            <div className="text-xl font-black text-[#fbbf24] mt-0.5">3.8°C Avg (Nominal)</div>
            <div className="text-[11px] text-slate-300">Allowable 2.0°C - 6.0°C</div>
          </div>
        </div>
      </div>

      {dispatchFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{dispatchFeedback}</span>
        </div>
      )}

      {/* Main Grid: Airspace Radar (Left) & Shock Triage (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Airspace Radar Map (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#1a73e8]" />
                <h2 className="font-bold text-base text-slate-800">
                  Autonomous eVTOL Airspace Radar & Geofenced Corridors
                </h2>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold">
                ADS-B ACTIVE
              </span>
            </div>

            {/* Canvas Area */}
            <div className="relative rounded-xl overflow-hidden border border-slate-300">
              <canvas
                ref={canvasRef}
                width={700}
                height={380}
                className="w-full h-auto block"
              />
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-xs font-mono flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Trauma Centers
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Drones
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> NFZs
                </span>
              </div>
            </div>

            {/* Live Drone Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {(airspaceData?.activeDrones || []).map((drone) => (
                <div key={drone.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{drone.callsign}</span>
                    <span className="text-emerald-600">{drone.status}</span>
                  </div>
                  <div className="text-slate-500">Payload: <strong className="text-slate-700">{drone.payload.units}x {drone.payload.component} ({drone.payload.bloodType})</strong></div>
                  <div className="flex items-center justify-between text-slate-600 font-mono text-[11px] pt-1 border-t border-slate-200">
                    <span>Temp: <strong className="text-amber-600">{drone.coldChain.temperatureCelsius}°C</strong></span>
                    <span>Speed: {drone.speedKmh} km/h</span>
                    <span>Battery: {drone.batteryPercent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coombs Cross-Match Lab */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-[#ea4335]" />
                <h2 className="font-bold text-base text-slate-800">
                  Coombs Indirect Antiglobulin Test (IAT) Cross-Match Lab
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">Major & Minor Cross-Match</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Donor RBC Type</label>
                <select
                  value={donorType}
                  onChange={(e) => setDonorType(e.target.value)}
                  className="w-full text-xs font-bold p-2 border border-slate-300 rounded-lg bg-slate-50"
                >
                  {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Recipient Blood Type</label>
                <select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value)}
                  className="w-full text-xs font-bold p-2 border border-slate-300 rounded-lg bg-slate-50"
                >
                  {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1 flex items-end">
                <button
                  onClick={testCrossMatch}
                  disabled={crossMatchLoading}
                  className="w-full text-xs font-bold py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{crossMatchLoading ? 'Analyzing...' : 'Run Coombs Test'}</span>
                </button>
              </div>
            </div>

            {crossMatchResult && (
              <div className={`p-3 rounded-xl border text-xs space-y-1 ${
                crossMatchResult.aboRhCompatible
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="flex justify-between font-bold">
                  <span>Compatibility: {crossMatchResult.aboRhCompatible ? '✅ COMPATIBLE' : '❌ INCOMPATIBLE'}</span>
                  <span>Coombs: {crossMatchResult.coombsTestResult}</span>
                </div>
                <div className="text-[11px] text-slate-600 font-mono">
                  Clearance Token: {crossMatchResult.cryptographicClearanceToken}
                </div>
                <div className="text-xs">{crossMatchResult.clinicalNotes}</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Shock Index & MTP Staging (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-base text-slate-800">
                  ATLS Hemorrhagic Shock Triage & MTP Stager
                </h2>
              </div>
              <button
                onClick={evaluateTriage}
                disabled={triageLoading}
                className="text-xs font-semibold text-[#1a73e8] hover:underline"
              >
                Recompute
              </button>
            </div>

            {/* Input Sliders */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Heart Rate (HR)</span>
                  <span className="font-mono text-slate-900">{heartRate} bpm</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="180"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  className="w-full accent-[#ea4335]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Systolic Blood Pressure (SBP)</span>
                  <span className="font-mono text-slate-900">{systolicBp} mmHg</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="160"
                  value={systolicBp}
                  onChange={(e) => setSystolicBp(e.target.value)}
                  className="w-full accent-[#1a73e8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Lactate (mmol/L)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={lactateMmol}
                    onChange={(e) => setLactateMmol(e.target.value)}
                    className="w-full text-xs font-mono p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Patient Age</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    className="w-full text-xs font-mono p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Staging Results Card */}
            {triageData && (
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Calculated Shock Index</span>
                  <span className="font-mono font-bold text-lg text-amber-400">
                    SI: {triageData.shockIndex} (Age-SI: {triageData.ageShockIndex})
                  </span>
                </div>

                <div className="p-2.5 bg-white/10 rounded-lg border border-white/10">
                  <div className="text-xs text-rose-300 font-bold">{triageData.shockClass}</div>
                  <div className="text-[11px] text-slate-300">Estimated Blood Loss: {triageData.estimatedBloodLossPercent}</div>
                </div>

                {triageData.mtpPack && (
                  <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                    <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <Droplet className="w-3.5 h-3.5 fill-emerald-400" />
                      <span>{triageData.mtpPack.stage}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-slate-200">
                      <div>pRBC: {triageData.mtpPack.pRBCUnits} Units (O-)</div>
                      <div>FFP: {triageData.mtpPack.ffpUnits} Units</div>
                      <div>Platelets: {triageData.mtpPack.plateletUnits} Apheresis</div>
                      <div>Cryo: {triageData.mtpPack.cryoprecipitateUnits} Units</div>
                    </div>
                    <div className="text-[10px] text-slate-400 pt-1">
                      TXA: {triageData.mtpPack.txaDosage}
                    </div>
                  </div>
                )}

                {triageData.optimalTraumaCenter && (
                  <div className="p-3 bg-blue-950/60 border border-blue-500/30 rounded-lg text-xs space-y-1">
                    <div className="text-blue-300 font-bold">Recommended Destination:</div>
                    <div className="text-white font-semibold">{triageData.optimalTraumaCenter.name}</div>
                    <div className="text-[11px] text-slate-300 flex justify-between font-mono">
                      <span>Drone ETA: {triageData.optimalTraumaCenter.estimatedDroneMin} min</span>
                      <span>O- Depth: {triageData.optimalTraumaCenter.bloodBankReserve['O-']} units</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setDispatchFeedback(`STAT MTP drone courier dispatched to ${triageData.optimalTraumaCenter?.name || 'SFGH'}. Priority airspace corridor cleared.`);
                    setTimeout(() => setDispatchFeedback(null), 6000);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-lg text-xs tracking-wide shadow-lg hover:brightness-110 transition-all"
                >
                  DISPATCH STAT MTP DRONE FLEET
                </button>
              </div>
            )}
          </div>

          {/* Inter-Hospital Swaps Ledger */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-[#1a73e8]" />
                <span>Inter-Hospital Rebalancing Swaps</span>
              </h2>
              <span className="text-xs text-slate-400">{swaps.length} Records</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {swaps.map(s => (
                <div key={s.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span className="text-[#1a73e8]">{s.id}</span>
                    <span className="text-emerald-700 font-mono text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {s.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <strong>{s.requestingHospital.split(' ')[0]}</strong> ← {s.unitsRequested}x {s.componentRequested} from <strong>{s.offeringHospital.split(' ')[0]}</strong>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">
                    Voucher: {s.escrowVoucherHash}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Initiate Swap */}
      {swapModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-in">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="font-bold text-lg text-slate-900">Initiate Regional Blood Swap</h3>
              <button onClick={() => setSwapModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleExecuteSwap} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Requesting Trauma Center</label>
                <input
                  type="text"
                  value={swapReqHospital}
                  onChange={(e) => setSwapReqHospital(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Offering Facility</label>
                <input
                  type="text"
                  value={swapOffHospital}
                  onChange={(e) => setSwapOffHospital(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Component Needed</label>
                  <select
                    value={swapComponentReq}
                    onChange={(e) => setSwapComponentReq(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="Platelets (Apheresis)">Platelets (Apheresis)</option>
                    <option value="Packed Red Blood Cells (O-)">PRBC (O-)</option>
                    <option value="Fresh Frozen Plasma">FFP</option>
                    <option value="Cryoprecipitate">Cryoprecipitate</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Units Needed</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={swapUnitsReq}
                    onChange={(e) => setSwapUnitsReq(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSwapModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1a73e8] text-white rounded-lg font-bold hover:bg-blue-600"
                >
                  Broadcast & Mint Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
