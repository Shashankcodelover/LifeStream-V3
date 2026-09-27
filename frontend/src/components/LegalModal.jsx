import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, FileText, Lock, CheckCircle, Scale, AlertCircle } from 'lucide-react';

export function LegalModal({ initialTab = 'privacy', onClose }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] glass-panel rounded-2xl shadow-2xl border border-slate-300/80 flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="legal-modal-title" className="text-base font-bold text-slate-900 tracking-tight">
                LifeStream Legal & Compliance
              </h2>
              <p className="text-xs text-slate-500">Emergency Logistics & Donor Health Data Governance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 px-6 bg-white/40">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'privacy'
                ? 'border-blue-500 text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy Policy (HIPAA / GDPR)</span>
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'terms'
                ? 'border-blue-500 text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Terms of Service</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-700 custom-scrollbar leading-relaxed">
          {activeTab === 'privacy' ? (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl text-blue-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <p>
                  LifeStream processes confidential health data solely for life-critical blood matching and emergency transport logistics under international emergency care exemptions.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                  1. Information We Collect
                </h3>
                <p className="text-slate-500">
                  When you register as an emergency donor, we collect your full legal name, ABO/Rh blood group, emergency contact telephone, and approximate geolocation coordinates to calculate proximity to trauma centers.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                  2. Purpose & Use of Data
                </h3>
                <p className="text-slate-500">
                  Data is processed strictly to match blood shortages at verified regional hospitals. Your contact telephone is used exclusively to transmit automated dispatch alerts and coordinate transport rendezvous during active medical alerts.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                  3. Health Privacy & Non-Commercial Guarantee
                </h3>
                <p className="text-slate-500">
                  We maintain zero commercial monetization of health or donor data. Information is never sold, shared with insurance brokers, or provided to advertising networks. End-to-end TLS 1.3 transit encryption safeguards all data transmission.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                  4. Donor Rights & Data Removal
                </h3>
                <p className="text-slate-500">
                  Donors retain the right to withdraw from the rapid dispatch roster at any time. Deletion requests immediately purge contact information and location coordinates from active matching engines.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-100/80 border border-slate-300 p-3 rounded-xl text-slate-700 flex items-start gap-2.5">
                <Scale className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <p>
                  By participating in the LifeStream autonomous logistics network, donors and regional hospital operators agree to the following emergency protocols.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                  1. Operational Scope
                </h3>
                <p className="text-slate-500">
                  LifeStream V3 operates as an automated emergency dispatch and cold-chain telemetry interface connecting certified hospital blood banks with willing voluntary donors and FAA-compliant medical transport carriers.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                  2. Medical Eligibility & 56-Day Cooldown
                </h3>
                <p className="text-slate-500">
                  Registered donors must comply with standard clinical donor criteria: at least 17 years of age, minimum weight of 110 lbs, and adherence to the mandatory 56-day whole blood donation recovery window (unless designated by attending physicians for designated critical universal emergencies).
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                  3. Autonomous Drone Transport Regulations
                </h3>
                <p className="text-slate-500">
                  Autonomous drone missions operate strictly within designated emergency medical air corridors under FAA Part 107 emergency waivers, incorporating active IoT cold-chain temperature verification (2.0°C–6.0°C) before unit acceptance at receiving trauma centers.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                  4. Limitation of Liability
                </h3>
                <p className="text-slate-500">
                  LifeStream provides real-time geospatial telemetry and matching algorithms in support of emergency medical personnel. Final clinical transfusion decisions and medical clearances remain the sole responsibility of licensed medical providers.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white/70 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">Effective Date: September 2026 · Rev 3.1</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-700 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
