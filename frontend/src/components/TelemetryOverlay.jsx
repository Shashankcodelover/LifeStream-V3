import React, { useState } from 'react';
import {
  Navigation, Thermometer, BatteryCharging, Gauge, CheckCircle2,
  Wind, ShieldCheck, X, FileCheck, UserCheck, ChevronUp, ChevronDown, Radio
} from 'lucide-react';

export function TelemetryOverlay({
  dispatches = [],
  focusedDispatchId,
  onFocusDispatch,
  onConfirmReceipt
}) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [nurseName, setNurseName] = useState('');
  const [nurseBadge, setNurseBadge] = useState('RN-8021');

  const activeList = dispatches.filter(d => d.status === 'En Route' || d.status === 'Arrived');
  if (activeList.length === 0) return null;

  const currentDispatch = activeList.find(d => d.id === focusedDispatchId) || activeList[0];
  const isArrived = currentDispatch.status === 'Arrived';
  const isColdSafe = currentDispatch.tempCelsius >= 2.0 && currentDispatch.tempCelsius <= 6.0;

  const handleIntakeSubmit = (e) => {
    e.preventDefault();
    if (onConfirmReceipt) {
      onConfirmReceipt(currentDispatch.id, nurseName || 'Nurse Practitioner On-Duty', nurseBadge);
    }
    setShowIntakeModal(false);
  };

  return (
    <>
      {/* 1. Minimized Floating Pill (Google Navigation Standard) */}
      {isMinimized ? (
        <div className="fixed bottom-6 right-6 z-30 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-full border border-[#dadce0] shadow-[0_4px_16px_rgba(60,64,67,0.15)] flex items-center gap-3 cursor-pointer hover:bg-[#f8fafd] transition-all animate-fade-in pointer-events-auto"
          onClick={() => setIsMinimized(false)}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-[#34a853] animate-ping" />
          <div className="text-xs font-bold text-[#202124]">
            <span>{currentDispatch.transportType}: {currentDispatch.id}</span>
            <span className="text-[#5f6368] font-normal mx-1.5">•</span>
            <span className="text-[#1a73e8] font-mono">{currentDispatch.etaMinutes} min ETA</span>
            <span className="text-[#5f6368] font-normal mx-1.5">•</span>
            <span className="text-[#1e8e3e] font-mono font-bold">{currentDispatch.tempCelsius}°C</span>
          </div>
          <button className="p-1 rounded-full hover:bg-[#f1f3f4] text-[#5f6368]">
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* 2. Expanded Google Turn-by-Turn Card */
        <div className="fixed bottom-6 right-6 z-30 w-full max-w-sm bg-white/95 backdrop-blur-md p-4 rounded-3xl shadow-[0_6px_24px_rgba(60,64,67,0.18)] border border-[#dadce0] animate-fade-in pointer-events-auto">
          {/* Multi-Dispatch Tabs */}
          {activeList.length > 1 && (
            <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1.5 border-b border-[#f1f3f4]">
              {activeList.map(disp => (
                <button
                  key={disp.id}
                  onClick={() => onFocusDispatch(disp.id)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
                    currentDispatch.id === disp.id
                      ? 'bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]'
                      : 'bg-[#f8fafd] text-[#5f6368] hover:text-[#202124] border border-[#dadce0]'
                  }`}
                >
                  {disp.id} • {disp.donorBloodType}
                </button>
              ))}
            </div>
          )}

          {/* Header Status Bar */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#f1f3f4]">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isArrived ? 'bg-[#34a853]' : 'bg-[#1a73e8] animate-ping'}`} />
              <span className="font-bold text-xs text-[#202124] tracking-wide uppercase">
                {isArrived ? 'MISSION ARRIVAL · ROOFTOP' : `TELEMETRY · ${currentDispatch.id}`}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="bg-[#e8f0fe] text-[#1a73e8] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                {currentDispatch.transportType}
              </span>
              <button
                onClick={() => setIsMinimized(true)}
                title="Minimize Telemetry Card"
                className="p-1 rounded-full text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4]"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Primary Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-[#f8fafd] p-2.5 rounded-2xl border border-[#e8eaed]">
              <p className="text-[10px] font-bold text-[#5f6368] uppercase tracking-wider mb-0.5">EST. ARRIVAL</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-[#202124] font-mono">{currentDispatch.etaMinutes}</span>
                <span className="text-xs text-[#5f6368] font-medium">{isArrived ? 'DELIVERED' : 'min'}</span>
              </div>
            </div>

            <div className="bg-[#f8fafd] p-2.5 rounded-2xl border border-[#e8eaed]">
              <p className="text-[10px] font-bold text-[#5f6368] uppercase tracking-wider mb-0.5 flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-[#1a73e8]" />
                IoT COLD-CHAIN
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-2xl font-black font-mono ${isColdSafe ? 'text-[#1e8e3e]' : 'text-[#d93025]'}`}>
                  {currentDispatch.tempCelsius}°C
                </span>
                <span className="text-[9px] font-bold bg-[#e6f4ea] text-[#137333] border border-[#ceead6] px-1.5 py-0.2 rounded-full">
                  Safe 2-6°C
                </span>
              </div>
            </div>
          </div>

          {/* Secondary Kinematics (Speed, Altitude, Battery) */}
          <div className="grid grid-cols-3 gap-1.5 bg-[#f1f3f4] p-2 rounded-2xl border border-[#dadce0] mb-3 text-center text-[11px]">
            <div>
              <span className="text-[8px] text-[#5f6368] block font-semibold">SPEED</span>
              <span className="text-[#202124] font-bold">{currentDispatch.speedMph} mph</span>
            </div>
            <div>
              <span className="text-[8px] text-[#5f6368] block font-semibold">ALTITUDE</span>
              <span className="text-[#202124] font-bold">{currentDispatch.altitudeMeters} m</span>
            </div>
            <div>
              <span className="text-[8px] text-[#5f6368] block font-semibold">BATTERY</span>
              <span className="text-[#1e8e3e] font-bold">{currentDispatch.batteryPct}%</span>
            </div>
          </div>

          {/* Route & Intake */}
          <div className="text-xs text-[#5f6368] flex items-center justify-between">
            <div>
              <span>From: <strong className="text-[#202124]">{currentDispatch.donorName}</strong></span>
              <span className="text-[10px] text-[#70757a] block">→ {currentDispatch.hospitalName} ({currentDispatch.remainingMiles} mi left)</span>
            </div>

            {isArrived && !currentDispatch.intakeConfirmation && (
              <button
                onClick={() => setShowIntakeModal(true)}
                className="bg-[#34a853] hover:bg-[#2d9249] text-white font-bold px-3 py-1.5 rounded-full text-xs shadow-sm transition-all flex items-center gap-1"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Confirm Intake</span>
              </button>
            )}

            {currentDispatch.intakeConfirmation && (
              <span className="text-[10px] font-medium bg-[#e6f4ea] text-[#137333] border border-[#ceead6] px-2 py-0.5 rounded-full">
                ✓ Intake Confirmed
              </span>
            )}
          </div>
        </div>
      )}

      {/* Intake Signature Modal */}
      {showIntakeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/40 backdrop-blur-sm" onClick={() => setShowIntakeModal(false)}>
          <div className="w-full max-w-sm bg-white p-5 rounded-3xl shadow-2xl border border-[#dadce0] relative" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="w-5 h-5 text-[#34a853]" />
              <h4 className="text-sm font-bold text-[#202124]">Hospital Intake Verification</h4>
            </div>
            <form onSubmit={handleIntakeSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-[#5f6368] uppercase block mb-1">Receiving Practitioner Name</label>
                <input
                  className="w-full bg-[#f8fafd] border border-[#dadce0] rounded-xl px-3 py-1.5 text-xs text-[#202124] outline-none focus:border-[#1a73e8]"
                  placeholder="e.g. Sarah Lin, BSN RN"
                  value={nurseName}
                  onChange={e => setNurseName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#5f6368] uppercase block mb-1">Staff Badge ID</label>
                <input
                  className="w-full bg-[#f8fafd] border border-[#dadce0] rounded-xl px-3 py-1.5 text-xs text-[#202124] outline-none focus:border-[#1a73e8]"
                  value={nurseBadge}
                  onChange={e => setNurseBadge(e.target.value)}
                  required
                />
              </div>
              <div className="bg-[#f8fafd] p-2.5 rounded-2xl border border-[#dadce0] text-[11px] text-[#3c4043] font-mono space-y-1">
                <div>Payload: 1 Unit {currentDispatch.donorBloodType}</div>
                <div>Intake Temp: {currentDispatch.tempCelsius}°C (Medical Safe)</div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 bg-[#34a853] hover:bg-[#2d9249] text-white text-xs font-bold py-2 rounded-full shadow-sm"
                >
                  Confirm & Stock in Bank
                </button>
                <button
                  type="button"
                  onClick={() => setShowIntakeModal(false)}
                  className="px-3 py-2 bg-[#f1f3f4] text-[#5f6368] rounded-full text-xs hover:bg-[#e8eaed]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
