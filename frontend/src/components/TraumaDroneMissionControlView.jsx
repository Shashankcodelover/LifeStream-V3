import React, { useState, useEffect, useRef } from 'react';
import {
  Radio, ShieldAlert, HeartPulse, Droplet, ArrowRight, CheckCircle2,
  AlertTriangle, Compass, Wind, Thermometer, BatteryCharging, RefreshCw,
  Send, ExternalLink, Zap, Lock, Cpu, Volume2, VolumeX, FileCheck, Award,
  Navigation, Flame, Eye, X, Play, Square, ShieldCheck
} from 'lucide-react';
import { playATCClearance, stopATCAudio, playRadioMicClick, playRadioSquelchBurst } from '../utils/atcAudio';

export function TraumaDroneMissionControlView() {
  // State: Triage Inputs & Results
  const [patientAge, setPatientAge] = useState(34);
  const [heartRate, setHeartRate] = useState(128);
  const [systolicBp, setSystolicBp] = useState(82);
  const [lactateMmol, setLactateMmol] = useState(4.8);
  const [mechanism, setMechanism] = useState('High-Speed Motor Vehicle Collision');
  const [triageData, setTriageData] = useState(null);
  const [triageLoading, setTriageLoading] = useState(false);

  // State: Airspace Telemetry & Dynamic Obstacles
  const [airspaceData, setAirspaceData] = useState(null);
  const [obstacles, setObstacles] = useState([]);
  const [reroutePlan, setReroutePlan] = useState(null);
  const [anomalyLoading, setAnomalyLoading] = useState(false);

  // State: FAA Radio ATC Communications
  const [atcClearances, setAtcClearances] = useState([]);
  const [activeATCIndex, setActiveATCIndex] = useState(0);
  const [isBroadcastingATC, setIsBroadcastingATC] = useState(false);

  // State: Cryptographic Custody Passport Modal
  const [custodyModalOpen, setCustodyModalOpen] = useState(false);
  const [custodyPassport, setCustodyPassport] = useState(null);
  const [custodyLoading, setCustodyLoading] = useState(false);

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

  // Fetch Airspace Telemetry & Active Obstacles
  const fetchAirspace = async () => {
    try {
      const res = await fetch('/api/trauma-network/drone-airspace');
      const data = await res.json();
      if (data.success) {
        setAirspaceData(data);
        if (data.obstacles) {
          setObstacles(data.obstacles);
        }
      }
    } catch (err) {
      console.error('Airspace fetch failed:', err);
    }
  };

  // Fetch ATC Clearances
  const fetchATCClearances = async () => {
    try {
      const res = await fetch('/api/trauma-network/atc-clearances');
      const data = await res.json();
      if (data.success && data.clearances) {
        setAtcClearances(data.clearances);
      }
    } catch (err) {
      console.error('ATC clearances fetch failed:', err);
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

  // Calculate Dynamic Airspace Reroute
  const recalculateReroute = async () => {
    try {
      const res = await fetch('/api/trauma-network/calculate-reroute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: { lat: 37.7650, lng: -122.4180 },
          destination: { lat: 37.7558, lng: -122.4047 },
          droneCallsign: 'LifeStream Lifter-01'
        })
      });
      const data = await res.json();
      if (data.success) {
        setReroutePlan(data.reroutePlan);
      }
    } catch (err) {
      console.error('Reroute calculation failed:', err);
    }
  };

  // Inject High-Wind Anomaly or TFR
  const handleInjectObstacle = async (type, name, windSpeed, radius, desc) => {
    setAnomalyLoading(true);
    try {
      const res = await fetch('/api/trauma-network/inject-obstacle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          name,
          center: { lat: 37.7600, lng: -122.4120 },
          radiusMeters: radius,
          windSpeedKnots: windSpeed,
          severity: 'CRITICAL_GEOFENCE_BREACH',
          description: desc
        })
      });
      const data = await res.json();
      if (data.success) {
        await fetchAirspace();
        await recalculateReroute();
        await fetchATCClearances();
        setDispatchFeedback(`⚠️ Airspace Anomaly Injected: ${name}. Dynamic polygon bypass corridor computed.`);
        setTimeout(() => setDispatchFeedback(null), 6000);
      }
    } catch (err) {
      console.error('Obstacle injection failed:', err);
    } finally {
      setAnomalyLoading(false);
    }
  };

  // Clear Dynamic Obstacles
  const handleClearObstacles = async () => {
    setAnomalyLoading(true);
    try {
      const res = await fetch('/api/trauma-network/clear-obstacles', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchAirspace();
        setReroutePlan(null);
        await fetchATCClearances();
        setDispatchFeedback('All dynamic weather and TFR obstacles cleared. Direct medical corridors restored.');
        setTimeout(() => setDispatchFeedback(null), 5000);
      }
    } catch (err) {
      console.error('Clear obstacles failed:', err);
    } finally {
      setAnomalyLoading(false);
    }
  };

  // Play Synthesized Radio ATC Voice Clearance
  const handlePlayActiveATC = () => {
    const active = atcClearances[activeATCIndex] || atcClearances[0];
    const script = active?.clearance?.radioClearanceText ||
      'LifeStream Lifter-01, Bay Approach Radar Control. Wind 270 at 14 knots. Cleared corridor Alpha direct.';

    if (isBroadcastingATC) {
      stopATCAudio();
      setIsBroadcastingATC(false);
      return;
    }

    playATCClearance(
      script,
      () => setIsBroadcastingATC(true),
      () => setIsBroadcastingATC(false)
    );
  };

  // Inspect Cryptographic Custody Passport
  const handleInspectCustody = async (droneId) => {
    setCustodyLoading(true);
    setCustodyModalOpen(true);
    try {
      const res = await fetch(`/api/trauma-network/custody-passport/${droneId}`);
      const data = await res.json();
      if (data.success) {
        setCustodyPassport(data.passport);
      }
    } catch (err) {
      console.error('Failed to load custody passport:', err);
    } finally {
      setCustodyLoading(false);
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
    fetchATCClearances();
    recalculateReroute();
    fetchSwaps();
    testCrossMatch();

    const interval = setInterval(() => {
      fetchAirspace();
      fetchATCClearances();
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Airspace Canvas Simulation with Dynamic Obstacles & Curved Bypass
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
      for (let x = 0; x < w; x += 35) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 35) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Range Concentric Distance Rings
      const cx = w / 2;
      const cy = h / 2;
      [80, 150, 220, 290].forEach(r => {
        ctx.strokeStyle = 'rgba(66, 133, 244, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Rotating Radar Sweep Line
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.02);
      const sweepGrad = ctx.createLinearGradient(0, 0, w / 2, h / 2);
      sweepGrad.addColorStop(0, 'rgba(52, 168, 83, 0.28)');
      sweepGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, Math.min(w, h) * 0.55, 0, Math.PI / 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Static No Fly Zones (NFZ Rings)
      const nfzList = [
        { x: w * 0.82, y: h * 0.74, r: 42, label: 'SFO Class B Airspace' },
        { x: w * 0.28, y: h * 0.60, r: 24, label: 'Sutro Mast' },
        { x: w * 0.72, y: h * 0.22, r: 22, label: 'Salesforce Mast' }
      ];

      nfzList.forEach(nfz => {
        ctx.strokeStyle = 'rgba(234, 67, 53, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(nfz.x, nfz.y, nfz.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = 'rgba(234, 67, 53, 0.12)';
        ctx.fill();

        ctx.fillStyle = '#f87171';
        ctx.font = '9px monospace';
        ctx.fillText(nfz.label, nfz.x - 28, nfz.y + 3);
      });

      // Dynamic Obstacles (e.g. Injected Wind Shears / TFRs)
      const hasActiveObstacles = obstacles && obstacles.length > 0;
      const obsX = w * 0.45;
      const obsY = h * 0.49;
      const obsRadius = 45;

      if (hasActiveObstacles) {
        // Pulsing Anomaly Geofence Warning Ring
        const pulseR = obsRadius + (Math.sin(t * 0.08) + 1) * 6;
        ctx.strokeStyle = 'rgba(251, 146, 60, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.beginPath();
        ctx.arc(obsX, obsY, pulseR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Translucent storm cell fill
        const obsGrad = ctx.createRadialGradient(obsX, obsY, 5, obsX, obsY, obsRadius);
        obsGrad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
        obsGrad.addColorStop(1, 'rgba(249, 115, 22, 0.15)');
        ctx.fillStyle = obsGrad;
        ctx.beginPath();
        ctx.arc(obsX, obsY, obsRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('⚠ ANOMALY: WIND >42 KT', obsX - 55, obsY - 10);
        ctx.fillStyle = '#fdba74';
        ctx.font = '9px monospace';
        ctx.fillText('GEOFENCE ACTIVE · PART 135 BYPASS', obsX - 68, obsY + 8);
      }

      // Trauma Centers
      const ucsf = { x: w * 0.36, y: h * 0.38, label: 'UCSF Parnassus', beds: '12 ICU' };
      const sfgh = { x: w * 0.54, y: h * 0.62, label: 'SFGH Trauma 1', beds: '8 ICU' };
      const centers = [sfgh, ucsf, { x: w * 0.58, y: h * 0.26, label: 'CPMC Van Ness', beds: '5 ICU' }];

      centers.forEach(c => {
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(c.x, c.y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(c.label, c.x + 9, c.y - 2);
        ctx.fillStyle = '#34d399';
        ctx.font = '9px monospace';
        ctx.fillText(c.beds, c.x + 9, c.y + 9);
      });

      // Waypoint & Trajectory Visualization
      const bypassWp = { x: w * 0.36, y: h * 0.56, label: 'WP-BRAVO-BYPASS' };

      if (hasActiveObstacles) {
        // Direct flight path (Red Blocked Corridor)
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(ucsf.x, ucsf.y);
        ctx.lineTo(sfgh.x, sfgh.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // AI Optimized Safe Reroute Corridor (Glowing Cyan/Emerald Line through Bypass Waypoint)
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.85)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(ucsf.x, ucsf.y);
        ctx.lineTo(bypassWp.x, bypassWp.y);
        ctx.lineTo(sfgh.x, sfgh.y);
        ctx.stroke();

        // Bypass Waypoint Marker
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(bypassWp.x, bypassWp.y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#a7f3d0';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('◈ WP-BYPASS-01', bypassWp.x - 25, bypassWp.y - 8);
      } else {
        // Direct Safe Flight Corridor (Emerald)
        ctx.strokeStyle = 'rgba(52, 211, 153, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ucsf.x, ucsf.y);
        ctx.lineTo(sfgh.x, sfgh.y);
        ctx.stroke();
      }

      // Animated Drone Courier Beacon along Active Corridor
      let droneX, droneY;
      const cycle = (t * 0.008) % 1; // 0 to 1 loop

      if (hasActiveObstacles) {
        // Traverse Segment 1 (UCSF to Bypass), then Segment 2 (Bypass to SFGH)
        if (cycle < 0.5) {
          const seg1 = cycle * 2;
          droneX = ucsf.x + (bypassWp.x - ucsf.x) * seg1;
          droneY = ucsf.y + (bypassWp.y - ucsf.y) * seg1;
        } else {
          const seg2 = (cycle - 0.5) * 2;
          droneX = bypassWp.x + (sfgh.x - bypassWp.x) * seg2;
          droneY = bypassWp.y + (sfgh.y - bypassWp.y) * seg2;
        }
      } else {
        droneX = ucsf.x + (sfgh.x - ucsf.x) * cycle;
        droneY = ucsf.y + (sfgh.y - ucsf.y) * cycle;
      }

      // Drone Core Marker
      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(droneX, droneY, 7, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing Beacon Ping
      const beaconR = 7 + (Math.sin(t * 0.12) + 1) * 5;
      ctx.strokeStyle = hasActiveObstacles ? 'rgba(251, 146, 60, 0.7)' : 'rgba(52, 211, 153, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(droneX, droneY, beaconR, 0, Math.PI * 2);
      ctx.stroke();

      // Tactical Drone HUD Tag
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('LIFEDRONE-ALPHA (150m AGL)', droneX + 12, droneY - 2);
      ctx.fillStyle = '#6ee7b7';
      ctx.font = '9px monospace';
      ctx.fillText(hasActiveObstacles ? 'REROUTED · 3.8°C NOMINAL' : 'DIRECT CORRIDOR · 3.8°C', droneX + 12, droneY + 10);

      t += 1;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [obstacles]);

  const activeATC = atcClearances[activeATCIndex] || atcClearances[0];

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
              dynamic polygon waypoint obstacle rerouting, FAA Part 135 synthesized radio ATC, and cryptographic 2°C–6°C cold-chain proof.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleInspectCustody('DRONE-V5-ALPHA')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-bold transition-all shadow-sm"
            >
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>CoC Passport</span>
            </button>

            <button
              onClick={() => setSwapModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1a73e8] to-[#4285f4] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Hospital Swap</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="text-xs text-slate-400">Airspace Couriers</div>
            <div className="text-xl font-black text-[#4ade80] flex items-center gap-2 mt-0.5">
              <span>{airspaceData?.activeDrones?.length || 2} In-Flight</span>
              <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-ping" />
            </div>
            <div className="text-[11px] text-slate-300">
              {obstacles.length > 0 ? '⚠️ Dynamic Reroutes Active' : 'Direct Corridors Nominal'}
            </div>
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
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{dispatchFeedback}</span>
        </div>
      )}

      {/* Main Grid: Airspace Radar (Left) & Shock Triage (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Airspace Radar Map & ATC Terminal (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tactical Radar Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#1a73e8]" />
                <h2 className="font-bold text-base text-slate-800">
                  Autonomous eVTOL Airspace Radar & Tactical Geofences
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${
                  obstacles.length > 0
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {obstacles.length > 0 ? 'CORRIDOR REROUTE ACTIVE' : 'ADS-B DIRECT NOMINAL'}
                </span>
              </div>
            </div>

            {/* Tactical Anomaly Injector Toolbar */}
            <div className="p-3 bg-slate-900 rounded-xl text-xs space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-200 font-bold">
                  <Wind className="w-3.5 h-3.5 text-amber-400" />
                  <span>TACTICAL AIRSPACE ANOMALY INJECTOR</span>
                </span>
                <span>Active Hazards: <strong className="text-white">{obstacles.length}</strong></span>
              </div>

              <div className="flex items-center gap-2 flex-wrap pt-1">
                <button
                  onClick={() => handleInjectObstacle(
                    'HIGH_WIND_MICROBURST',
                    'Mission District Microburst',
                    44,
                    1300,
                    '44 kt wind shear cell crossing primary hospital flight path'
                  )}
                  disabled={anomalyLoading}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Wind className="w-3 h-3" />
                  <span>+ High-Wind Cell (44 kts)</span>
                </button>

                <button
                  onClick={() => handleInjectObstacle(
                    'TEMPORARY_FLIGHT_RESTRICTION',
                    'FAA Emergency Incident TFR',
                    0,
                    1500,
                    'Emergency VIP/Fire TFR geofence Part 135 restriction'
                  )}
                  disabled={anomalyLoading}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-semibold flex items-center gap-1.5 transition-all"
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>+ Emergency TFR Geofence</span>
                </button>

                {obstacles.length > 0 && (
                  <button
                    onClick={handleClearObstacles}
                    disabled={anomalyLoading}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center gap-1.5 ml-auto transition-all"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Clear Hazards</span>
                  </button>
                )}
              </div>
            </div>

            {/* Canvas Area */}
            <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-inner">
              <canvas
                ref={canvasRef}
                width={700}
                height={390}
                className="w-full h-auto block"
              />
              <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-[11px] font-mono flex items-center gap-3 border border-white/10">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Trauma Centers
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Drone Couriers
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Active Hazards
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> NFZs
                </span>
              </div>
            </div>

            {/* Dynamic Reroute Flight Telemetry Pill */}
            {reroutePlan && reroutePlan.rerouted && (
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-amber-900">
                  <span className="flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-amber-700" />
                    <span>Dynamic Polygon Bypass Corridor Active</span>
                  </span>
                  <span className="font-mono text-xs">ETA: +{reroutePlan.extraEtaMin} min ({reroutePlan.revisedEtaMin} min total)</span>
                </div>
                <div className="text-amber-800 text-[11px] flex justify-between">
                  <span>Detour: +{reroutePlan.extraDistKm} km</span>
                  <span>Battery Reserve: -{reroutePlan.totalBatteryDrainPct}%</span>
                  <span>Peltier Cooling Load: {reroutePlan.peltierCoolingWatts}W (3.8°C Target)</span>
                </div>
              </div>
            )}

            {/* Live Drone Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(airspaceData?.activeDrones || []).map((drone) => (
                <div key={drone.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs hover:border-slate-300 transition-colors">
                  <div className="flex justify-between items-center font-bold text-slate-800">
                    <span className="text-sm font-extrabold text-slate-900">{drone.callsign}</span>
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-mono text-[10px]">
                      {drone.status}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    Payload: <strong className="text-slate-800">{drone.payload.units}x {drone.payload.component} ({drone.payload.bloodType})</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 font-mono text-[11px] pt-1.5 border-t border-slate-200">
                    <span>Temp: <strong className="text-amber-600">{drone.coldChain.temperatureCelsius}°C</strong></span>
                    <span>Speed: {drone.speedKmh} km/h</span>
                    <span>Batt: {drone.batteryPercent}%</span>
                  </div>
                  <div className="pt-1 flex items-center justify-between">
                    <button
                      onClick={() => handleInspectCustody(drone.id)}
                      className="text-[11px] font-bold text-[#1a73e8] hover:underline flex items-center gap-1"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Inspect Custody Token</span>
                    </button>
                    <span className="text-[10px] text-slate-400 font-mono">120m AGL</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAA Synthesized Radio ATC Co-Pilot Card */}
          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl text-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-emerald-400" />
                <h2 className="font-bold text-base text-white tracking-tight">
                  FAA Part 135 Radio Air-Traffic Control (ATC) Co-Pilot
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-emerald-400 border border-emerald-400/30">
                  VHF 124.700 MHz · SQUAWK {activeATC?.clearance?.squawk || '4217'}
                </span>
              </div>
            </div>

            {/* Broadcast Control & Audio Key */}
            <div className="p-3.5 bg-black/40 rounded-xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isBroadcastingATC ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                  <span className="text-xs font-mono text-slate-300">
                    {isBroadcastingATC ? 'TRANSMITTING ON FREQUENCY 124.700' : 'STANDBY · CARRIER SQUELCH READY'}
                  </span>
                </div>

                <button
                  onClick={handlePlayActiveATC}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                    isBroadcastingATC
                      ? 'bg-rose-600 text-white hover:bg-rose-700 animate-pulse'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  {isBroadcastingATC ? (
                    <>
                      <Square className="w-3.5 h-3.5" />
                      <span>Halt Radio Broadcast</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Broadcast FAA Voice Clearance</span>
                    </>
                  )}
                </button>
              </div>

              {/* Live ATC Script Transcript */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300/90 leading-relaxed">
                <div className="text-[10px] text-slate-500 mb-1">
                  [{new Date().toLocaleTimeString('en-US', { hour12: false })} UTC] TRANSMISSION DISPATCH:
                </div>
                "{activeATC?.clearance?.radioClearanceText ||
                  'LifeStream Lifter-01, Bay Approach Radar Control. Wind 270 at 14 knots. Cleared corridor Alpha direct.'}"
              </div>

              {/* Flight Directives Tags */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {(activeATC?.clearance?.flightDirectives || [
                  'CLEARED CORRIDOR ALPHA-9 DIRECT',
                  'CRUISE 120m AGL',
                  'SQUAWK 4217'
                ]).map((dir, idx) => (
                  <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                    ◈ {dir}
                  </span>
                ))}
              </div>
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
                  className="w-full text-xs font-bold py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{crossMatchLoading ? 'Analyzing...' : 'Run Coombs Test'}</span>
                </button>
              </div>
            </div>

            {crossMatchResult && (
              <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                crossMatchResult.aboRhCompatible
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="flex justify-between font-bold text-sm">
                  <span>Compatibility: {crossMatchResult.aboRhCompatible ? '✅ CLINICALLY COMPATIBLE' : '❌ INCOMPATIBLE REACTION'}</span>
                  <span className="font-mono text-xs">{crossMatchResult.coombsTestResult}</span>
                </div>
                <div className="text-[11px] text-slate-600 font-mono">
                  Clearance Token: {crossMatchResult.cryptographicClearanceToken}
                </div>
                <div className="text-xs">{crossMatchResult.clinicalNotes}</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Shock Index, MTP Staging & Swaps (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* ATLS Shock Triage & MTP Staging Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h2 className="font-bold text-base text-slate-800">
                  ATLS Shock Triage & MTP Hemostatic Stager
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

            {/* Sliders */}
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
                  <span className="font-mono font-bold text-base text-amber-400">
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
                    <span className="text-[#1a73e8] font-bold">{s.id}</span>
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

      {/* Modal: Cryptographic Cold-Chain Proof of Custody Passport */}
      {custodyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-in">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Cryptographic Chain-of-Custody (CoC) Passport</h3>
              </div>
              <button onClick={() => setCustodyModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {custodyLoading || !custodyPassport ? (
              <div className="py-8 text-center text-xs text-slate-500 font-mono">
                Verifying SHA-256 block hash & cold-chain thermal sensors...
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Status Ribbon */}
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-emerald-900">
                  <div className="flex items-center gap-2 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>CERTIFIED MEDICAL INTEGRITY</span>
                  </div>
                  <span className="font-mono text-[11px] text-emerald-800">{custodyPassport.passportId}</span>
                </div>

                {/* Batch Hash & Token */}
                <div className="p-3 bg-slate-900 text-white rounded-xl space-y-2 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">SHA-256 PAYLOAD BATCH HASH</span>
                    <span className="text-amber-400 break-all">{custodyPassport.batchHash}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ECDSA VERIFICATION SIGNATURE</span>
                    <span className="text-slate-300 break-all">{custodyPassport.digitalSignature}</span>
                  </div>
                </div>

                {/* Thermal Sensor Ledger */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center">
                    <div className="text-[10px] text-slate-500">Allowable Minimum</div>
                    <div className="text-sm font-black text-blue-600 mt-0.5">{custodyPassport.thermalBoundaryLog.minThresholdCelsius}°C</div>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center">
                    <div className="text-[10px] text-slate-500">Current Measured</div>
                    <div className="text-sm font-black text-emerald-600 mt-0.5">{custodyPassport.thermalBoundaryLog.recordedCurrentCelsius}°C</div>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center">
                    <div className="text-[10px] text-slate-500">Allowable Maximum</div>
                    <div className="text-sm font-black text-rose-600 mt-0.5">{custodyPassport.thermalBoundaryLog.maxThresholdCelsius}°C</div>
                  </div>
                </div>

                {/* Pathologist Endorsement */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px]">
                  <div>
                    <div className="text-slate-500">Attesting Pathologist:</div>
                    <div className="font-bold text-slate-800">{custodyPassport.verifyingPathologist}</div>
                  </div>
                  <div className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-1 rounded">
                    SEAL INTACT
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setCustodyModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg font-bold text-xs hover:bg-slate-900"
                  >
                    Close Passport
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
