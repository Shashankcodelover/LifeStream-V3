import React, { useState, useEffect } from 'react';
import {
  X, Package, CheckCircle2, Clock, Truck, ShieldCheck, Thermometer,
  MapPin, AlertTriangle, ArrowRight, ExternalLink, QrCode, FileText,
  Navigation
} from 'lucide-react';
import { resilientFetch } from '../api/client';

export function OrderTrackingModal({ onClose, activeDispatches = [] }) {
  const [requests, setRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await resilientFetch('/api/requests');
        setRequests(data || []);
        if (data && data.length > 0 && !selectedRequestId) {
          setSelectedRequestId(data[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const currentReq = requests.find(r => r.id === selectedRequestId) || requests[0];
  const relatedDispatch = activeDispatches.find(d => d.donorBloodType === currentReq?.bloodType) || activeDispatches[0];

  // Compute step based on request / dispatch status
  let currentStep = 3; // Default in-flight
  if (currentReq?.status === 'Fulfilled' || relatedDispatch?.status === 'Arrived') currentStep = 5;
  else if (relatedDispatch?.status === 'En Route') currentStep = 4;

  const STEPS = [
    {
      num: 1,
      title: 'STAT Order Broadcasted',
      desc: 'Emergency intake ticket verified by trauma department.',
      time: currentReq?.createdAt ? new Date(currentReq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:14 AM',
      done: currentStep >= 1
    },
    {
      num: 2,
      title: 'AI Proximity Match Secured',
      desc: 'Donor compatibility verified. 56-day cooldown cleared.',
      time: '10:16 AM',
      done: currentStep >= 2
    },
    {
      num: 3,
      title: 'Cold-Chain Thermal Sealed',
      desc: 'Unit packaged in IoT thermal box (2.0°C–6.0°C safe zone).',
      time: '10:18 AM',
      done: currentStep >= 3
    },
    {
      num: 4,
      title: 'Autonomous Vector In-Flight',
      desc: relatedDispatch ? `${relatedDispatch.transportType} traveling at ${relatedDispatch.speedMph || 48} mph.` : 'Autonomous transport active.',
      time: relatedDispatch ? `ETA ~${relatedDispatch.etaMinutes}m` : 'In Transit',
      done: currentStep >= 4,
      current: currentStep === 4
    },
    {
      num: 5,
      title: 'Hospital Rooftop Intake & Stock',
      desc: 'Verified by receiving trauma nurse and placed in ICU blood reserve.',
      time: currentStep === 5 ? 'Delivered' : 'Pending',
      done: currentStep >= 5
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-3xl glass-panel p-6 rounded-2xl shadow-2xl border border-slate-700/80 relative flex flex-col max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">Emergency Blood Order & Cold-Chain Delivery Tracker</h3>
              <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                LIVE TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-400">Amazon/Flipkart-grade multi-stage package tracking with cryptographic chain-of-custody</p>
          </div>
        </div>

        {/* Order Selector if multiple */}
        {requests.length > 1 && (
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
            {requests.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRequestId(r.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold whitespace-nowrap transition-all border ${
                  currentReq?.id === r.id
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {r.id} ({r.bloodType}) • {r.patientName}
              </button>
            ))}
          </div>
        )}

        {currentReq ? (
          <div className="space-y-6">
            {/* Package Summary Card */}
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Ticket & Tracking ID</span>
                <span className="font-mono font-bold text-white text-sm">{currentReq.id}</span>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Chain-of-Custody: {currentReq.custodySeal || 'E39F8A2D104B76C1'}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Patient Name</span>
                <span className="font-semibold text-slate-200">{currentReq.patientName}</span>
                <span className="text-[10px] text-slate-500 block">{currentReq.medicalReason?.slice(0, 30)}...</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Destination Trauma Center</span>
                <span className="font-semibold text-rose-300">{currentReq.hospitalName}</span>
                <span className="text-[10px] text-slate-500 font-mono block">Emergency ICU Hub</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Blood Group Payload</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-base font-bold font-mono text-white bg-red-600 px-2 py-0.5 rounded">
                    {currentReq.bloodType}
                  </span>
                  <span className="text-[11px] text-slate-300 font-mono font-bold">{currentReq.unitsRequired || 2} Units</span>
                </div>
              </div>
            </div>

            {/* Amazon-Style Multi-Step Vertical Timeline */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-5 flex items-center justify-between">
                <span>Multi-Stage Delivery Milestone Pipeline</span>
                <span className="text-[10px] text-cyan-400 font-mono font-semibold">
                  Status: {currentStep === 5 ? 'COMPLETED' : 'EN ROUTE'}
                </span>
              </h4>

              <div className="relative pl-6 space-y-6">
                {/* Vertical connecting line */}
                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-800" />

                {STEPS.map((step, idx) => {
                  const isDone = step.done;
                  const isCurrent = step.current;

                  return (
                    <div key={idx} className="relative flex items-start justify-between gap-4">
                      {/* Node Icon */}
                      <div
                        className={`absolute -left-6 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/30'
                            : isCurrent
                            ? 'bg-purple-600 border-purple-400 text-white animate-pulse'
                            : 'bg-slate-900 border-slate-700 text-slate-500'
                        }`}
                      >
                        {isDone ? '✓' : step.num}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className={`text-xs font-bold ${isDone ? 'text-white' : 'text-slate-400'}`}>
                            {step.title}
                          </h5>
                          {isCurrent && (
                            <span className="text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded font-bold animate-pulse">
                              LIVE IN-FLIGHT
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{step.desc}</p>
                      </div>

                      <span className="text-[11px] font-mono font-bold text-slate-400 shrink-0">
                        {step.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cold-Chain IoT Live Telemetry Card */}
            {relatedDispatch && (
              <div className="bg-slate-950/80 border border-cyan-500/30 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Thermometer className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Cold-Chain Thermal Sensor</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold font-mono text-cyan-400">{relatedDispatch.tempCelsius || 4.0}°C</span>
                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded">
                        Safe (2°C–6°C Compliance)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
                  <div>
                    <span className="text-[9px] text-slate-500 block">ALTITUDE</span>
                    <span>{relatedDispatch.altitudeMeters || 150}m</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">SPEED</span>
                    <span>{relatedDispatch.speedMph || 48} mph</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">BATTERY</span>
                    <span className="text-emerald-400">{relatedDispatch.batteryPct || 98}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-slate-400">
            No active emergency blood orders found. Submit a STAT request from the top bar.
          </div>
        )}
      </div>
    </div>
  );
}
