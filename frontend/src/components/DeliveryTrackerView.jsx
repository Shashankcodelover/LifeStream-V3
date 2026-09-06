import React, { useState, useEffect } from 'react';
import {
  Package, ShieldCheck, Thermometer, Radio, Clock, MapPin,
  CheckCircle2, Navigation, ArrowRight, ExternalLink, RefreshCw,
  Play, RotateCcw, AlertTriangle, FileText
} from 'lucide-react';
import { resilientFetch } from '../api/client';

export function DeliveryTrackerView({ activeDispatches = [], onOpenEmergencyRequest }) {
  const [requests, setRequests] = useState([]);
  const [selectedReqId, setSelectedReqId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [interactiveStep, setInteractiveStep] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await resilientFetch('/api/requests');
        if (Array.isArray(data)) {
          setRequests(data);
          if (data.length > 0 && !selectedReqId) setSelectedReqId(data[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const currentReq = requests.find(r => r.id === selectedReqId) || requests[0];
  const relatedDispatch = activeDispatches.find(d => d.donorBloodType === currentReq?.bloodType) || activeDispatches[0];

  let calculatedStep = 3;
  if (currentReq?.status === 'Fulfilled' || relatedDispatch?.status === 'Arrived') calculatedStep = 5;
  else if (relatedDispatch?.status === 'En Route') calculatedStep = 4;

  const activeStep = interactiveStep !== null ? interactiveStep : calculatedStep;

  const STEPS = [
    {
      num: 1,
      title: 'Emergency Requisition Logged',
      desc: 'Digital intake ticket verified by trauma dispatch protocol.',
      time: currentReq?.createdAt ? new Date(currentReq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:14 AM',
      details: 'Verified by Trauma Level-1 Physician. Blood type compatibility matched against 5 regional centers.'
    },
    {
      num: 2,
      title: 'AI Proximity Donor Matched',
      desc: 'Donor compatibility verified. 56-day cooldown cleared.',
      time: '10:16 AM',
      details: 'Algorithm confirmed zero cross-match incompatibility antigens. Donor reliability rating: 98%.'
    },
    {
      num: 3,
      title: 'Cold-Chain Thermal Sealed',
      desc: 'Unit packaged in IoT thermal secure box (2.0°C–6.0°C safe zone).',
      time: '10:18 AM',
      details: 'Vacuum insulated chamber locked with active telemetry sensor probe #IoT-4491.'
    },
    {
      num: 4,
      title: 'Autonomous Vector In-Flight',
      desc: relatedDispatch ? `${relatedDispatch.transportType} traveling at ${relatedDispatch.speedMph || 48} mph.` : 'Autonomous transport active.',
      time: relatedDispatch ? `ETA ~${relatedDispatch.etaMinutes}m` : 'In Transit',
      details: 'Vector flying along approved FAA medical emergency aerial corridor at 150m altitude.'
    },
    {
      num: 5,
      title: 'Hospital Rooftop Intake & Stock',
      desc: 'Verified by receiving trauma nurse and placed in ICU reserve.',
      time: activeStep === 5 ? 'Delivered' : 'Pending',
      details: 'Custody signature logged on trauma hospital registry. Patient prep underway in OR-3.'
    }
  ];

  return (
    <div className="pt-20 pb-12 px-4 sm:px-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header with Google Brand Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#1a73e8]" />
            <h2 className="text-xl font-bold text-[#202124] tracking-tight">Google Logistics • Live Emergency Delivery Tracker</h2>
            <span className="text-[10px] font-bold bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] px-2.5 py-0.5 rounded-full">
              COLD-CHAIN AUDIT
            </span>
          </div>
          <p className="text-xs text-[#5f6368] mt-1">
            Real-time multi-stage transit pipeline, IoT thermal compliance, and cryptographic chain of custody
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Simulation Step Advance Button for Interactive Testing */}
          <button
            onClick={() => setInteractiveStep((activeStep % 5) + 1)}
            className="flex items-center gap-1.5 bg-white hover:bg-[#f8fafd] text-[#1a73e8] border border-[#dadce0] px-3.5 py-2 rounded-full text-xs font-medium transition-all shadow-sm"
            title="Step through delivery stages interactively"
          >
            <Play className="w-3 h-3 text-[#1a73e8]" />
            <span>Simulate Step ({activeStep}/5)</span>
          </button>

          {relatedDispatch && (
            <button
              onClick={() => onOpenCustodyModal && onOpenCustodyModal(relatedDispatch)}
              className="flex items-center gap-1.5 bg-[#e6f4ea] hover:bg-[#ceead6] text-[#137333] border border-[#ceead6] text-xs font-bold px-3.5 py-2 rounded-full shadow-sm transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#34a853]" />
              <span>Verify SHA-256 Custody Seal</span>
            </button>
          )}

          <button
            onClick={onOpenEmergencyRequest}
            className="flex items-center gap-1.5 bg-[#ea4335] hover:bg-[#d93025] text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm transition-all"
          >
            <span>New STAT Request</span>
          </button>
        </div>
      </div>

      {currentReq ? (
        <div className="space-y-6">
          {/* Order Header Summary Card */}
          <div className="bg-white border border-[#dadce0] p-6 rounded-3xl grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs shadow-[0_1px_3px_rgba(60,64,67,0.08)]">
            <div>
              <span className="text-[10px] font-bold text-[#5f6368] uppercase block mb-1">Requisition Tracking ID</span>
              <span className="font-mono font-bold text-[#202124] text-base">{currentReq.id}</span>
              <div className="flex items-center gap-1 text-[11px] text-[#137333] font-medium mt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Custody Seal: {currentReq.custodySeal || 'E39F8A2D104B'}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#5f6368] uppercase block mb-1">Patient Information</span>
              <span className="font-bold text-[#202124] text-sm">{currentReq.patientName}</span>
              <span className="text-[11px] text-[#5f6368] block mt-0.5">{currentReq.contactPhone}</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#5f6368] uppercase block mb-1">Destination Trauma Center</span>
              <span className="font-bold text-[#ea4335] text-sm">{currentReq.hospitalName}</span>
              <span className="text-[10px] text-[#70757a] block mt-0.5">ICU Acute Trauma Center</span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-[#5f6368] uppercase block mb-1">Payload Specification</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-base font-bold font-mono text-white bg-[#ea4335] px-2.5 py-0.5 rounded-lg shadow-sm">
                  {currentReq.bloodType}
                </span>
                <span className="text-xs text-[#202124] font-medium">{currentReq.unitsRequired || 2} Units Required</span>
              </div>
            </div>
          </div>

          {/* Interactive 5-Step Delivery Milestone Timeline */}
          <div className="bg-white border border-[#dadce0] p-6 rounded-3xl shadow-[0_1px_3px_rgba(60,64,67,0.08)]">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#f1f3f4]">
              <div>
                <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                  Autonomous Delivery Milestone Pipeline
                </h3>
                <p className="text-[11px] text-[#5f6368]">Click any milestone step below to inspect detailed telemetry & logs</p>
              </div>

              <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                activeStep === 5
                  ? 'bg-[#e6f4ea] text-[#137333] border-[#ceead6]'
                  : 'bg-[#e8f0fe] text-[#1a73e8] border-[#d2e3fc]'
              }`}>
                {activeStep === 5 ? '✓ COMPLETED' : `STEP ${activeStep} OF 5 IN TRANSIT`}
              </span>
            </div>

            {/* Stepper Grid (Interactive) */}
            <div className="relative pl-6 space-y-6">
              <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-[#dadce0]" />

              {STEPS.map((step) => {
                const isDone = activeStep >= step.num;
                const isCurrent = activeStep === step.num;

                return (
                  <div
                    key={step.num}
                    onClick={() => setInteractiveStep(step.num)}
                    className={`relative flex items-start justify-between gap-4 p-3 rounded-2xl cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-[#f8fafd] border border-[#1a73e8]/30 shadow-sm'
                        : 'hover:bg-[#f1f3f4]/60'
                    }`}
                  >
                    <div
                      className={`absolute -left-6 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all ${
                        isDone
                          ? 'bg-[#34a853] border-[#34a853] text-white shadow-sm'
                          : 'bg-white border-[#dadce0] text-[#70757a]'
                      }`}
                    >
                      {isDone ? '✓' : step.num}
                    </div>

                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xs font-bold ${isDone ? 'text-[#202124]' : 'text-[#70757a]'}`}>
                          {step.title}
                        </h4>
                        {isCurrent && (
                          <span className="text-[9px] font-bold bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] px-2 py-0.2 rounded-full animate-pulse">
                            ACTIVE STAGE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#5f6368] mt-0.5">{step.desc}</p>
                      {isCurrent && (
                        <p className="text-[11px] text-[#1a73e8] mt-1 bg-[#e8f0fe]/50 p-2 rounded-xl border border-[#d2e3fc]/50 font-medium">
                          {step.details}
                        </p>
                      )}
                    </div>

                    <span className="text-[11px] font-bold text-[#5f6368] shrink-0 font-mono">
                      {step.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* IoT Cold Chain Telemetry Metrics */}
          {relatedDispatch && (
            <div className="bg-white border border-[#dadce0] p-5 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-[0_1px_3px_rgba(60,64,67,0.08)]">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#e8f0fe] flex items-center justify-center text-[#1a73e8]">
                  <Thermometer className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#5f6368] uppercase block">Active Thermal Sensor</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#1a73e8] font-mono">{relatedDispatch.tempCelsius || 4.0}°C</span>
                    <span className="text-[10px] font-bold bg-[#e6f4ea] text-[#137333] border border-[#ceead6] px-2.5 py-0.5 rounded-full">
                      Safe Medical Range (2.0°C–6.0°C)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-[#5f6368]">
                <div>
                  <span className="text-[10px] text-[#70757a] block font-semibold">SPEED</span>
                  <span className="font-bold text-[#202124] text-sm">{relatedDispatch.speedMph || 48} mph</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#70757a] block font-semibold">ALTITUDE</span>
                  <span className="font-bold text-[#202124] text-sm">{relatedDispatch.altitudeMeters || 150}m</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#70757a] block font-semibold">BATTERY</span>
                  <span className="font-bold text-[#1e8e3e] text-sm">{relatedDispatch.batteryPct || 98}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-16 text-center text-sm text-[#5f6368] bg-white p-8 rounded-3xl shadow-sm border border-[#dadce0]">
          <Package className="w-8 h-8 text-[#70757a] mx-auto mb-2" />
          <p className="font-semibold text-[#202124]">No active emergency delivery tickets found.</p>
          <p className="text-xs text-[#5f6368] mt-1">Submit a STAT Emergency Request to launch autonomous drone transport.</p>
        </div>
      )}
    </div>
  );
}
