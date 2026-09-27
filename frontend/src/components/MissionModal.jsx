import React, { useEffect } from 'react';
import { CheckCircle2, ShieldCheck, Thermometer, Navigation, AlertTriangle, X } from 'lucide-react';

export function MissionModal({ mission, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!mission) return null;

  const isColdChainCompliant = mission.tempCelsius >= 2.0 && mission.tempCelsius <= 6.0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-success-title"
    >
      <div
        className="w-full max-w-md glass-panel p-6 rounded-2xl shadow-2xl border border-slate-300/80 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Close summary"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 text-emerald-400">
            <CheckCircle2 className="w-8 h-8 animate-bounce" />
          </div>
          <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Mission Delivered & Verified
          </span>
          <h2 id="mission-success-title" className="text-lg font-bold text-slate-900 mt-2">
            Emergency Blood Dispatch Complete
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Life-critical blood unit successfully transferred to receiving trauma center.
          </p>
        </div>

        {/* Mission Details Card */}
        <div className="bg-white/60 p-4 rounded-xl border border-slate-200 space-y-3 font-sans text-xs mb-5">
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/80">
            <span className="text-slate-500">Dispatch Reference</span>
            <span className="font-mono font-bold text-slate-800">{mission.id}</span>
          </div>

          <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/80">
            <span className="text-slate-500">Carrier / Transport</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              {mission.transportType}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/80">
            <span className="text-slate-500">Donor Unit</span>
            <span className="font-bold text-blue-400 flex items-center gap-1.5">
              <span className="bg-blue-500/10 text-blue-400 font-mono px-2 py-0.5 rounded border border-blue-500/20">
                {mission.donorBloodType}
              </span>
              from {mission.donorName}
            </span>
          </div>

          <div className="flex justify-between items-center pb-2.5 border-b border-slate-200/80">
            <span className="text-slate-500">Destination Center</span>
            <span className="font-semibold text-slate-800">{mission.hospitalName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500 flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
              Cold-Chain Compliance
            </span>
            <span className={`font-mono font-bold flex items-center gap-1 ${isColdChainCompliant ? 'text-emerald-400' : 'text-amber-400'}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              {mission.tempCelsius}°C (Pass 2–6°C)
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-500 text-slate-900 font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98]"
        >
          Acknowledge & Clear Mission Log
        </button>
      </div>
    </div>
  );
}
