import React, { useState } from 'react';
import {
  Navigation, Gauge, BatteryCharging, Wind, Compass, ShieldAlert,
  Zap, AlertTriangle, Radio, Plane, CheckCircle2, X, ChevronUp, ChevronDown
} from 'lucide-react';
import { resilientFetch } from '../api/client';

export function DroneCockpitHUD({ dispatch, onClose, onActionFeedback }) {
  const [loadingAction, setLoadingAction] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hudLogs, setHudLogs] = useState([
    'GPS Lock established (18 satellites).',
    'Cold-chain chamber hermetically sealed at 4.0°C.',
    'FAA medical corridor clearance granted.'
  ]);

  if (!dispatch) return null;

  const handleCockpitControl = async (command) => {
    setLoadingAction(true);
    try {
      const data = await resilientFetch(`/api/dispatch/${dispatch.id}/cockpit-control`, {
        method: 'POST',
        body: JSON.stringify({ command })
      });
      if (data?.dispatch?.lastCockpitAction) {
        setHudLogs(prev => [data.dispatch.lastCockpitAction, ...prev.slice(0, 4)]);
      }
      if (onActionFeedback) onActionFeedback(`Cockpit command [${command}] executed.`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-40 w-full max-w-sm bg-slate-900/95 text-white backdrop-blur-xl rounded-3xl border border-slate-700 shadow-2xl overflow-hidden font-mono animate-fade-in pointer-events-auto">
      {/* HUD Top Bar */}
      <div className="p-3.5 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
            FLIGHT HUD · {dispatch.id}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700"
          >
            {isMinimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-4 space-y-3.5 text-xs">
          {/* Artificial Horizon / Flight Attitude Vector */}
          <div className="relative h-20 rounded-2xl bg-gradient-to-b from-sky-900/60 via-slate-800 to-amber-950/60 border border-slate-700 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-x-0 h-0.5 bg-emerald-400/80" />
            <div className="absolute w-12 h-12 rounded-full border border-emerald-400/30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="absolute top-1.5 left-2 text-[10px] text-sky-400 font-bold">
              ALT {dispatch.altitudeMeters || 150}m AGL
            </div>
            <div className="absolute bottom-1.5 right-2 text-[10px] text-amber-400 font-bold">
              SPD {dispatch.speedMph || 52} MPH
            </div>
          </div>

          {/* Primary Telemetry Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-800/80 p-2 rounded-2xl border border-slate-700">
              <span className="text-[9px] text-slate-400 block">BATTERY</span>
              <span className="text-sm font-black text-emerald-400 font-mono">
                {dispatch.batteryPct || 98}%
              </span>
              <span className="text-[8px] text-slate-400 block font-sans">22.4V LiPo</span>
            </div>

            <div className="bg-slate-800/80 p-2 rounded-2xl border border-slate-700">
              <span className="text-[9px] text-slate-400 block">COLD-CHAIN</span>
              <span className="text-sm font-black text-sky-400 font-mono">
                {dispatch.tempCelsius}°C
              </span>
              <span className="text-[8px] text-emerald-400 block font-sans">1-6°C Target</span>
            </div>

            <div className="bg-slate-800/80 p-2 rounded-2xl border border-slate-700">
              <span className="text-[9px] text-slate-400 block">EST. TIME</span>
              <span className="text-sm font-black text-amber-400 font-mono">
                ~{dispatch.etaMinutes}m
              </span>
              <span className="text-[8px] text-slate-400 block font-sans">{dispatch.remainingMiles || 1.8} mi left</span>
            </div>
          </div>

          {/* Real-Time Cockpit Commands (Emergency Actions) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Autonomous Cockpit Overrides:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleCockpitControl('BOOST')}
                disabled={loadingAction}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 py-2 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Speed Boost</span>
              </button>

              <button
                onClick={() => handleCockpitControl('REROUTE')}
                disabled={loadingAction}
                className="bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 py-2 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 disabled:opacity-50"
              >
                <Navigation className="w-3.5 h-3.5 text-sky-400" />
                <span>Reroute NFZ</span>
              </button>

              <button
                onClick={() => handleCockpitControl('DESCEND')}
                disabled={loadingAction}
                className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 py-2 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 disabled:opacity-50"
              >
                <Plane className="w-3.5 h-3.5 text-rose-400" />
                <span>Land Rooftop</span>
              </button>
            </div>
          </div>

          {/* Live Flight HUD Log Feed */}
          <div className="bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 space-y-1 text-[10px] text-slate-300 max-h-24 overflow-y-auto">
            {hudLogs.map((log, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="text-emerald-400">›</span>
                <span className="truncate">{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
