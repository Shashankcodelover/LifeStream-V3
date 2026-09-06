import React, { useState } from 'react';
import {
  Hospital, Droplet, ShieldCheck, ArrowRightLeft, Plus, RefreshCw,
  AlertTriangle, HeartPulse, Activity, Zap, CheckCircle2, ChevronRight,
  Sparkles, Layers
} from 'lucide-react';

const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

const WHOLE_BLOOD_DONOR_COMPATIBILITY = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
};

export function ClinicalMTPView({
  hospitals = [],
  onOpenInterHospital,
  onOpenEmergencyRequest,
  onLaunchMTPBundle
}) {
  const [selectedTab, setSelectedTab] = useState('mtp'); // mtp | crossmatch | components | inventory
  const [recipientType, setRecipientType] = useState('O-');
  
  // MTP Calculator state
  const [traumaSeverity, setTraumaSeverity] = useState('critical');
  const [bloodLossMl, setBloodLossMl] = useState(2500);
  const [patientWeight, setPatientWeight] = useState(70);

  // Antigen Crossmatch state
  const [recipientPhenotype, setRecipientPhenotype] = useState({
    RhD: false,
    RhC: true,
    Rhc: true,
    RhE: false,
    Rhe: true,
    Kell_K: false
  });

  const [donorPhenotype, setDonorPhenotype] = useState({
    RhD: false,
    RhC: true,
    Rhc: false,
    RhE: false,
    Rhe: true,
    Kell_K: false
  });

  // Calculate MTP recommendations locally
  const prbcUnits = traumaSeverity === 'catastrophic' ? 6 : traumaSeverity === 'controlled' ? 2 : 4;
  const ffpUnits = traumaSeverity === 'catastrophic' ? 6 : traumaSeverity === 'controlled' ? 2 : 4;
  const pltDoses = traumaSeverity === 'catastrophic' ? 2 : 1;
  const cryoUnits = traumaSeverity === 'catastrophic' ? 10 : traumaSeverity === 'controlled' ? 0 : 5;
  const totalVolumeMl = (prbcUnits * 300) + (ffpUnits * 250) + (pltDoses * 250) + (cryoUnits * 15);

  // Antigen test
  const incompatibleList = [];
  Object.keys(recipientPhenotype).forEach(ag => {
    if (recipientPhenotype[ag] === false && donorPhenotype[ag] === true) {
      incompatibleList.push(ag);
    }
  });

  return (
    <div className="pt-20 pb-12 px-4 sm:px-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ea4335]" />
            <h2 className="text-xl font-bold text-[#202124] tracking-tight">
              Google Health • Clinical MTP Resuscitation & Component Reserves
            </h2>
            <span className="text-[10px] font-bold bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf] px-2.5 py-0.5 rounded-full">
              CLINICAL AABB GRADE
            </span>
          </div>
          <p className="text-xs text-[#5f6368] mt-1">
            Damage Control Resuscitation 1:1:1 Protocol, Rare Antigen Phenotype Cross-Matching & Multi-Component Reserves
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenInterHospital}
            className="flex items-center gap-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm transition-all"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Launch Drone Transfer</span>
          </button>
        </div>
      </div>

      {/* Sub-View Navigation Tabs */}
      <div className="flex items-center gap-1.5 bg-[#f1f3f4] p-1.5 rounded-2xl border border-[#dadce0] overflow-x-auto">
        <button
          onClick={() => setSelectedTab('mtp')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedTab === 'mtp'
              ? 'bg-[#ea4335] text-white shadow-sm'
              : 'text-[#5f6368] hover:text-[#202124] hover:bg-white'
          }`}
        >
          <HeartPulse className="w-3.5 h-3.5" />
          <span>MTP 1:1:1 Resuscitation</span>
        </button>

        <button
          onClick={() => setSelectedTab('crossmatch')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedTab === 'crossmatch'
              ? 'bg-[#1a73e8] text-white shadow-sm'
              : 'text-[#5f6368] hover:text-[#202124] hover:bg-white'
          }`}
        >
          <Droplet className="w-3.5 h-3.5" />
          <span>Extended Antigen Match</span>
        </button>

        <button
          onClick={() => setSelectedTab('inventory')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedTab === 'inventory'
              ? 'bg-[#1a73e8] text-white shadow-sm'
              : 'text-[#5f6368] hover:text-[#202124] hover:bg-white'
          }`}
        >
          <Hospital className="w-3.5 h-3.5" />
          <span>5-Hub Bank Reserves</span>
        </button>
      </div>

      {/* TAB 1: MASSIVE TRANSFUSION PROTOCOL (MTP) CALCULATOR */}
      {selectedTab === 'mtp' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#dadce0] shadow-[0_1px_3px_rgba(60,64,67,0.08)] grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Controls */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-[#5f6368] uppercase tracking-wider block mb-1">
                  Trauma Severity Classification
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {['controlled', 'critical', 'catastrophic'].map(sev => (
                    <button
                      key={sev}
                      onClick={() => setTraumaSeverity(sev)}
                      className={`py-2 rounded-xl text-xs font-bold uppercase transition-all border ${
                        traumaSeverity === sev
                          ? 'bg-[#ea4335] text-white border-[#d93025] shadow-sm'
                          : 'bg-[#f8fafd] text-[#5f6368] border-[#dadce0] hover:text-[#202124]'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#5f6368] uppercase tracking-wider block mb-1">
                  Estimated Blood Loss: <span className="text-[#ea4335] font-bold">{bloodLossMl} mL</span>
                </label>
                <input
                  type="range"
                  min="500"
                  max="4500"
                  step="250"
                  value={bloodLossMl}
                  onChange={e => setBloodLossMl(Number(e.target.value))}
                  className="w-full accent-[#ea4335] cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#5f6368] uppercase tracking-wider block mb-1">
                  Patient Weight (kg)
                </label>
                <input
                  type="number"
                  value={patientWeight}
                  onChange={e => setPatientWeight(Number(e.target.value))}
                  className="w-full bg-[#f8fafd] border border-[#dadce0] rounded-xl px-3 py-2 text-xs font-bold text-[#202124] outline-none"
                />
              </div>

              <div className="p-3 rounded-2xl bg-[#fef7e0] border border-[#feefc3] text-[11px] text-[#b06000]">
                <strong>Damage Control Resuscitation Goal:</strong> Prevents lethal triad (hypothermia, coagulopathy, acidosis).
              </div>
            </div>

            {/* Calculated 1:1:1 Bundle Output */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#f1f3f4]">
                <h4 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                  Automated 1:1:1 Resuscitation Pack
                </h4>
                <span className="text-[11px] font-mono text-[#1a73e8] font-bold">
                  Total Volume: {totalVolumeMl} mL
                </span>
              </div>

              {/* 4 Components Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="bg-[#fce8e6] border border-[#fad2cf] p-3.5 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-[#c5221f] block uppercase">PRBC</span>
                  <span className="text-2xl font-black text-[#ea4335] font-mono">{prbcUnits}</span>
                  <span className="text-[9px] text-[#5f6368] block">Units (1-6°C)</span>
                </div>

                <div className="bg-[#e8f0fe] border border-[#d2e3fc] p-3.5 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-[#1a73e8] block uppercase">FFP Plasma</span>
                  <span className="text-2xl font-black text-[#1a73e8] font-mono">{ffpUnits}</span>
                  <span className="text-[9px] text-[#5f6368] block">Units (&lt;-18°C)</span>
                </div>

                <div className="bg-[#fef7e0] border border-[#feefc3] p-3.5 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-[#b06000] block uppercase">Platelets</span>
                  <span className="text-2xl font-black text-[#fbbc04] font-mono">{pltDoses}</span>
                  <span className="text-[9px] text-[#5f6368] block">Adult SDP (22°C)</span>
                </div>

                <div className="bg-[#e6f4ea] border border-[#ceead6] p-3.5 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-[#137333] block uppercase">Cryo</span>
                  <span className="text-2xl font-black text-[#34a853] font-mono">{cryoUnits}</span>
                  <span className="text-[9px] text-[#5f6368] block">Units Fibrinogen</span>
                </div>
              </div>

              {/* Drone Vector Plan */}
              <div className="bg-[#f8fafd] p-4 rounded-2xl border border-[#dadce0] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#202124]">Synchronized Aerial Vector Fleet:</span>
                  <span className="text-[10px] font-bold bg-[#e8f0fe] text-[#1a73e8] px-2 py-0.5 rounded-full">
                    {traumaSeverity === 'catastrophic' ? '3 Drones' : '2 Drones'} Required
                  </span>
                </div>
                <p className="text-[11px] text-[#5f6368]">
                  Vector 1: Cold PRBC Carrier (1-6°C) • Vector 2: Cryogenic FFP Pod (&lt;-18°C) • Vector 3: Agitated Platelet Chamber
                </p>
              </div>

              <button
                onClick={() => {
                  if (onLaunchMTPBundle) onLaunchMTPBundle(prbcUnits, ffpUnits);
                  else if (onOpenEmergencyRequest) onOpenEmergencyRequest();
                }}
                className="w-full bg-[#ea4335] hover:bg-[#d93025] text-white py-3 rounded-full text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Zap className="w-4 h-4" />
                <span>Dispatch STAT MTP Multi-Drone Fleet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXTENDED ANTIGEN PHENOTYPE CROSS-MATCH */}
      {selectedTab === 'crossmatch' && (
        <div className="bg-white p-6 rounded-3xl border border-[#dadce0] shadow-[0_1px_3px_rgba(60,64,67,0.08)] space-y-6">
          <div className="pb-3 border-b border-[#f1f3f4]">
            <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
              Extended Rh Sub-Groups & Kell Antigen Analyzer
            </h3>
            <p className="text-[11px] text-[#5f6368]">
              Prevents delayed hemolytic transfusion reactions in sickle cell, oncology, and repeat surgical patients
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Recipient Phenotype Checklist */}
            <div className="bg-[#f8fafd] p-4 rounded-2xl border border-[#dadce0] space-y-3">
              <span className="text-xs font-bold text-[#202124] block">Patient Antigen Profile:</span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {Object.keys(recipientPhenotype).map(ag => (
                  <button
                    key={ag}
                    onClick={() => setRecipientPhenotype(prev => ({ ...prev, [ag]: !prev[ag] }))}
                    className={`p-2 rounded-xl border text-center font-bold transition-all ${
                      recipientPhenotype[ag]
                        ? 'bg-[#1a73e8] text-white border-[#1557b0]'
                        : 'bg-white text-[#5f6368] border-[#dadce0]'
                    }`}
                  >
                    {ag}: {recipientPhenotype[ag] ? '+' : '-'}
                  </button>
                ))}
              </div>
            </div>

            {/* Donor Phenotype Checklist */}
            <div className="bg-[#f8fafd] p-4 rounded-2xl border border-[#dadce0] space-y-3">
              <span className="text-xs font-bold text-[#202124] block">Candidate Donor Antigen Profile:</span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {Object.keys(donorPhenotype).map(ag => (
                  <button
                    key={ag}
                    onClick={() => setDonorPhenotype(prev => ({ ...prev, [ag]: !prev[ag] }))}
                    className={`p-2 rounded-xl border text-center font-bold transition-all ${
                      donorPhenotype[ag]
                        ? 'bg-[#34a853] text-white border-[#2d9249]'
                        : 'bg-white text-[#5f6368] border-[#dadce0]'
                    }`}
                  >
                    {ag}: {donorPhenotype[ag] ? '+' : '-'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Compatibility Verdict */}
          <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
            incompatibleList.length === 0
              ? 'bg-[#e6f4ea] border-[#ceead6] text-[#137333]'
              : 'bg-[#fce8e6] border-[#fad2cf] text-[#c5221f]'
          }`}>
            <div>
              <span className="font-bold block text-sm">
                {incompatibleList.length === 0 ? '✓ Strict Antigen Cross-Match Passed' : '⚠️ Antigen Incompatibility Detected'}
              </span>
              <p className="text-[11px] mt-0.5">
                {incompatibleList.length === 0
                  ? 'Zero foreign antigens present. Safe for chronic transfusion protocol.'
                  : `Patient lacks [${incompatibleList.join(', ')}]. Risk of alloantibody formation.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 5 REGIONAL HOSPITAL BLOOD BANK RESERVES */}
      {selectedTab === 'inventory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {hospitals.map(hosp => {
              const totalUnits = Object.values(hosp.inventory || {}).reduce((a, b) => a + b, 0);
              const isCritical = (hosp.inventory?.['O-'] || 0) < 2;

              return (
                <div
                  key={hosp.id}
                  className="bg-white border border-[#dadce0] p-5 rounded-3xl shadow-[0_1px_3px_rgba(60,64,67,0.08)] hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#202124] text-sm">{hosp.name}</h4>
                          <span className="text-[10px] font-mono bg-[#f1f3f4] text-[#5f6368] px-2 py-0.5 rounded-full">
                            {hosp.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#5f6368] mt-0.5">{hosp.phone} • {hosp.helipad ? '🚁 Rooftop Helipad' : '🚑 Ambulance Bay'}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-[#202124] font-mono">{totalUnits} Units</span>
                        <span className="text-[10px] text-[#70757a] block">Total Reserve</span>
                      </div>
                    </div>

                    {isCritical && (
                      <div className="mb-3 bg-[#fce8e6] border border-[#fad2cf] p-2.5 rounded-2xl text-[11px] text-[#c5221f] flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-[#ea4335]" />
                        <span>Critical O- Universal Donor shortage at this trauma station.</span>
                      </div>
                    )}

                    {/* Blood Units Matrix */}
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                      {BLOOD_TYPES.map(type => {
                        const count = hosp.inventory?.[type] || 0;
                        const isLow = count < 2;
                        return (
                          <div
                            key={type}
                            className={`p-2 rounded-2xl text-center border font-mono ${
                              isLow
                                ? 'bg-[#fce8e6] border-[#fad2cf] text-[#c5221f] font-bold'
                                : 'bg-[#f8fafd] border-[#dadce0] text-[#202124]'
                            }`}
                          >
                            <span className="text-[10px] text-[#70757a] block">{type}</span>
                            <span className="text-xs font-bold">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#f1f3f4] flex items-center justify-between text-xs">
                    <button
                      onClick={() => onOpenEmergencyRequest && onOpenEmergencyRequest()}
                      className="text-[#ea4335] hover:text-[#d93025] font-semibold flex items-center gap-1"
                    >
                      <span>Request Emergency Supply</span>
                    </button>

                    <button
                      onClick={() => onOpenInterHospital && onOpenInterHospital()}
                      className="text-[#1a73e8] hover:text-[#1557b0] font-semibold flex items-center gap-1"
                    >
                      <span>Balance Surplus</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
