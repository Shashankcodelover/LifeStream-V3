import React, { useState } from 'react';
import {
  AlertCircle, Navigation, ShieldCheck, Zap, Droplets, MapPin,
  Truck, Hospital, ArrowRightLeft, Send, Siren, Sparkles,
  ChevronLeft, ChevronRight, Layers, SlidersHorizontal, Eye, EyeOff
} from 'lucide-react';

const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export function DispatchSidebar({
  hospitals = [],
  selectedHospitalId,
  onSelectHospital,
  recipientType,
  setRecipientType,
  urgency,
  setUrgency,
  matches = [],
  activeDispatches = [],
  onDispatch,
  onOpenInterHospital,
  onOpenEmergencyRequest,
  onOpenMatrix,
  onOpenRegisterDonor
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const currentHospital = hospitals.find(h => h.id === selectedHospitalId) || hospitals[0];
  const hospitalUnits = (currentHospital?.inventory && currentHospital.inventory[recipientType]) || 0;
  const isShortage = hospitalUnits <= 1;

  return (
    <>
      {/* 1. Floating Top Google Filter Capsule (Unobtrusive, Google Maps Standard) */}
      <div className="fixed top-20 left-4 right-4 sm:left-6 sm:right-auto z-30 flex flex-wrap items-center gap-2 pointer-events-auto">
        {/* Hospital Hub Chip */}
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-full border border-[#dadce0] shadow-[0_2px_6px_rgba(60,64,67,0.15)] flex items-center gap-2 text-xs font-medium text-[#202124]">
          <Hospital className="w-4 h-4 text-[#ea4335]" />
          <span className="text-[#5f6368] hidden sm:inline">Hub:</span>
          <select
            className="bg-transparent font-bold text-[#202124] outline-none cursor-pointer pr-1"
            value={selectedHospitalId}
            onChange={e => onSelectHospital(e.target.value)}
          >
            {hospitals.map(h => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.code})
              </option>
            ))}
          </select>
        </div>

        {/* Urgency Pill Toggle */}
        <button
          onClick={() => setUrgency(urgency === 'critical' ? 'normal' : 'critical')}
          className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_2px_6px_rgba(60,64,67,0.15)] ${
            urgency === 'critical'
              ? 'bg-[#ea4335] text-white border border-[#d93025] animate-pulse'
              : 'bg-white text-[#5f6368] border border-[#dadce0] hover:text-[#202124] hover:bg-[#f8fafd]'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{urgency === 'critical' ? 'STAT CRITICAL' : 'STANDARD'}</span>
        </button>

        {/* Drawer Expand/Collapse Toggle Pill */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 shadow-[0_2px_6px_rgba(60,64,67,0.15)] ${
            isCollapsed
              ? 'bg-[#1a73e8] text-white border border-[#1557b0]'
              : 'bg-white text-[#202124] border border-[#dadce0] hover:bg-[#f8fafd]'
          }`}
        >
          <Zap className={`w-3.5 h-3.5 ${isCollapsed ? 'text-white' : 'text-[#1a73e8]'}`} />
          <span>{matches.length} Donors Matched</span>
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 2. Floating Modular Left Drawer (Google Maps Drawer Standard) */}
      {!isCollapsed && (
        <aside className="fixed top-36 left-4 bottom-6 z-30 w-full max-w-[360px] sm:max-w-sm bg-white/95 backdrop-blur-md rounded-3xl border border-[#dadce0] shadow-[0_4px_20px_rgba(60,64,67,0.15)] flex flex-col p-4 overflow-hidden animate-fade-in pointer-events-auto">
          {/* Header & Close Action */}
          <div className="flex items-center justify-between pb-3 border-b border-[#f1f3f4]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#e8f0fe] flex items-center justify-center text-[#1a73e8]">
                <Droplets className="w-4 h-4 text-[#ea4335]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#202124]">Blood Group Dispatch</h3>
                <p className="text-[10px] text-[#5f6368]">AI proximity donor rankings</p>
              </div>
            </div>

            <button
              onClick={() => setIsCollapsed(true)}
              title="Minimize drawer to see full map"
              className="p-1 rounded-full text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Blood Type Selector Pill Grid */}
          <div className="my-3">
            <span className="text-[10px] font-bold text-[#5f6368] uppercase tracking-wider block mb-1.5">
              Select Recipient Blood Type:
            </span>
            <div className="grid grid-cols-4 gap-1.5 bg-[#f8fafd] p-1.5 rounded-2xl border border-[#e8eaed]">
              {BLOOD_TYPES.map(type => (
                <button
                  key={type}
                  onClick={() => setRecipientType(type)}
                  className={`h-7 rounded-xl font-bold text-xs transition-all flex items-center justify-center ${
                    recipientType === type
                      ? 'bg-[#ea4335] text-white shadow-sm font-bold scale-[1.03]'
                      : 'bg-white text-[#5f6368] border border-[#dadce0] hover:text-[#202124] hover:border-[#bdc1c6]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Hospital Supply Status Pill */}
          <div className={`p-2.5 rounded-2xl border mb-3 flex items-center justify-between text-xs transition-all ${
            isShortage
              ? 'bg-[#fce8e6] border-[#fad2cf] text-[#c5221f]'
              : 'bg-[#e6f4ea] border-[#ceead6] text-[#137333]'
          }`}>
            <div>
              <span className="font-bold block text-[11px]">
                {currentHospital?.code} Bank: {hospitalUnits} Unit{hospitalUnits !== 1 ? 's' : ''} ({recipientType})
              </span>
              {isShortage && <span className="text-[10px] text-[#d93025] font-semibold">Shortage at this station</span>}
            </div>

            <button
              onClick={onOpenInterHospital}
              title="Inter-Hospital Drone Transfer"
              className="px-2 py-1 rounded-lg bg-white text-[#1a73e8] border border-[#d2e3fc] text-[10px] font-bold flex items-center gap-1 shadow-sm hover:bg-[#e8f0fe] transition-all"
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>XFER</span>
            </button>
          </div>

          {/* AI Matched Donors List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 google-scrollbar">
            <div className="flex items-center justify-between sticky top-0 bg-white/95 py-1 z-10 border-b border-[#f1f3f4]">
              <span className="text-[11px] font-bold text-[#5f6368] uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#1a73e8]" />
                Ranked Matches ({matches.length})
              </span>
              <span className="text-[10px] text-[#70757a]">AI Distance + Reliability</span>
            </div>

            {matches.map(donor => {
              const isEnRoute = activeDispatches.some(disp => disp.donorId === donor.id && disp.status === 'En Route');
              return (
                <div
                  key={donor.id}
                  className={`p-3 rounded-2xl border transition-all relative ${
                    isEnRoute
                      ? 'bg-[#e6f4ea] border-[#ceead6] shadow-sm'
                      : 'bg-white border-[#dadce0] hover:border-[#bdc1c6] shadow-[0_1px_2px_rgba(60,64,67,0.06)]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-[#202124] text-xs">{donor.name}</h4>
                        <span className="bg-[#fce8e6] text-[#c5221f] font-mono font-bold px-1.5 py-0.2 rounded text-[10px] border border-[#fad2cf]">
                          {donor.bloodType}
                        </span>
                        {donor.isVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-[#1a73e8]" title="Verified Donor" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#5f6368] mt-0.5">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-[#70757a]" />
                          {donor.distanceMiles} mi away
                        </span>
                        <span>•</span>
                        <span className="text-[#1e8e3e] font-medium">{donor.reliabilityScore}% rel</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-bold text-[#1a73e8] bg-[#e8f0fe] px-2 py-0.5 rounded-full border border-[#d2e3fc]">
                        {donor.aiScore}% Match
                      </span>
                    </div>
                  </div>

                  {/* Dispatch Action Buttons */}
                  <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => onDispatch(donor.id, 'Autonomous Drone')}
                      disabled={isEnRoute}
                      className="bg-[#1a73e8] hover:bg-[#1557b0] text-white py-1.5 rounded-xl text-[11px] font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Navigation className="w-3 h-3" />
                      <span>Deploy Drone</span>
                    </button>
                    <button
                      onClick={() => onDispatch(donor.id, 'Emergency Transport')}
                      disabled={isEnRoute}
                      className="bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#202124] border border-[#dadce0] py-1.5 rounded-xl text-[11px] font-medium transition-all disabled:opacity-40 flex items-center justify-center gap-1"
                    >
                      <Truck className="w-3 h-3 text-[#5f6368]" />
                      <span>Ambulance</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {matches.length === 0 && (
              <div className="text-center py-8 px-4">
                <div className="w-10 h-10 rounded-full bg-[#f1f3f4] flex items-center justify-center mx-auto mb-2 text-[#70757a]">
                  <Droplets className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-[#202124] mb-1">No matching donors in radar range</p>
                <p className="text-[11px] text-[#5f6368] mb-3">Try toggling STAT mode or transfer blood from another trauma center.</p>
                <button
                  onClick={onOpenInterHospital}
                  className="bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold px-3 py-1.5 rounded-full text-xs transition-all shadow-sm"
                >
                  Launch Inter-Hospital Transfer
                </button>
              </div>
            )}
          </div>

          {/* Volunteer Donor Quick Registration Footer */}
          <div className="p-3 bg-[#f8fafd] border-t border-[#dadce0] flex items-center justify-between">
            <span className="text-[11px] text-[#5f6368]">Want to donate?</span>
            <button
              onClick={onOpenRegisterDonor}
              className="text-[11px] font-bold text-[#1a73e8] hover:underline"
            >
              + Register as Donor
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
