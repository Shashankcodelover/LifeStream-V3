import React, { useState } from 'react';
import { AlertCircle, Navigation, ShieldCheck, Zap, Droplets, MapPin, Truck, Phone, ChevronDown, ChevronUp } from 'lucide-react';

const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export function DispatchSidebar({
  recipientType,
  setRecipientType,
  urgency,
  setUrgency,
  matches,
  activeDispatch,
  onDispatch,
}) {
  const [isCollapsedMobile, setIsCollapsedMobile] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState(null); // { donor, transportType }

  const handleTriggerDispatch = (donor, transportType) => {
    setPendingConfirm({ donor, transportType });
  };

  const handleConfirmDispatch = () => {
    if (pendingConfirm) {
      onDispatch(pendingConfirm.donor.id, pendingConfirm.transportType);
      setPendingConfirm(null);
    }
  };

  return (
    <>
      <aside className={`fixed top-14 left-0 bottom-0 z-20 w-full sm:w-96 glass-panel border-r border-slate-800/90 flex flex-col p-4 shadow-2xl transition-transform duration-300 ${
        isCollapsedMobile ? 'translate-y-[calc(100%-48px)] sm:translate-y-0' : 'translate-y-0'
      }`}>
        {/* Mobile toggle bar */}
        <div className="sm:hidden flex items-center justify-between pb-2 mb-2 border-b border-slate-800 cursor-pointer" onClick={() => setIsCollapsedMobile(!isCollapsedMobile)}>
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-red-500" />
            Dispatch Command Panel
          </span>
          <button className="text-slate-400 p-1">
            {isCollapsedMobile ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Urgency & Blood Selection Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-red-500" />
              Trauma Demand
            </label>

            {/* Urgency Toggle */}
            <button
              onClick={() => setUrgency(urgency === 'critical' ? 'normal' : 'critical')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
                urgency === 'critical'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-sm shadow-red-500/20 animate-pulse'
                  : 'bg-slate-800 text-slate-400 border border-slate-700/60 hover:text-slate-200'
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              {urgency === 'critical' ? 'CRITICAL PROTOCOL' : 'STANDARD PROTOCOL'}
            </button>
          </div>

          {/* Blood Type Grid */}
          <div className="grid grid-cols-4 gap-1.5 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
            {BLOOD_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setRecipientType(type)}
                className={`h-8 rounded-lg font-bold text-xs transition-all flex items-center justify-center font-mono ${
                  recipientType === type
                    ? 'bg-red-600 text-white shadow-md shadow-red-900/40 border border-red-500'
                    : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* AI Matches List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
          <div className="flex items-center justify-between sticky top-0 bg-[#0f172a]/95 backdrop-blur-md py-1.5 z-10 border-b border-slate-800/80 mb-1">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Donor Match Rankings ({matches.length})
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Haversine + Cooldown</span>
          </div>

          {matches.map((donor) => {
            const isEnRoute = activeDispatch && activeDispatch.donorId === donor.id;
            return (
              <div
                key={donor.id}
                className={`bg-slate-900/85 p-3.5 rounded-xl border transition-all relative ${
                  isEnRoute
                    ? 'border-emerald-500/70 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{donor.name}</h4>
                      <span className="bg-red-500/15 text-red-400 font-mono font-bold px-1.5 py-0.5 rounded text-[10px] border border-red-500/30">
                        {donor.bloodType}
                      </span>
                      {donor.isVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" title="Verified Volunteer Donor" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {donor.distanceMiles} mi
                      </span>
                      <span>•</span>
                      <a
                        href={`tel:${donor.phone}`}
                        className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition-colors font-mono"
                        title="Click to call donor directly"
                      >
                        <Phone className="w-3 h-3" />
                        {donor.phone}
                      </a>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/25">
                      {donor.aiScore}% Match
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                      {donor.eligibilityStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleTriggerDispatch(donor, 'Autonomous Drone')}
                    disabled={!!activeDispatch}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-lg text-xs transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-1.5 shadow-md shadow-red-900/30 active:scale-95"
                  >
                    <Navigation className="w-3.5 h-3.5 text-white" />
                    <span>Deploy Drone</span>
                  </button>
                  <button
                    onClick={() => handleTriggerDispatch(donor, 'Emergency Transport')}
                    disabled={!!activeDispatch}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Truck className="w-3.5 h-3.5 text-slate-300" />
                    <span>Ambulance</span>
                  </button>
                </div>
              </div>
            );
          })}

          {matches.length === 0 && (
            <div className="text-center py-10 px-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center mx-auto mb-2.5 text-slate-500">
                <Droplets className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-xs font-semibold text-slate-300 mb-1">No donors available for {recipientType}</p>
              <p className="text-[11px] text-slate-400">
                Activate CRITICAL PROTOCOL to bypass standard 56-day cooldown filters for universal donor emergencies.
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Confirmation Modal for Destructive/Dispatch action */}
      {pendingConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setPendingConfirm(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-sm glass-panel p-5 rounded-2xl shadow-2xl border border-slate-700 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Authorize Emergency Dispatch</h3>
                <p className="text-xs text-slate-400">Confirm transport mission protocol</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              Deploy <strong className="text-white">{pendingConfirm.transportType}</strong> to collect blood unit (<strong className="text-red-400">{pendingConfirm.donor.bloodType}</strong>) from <strong className="text-white">{pendingConfirm.donor.name}</strong> ({pendingConfirm.donor.distanceMiles} mi)?
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPendingConfirm(null)}
                className="py-2 px-3 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDispatch}
                className="py-2 px-3 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-900/30 transition-colors"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
