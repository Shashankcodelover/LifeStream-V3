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
      <aside className={`fixed top-14 left-0 bottom-0 z-20 w-full sm:w-96 glass-panel border-r border-slate-200/90 flex flex-col p-4 shadow-2xl transition-transform duration-300 ${
        isCollapsedMobile ? 'translate-y-[calc(100%-48px)] sm:translate-y-0' : 'translate-y-0'
      }`}>
        {/* Mobile toggle bar */}
        <div className="sm:hidden flex items-center justify-between pb-2 mb-2 border-b border-slate-200 cursor-pointer" onClick={() => setIsCollapsedMobile(!isCollapsedMobile)}>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            Dispatch Command Panel
          </span>
          <button className="text-slate-500 p-1">
            {isCollapsedMobile ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Urgency & Blood Selection Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              Trauma Demand
            </label>

            {/* Urgency Toggle */}
            <button
              onClick={() => setUrgency(urgency === 'critical' ? 'normal' : 'critical')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
                urgency === 'critical'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-sm shadow-blue-500/20 animate-pulse'
                  : 'bg-slate-100 text-slate-500 border border-slate-300/60 hover:text-slate-800'
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              {urgency === 'critical' ? 'CRITICAL PROTOCOL' : 'STANDARD PROTOCOL'}
            </button>
          </div>

          {/* Blood Type Grid */}
          <div className="grid grid-cols-4 gap-1.5 bg-white/60 p-1.5 rounded-xl border border-slate-200/80">
            {BLOOD_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setRecipientType(type)}
                className={`h-8 rounded-lg font-bold text-xs transition-all flex items-center justify-center font-mono ${
                  recipientType === type
                    ? 'bg-blue-600 text-slate-900 shadow-md shadow-blue-900/40 border border-blue-500'
                    : 'bg-white/80 text-slate-700 border border-slate-200 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* AI Matches List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
          <div className="flex items-center justify-between sticky top-0 bg-[#0f172a]/95 backdrop-blur-md py-1.5 z-10 border-b border-slate-200/80 mb-1">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Donor Match Rankings ({matches.length})
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Haversine + Cooldown</span>
          </div>

          {matches.map((donor) => {
            const isEnRoute = activeDispatch && activeDispatch.donorId === donor.id;
            return (
              <div
                key={donor.id}
                className={`bg-white/85 p-3.5 rounded-xl border transition-all relative ${
                  isEnRoute
                    ? 'border-emerald-500/70 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{donor.name}</h4>
                      <span className="bg-blue-500/15 text-blue-400 font-mono font-bold px-1.5 py-0.5 rounded text-[10px] border border-blue-500/30">
                        {donor.bloodType}
                      </span>
                      {donor.isVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" title="Verified Volunteer Donor" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {donor.distanceMiles} mi
                      </span>
                      <span>•</span>
                      <a
                        href={`tel:${donor.phone}`}
                        className="flex items-center gap-1 text-slate-500 hover:text-cyan-400 transition-colors font-mono"
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
                    <span className="text-[10px] text-slate-500 block mt-1 font-mono">
                      {donor.eligibilityStatus}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleTriggerDispatch(donor, 'Autonomous Drone')}
                    disabled={!!activeDispatch}
                    className="bg-blue-600 hover:bg-blue-500 text-slate-900 font-bold py-2 rounded-lg text-xs transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-1.5 shadow-md shadow-blue-900/30 active:scale-95"
                  >
                    <Navigation className="w-3.5 h-3.5 text-slate-900" />
                    <span>Deploy Drone</span>
                  </button>
                  <button
                    onClick={() => handleTriggerDispatch(donor, 'Emergency Transport')}
                    disabled={!!activeDispatch}
                    className="bg-slate-100 hover:bg-slate-700 text-slate-800 border border-slate-300 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Truck className="w-3.5 h-3.5 text-slate-700" />
                    <span>Ambulance</span>
                  </button>
                </div>
              </div>
            );
          })}

          {matches.length === 0 && (
            <div className="text-center py-10 px-4 bg-white/50 rounded-xl border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-2.5 text-slate-500">
                <Droplets className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-xs font-semibold text-slate-700 mb-1">No donors available for {recipientType}</p>
              <p className="text-[11px] text-slate-500">
                Activate CRITICAL PROTOCOL to bypass standard 56-day cooldown filters for universal donor emergencies.
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Confirmation Modal for Destructive/Dispatch action */}
      {pendingConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setPendingConfirm(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-sm glass-panel p-5 rounded-2xl shadow-2xl border border-slate-300 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Authorize Emergency Dispatch</h3>
                <p className="text-xs text-slate-500">Confirm transport mission protocol</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 mb-4 bg-white/60 p-3 rounded-xl border border-slate-200">
              Deploy <strong className="text-slate-900">{pendingConfirm.transportType}</strong> to collect blood unit (<strong className="text-blue-400">{pendingConfirm.donor.bloodType}</strong>) from <strong className="text-slate-900">{pendingConfirm.donor.name}</strong> ({pendingConfirm.donor.distanceMiles} mi)?
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPendingConfirm(null)}
                className="py-2 px-3 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDispatch}
                className="py-2 px-3 rounded-lg text-xs font-bold text-slate-900 bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-900/30 transition-colors"
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
