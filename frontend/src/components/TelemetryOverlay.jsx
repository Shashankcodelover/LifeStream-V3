import React, { useState } from 'react';
import { Navigation, Thermometer, BatteryCharging, Gauge, CheckCircle2, Copy, Check, Radio } from 'lucide-react';

export function TelemetryOverlay({ dispatch }) {
  const [copied, setCopied] = useState(false);

  if (!dispatch) return null;

  const isArrived = dispatch.status === 'Arrived';
  const isColdSafe = dispatch.tempCelsius >= 2.0 && dispatch.tempCelsius <= 6.0;

  const copyDispatchId = () => {
    if (dispatch.id) {
      navigator.clipboard.writeText(dispatch.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 md:left-[416px] md:right-auto z-30 w-[calc(100vw-32px)] sm:w-80 md:w-96 glass-panel p-4 rounded-2xl shadow-2xl border border-slate-700/80 animate-fade-in">
      {/* Header status */}
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isArrived ? 'bg-emerald-500' : 'bg-red-500 animate-ping'}`} />
          <span className="font-bold text-xs text-white tracking-wide uppercase">
            {isArrived ? 'MISSION COMPLETED' : 'ACTIVE DISPATCH TELEMETRY'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={copyDispatchId}
            className="flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700 transition-colors"
            title="Copy Dispatch ID"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{dispatch.id}</span>
          </button>
          <span className="bg-red-500/15 text-red-400 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {dispatch.transportType}
          </span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">EST. ARRIVAL</p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-white font-mono">{dispatch.etaMinutes}</span>
            <span className="text-xs text-slate-400 font-semibold">min</span>
          </div>
        </div>

        <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-cyan-400" />
            IoT COLD-CHAIN
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-xl font-black font-mono ${isColdSafe ? 'text-cyan-400' : 'text-amber-400'}`}>
              {dispatch.tempCelsius}°C
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Safe 2–6°C</span>
          </div>
        </div>
      </div>

      {/* Secondary Flight Telemetry (Speed, Battery, Altitude) */}
      {dispatch.transportType === 'Autonomous Drone' && !isArrived && (
        <div className="grid grid-cols-3 gap-1.5 bg-slate-950/80 p-2 rounded-xl border border-slate-800/80 mb-3 text-center font-mono text-[11px]">
          <div>
            <span className="text-[9px] text-slate-400 block">SPEED</span>
            <span className="text-slate-200 font-semibold">{dispatch.speedMph} mph</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block">ALTITUDE</span>
            <span className="text-slate-200 font-semibold">{dispatch.altitudeMeters} m</span>
          </div>
          <div>
            <span className="text-[9px] text-slate-400 block">BATTERY</span>
            <span className="text-emerald-400 font-semibold">{dispatch.batteryPct}%</span>
          </div>
        </div>
      )}

      <div className="text-xs text-slate-300 flex items-center justify-between">
        <span className="truncate pr-2">
          From <strong className="text-white">{dispatch.donorName}</strong> ({dispatch.donorBloodType}) to <strong className="text-white">{dispatch.hospitalName}</strong>
        </span>
        <span className="text-[10px] font-mono text-cyan-400 font-bold shrink-0">{dispatch.remainingMiles} mi left</span>
      </div>
    </div>
  );
}
