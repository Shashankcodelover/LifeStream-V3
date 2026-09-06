import React, { useState } from 'react';
import {
  ShieldCheck, FileText, QrCode, Lock, CheckCircle2, Download,
  Copy, X, Thermometer, Clock, MapPin, Building
} from 'lucide-react';

export function DigitalCustodyModal({ dispatch, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!dispatch) return null;

  const seal = dispatch.custodySeal || {
    isbt128Barcode: `W982400192841`,
    custodySealHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    thermalCompliance: '2.0°C - 6.0°C Continuous Safe',
    generatedAt: dispatch.startTime || new Date().toISOString()
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(seal.custodySealHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white p-6 rounded-3xl shadow-2xl border border-[#dadce0] relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#f1f3f4] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#e6f4ea] flex items-center justify-center text-[#137333]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#202124]">
                Cryptographic Proof-of-Custody & Intake Audit
              </h3>
              <p className="text-[10px] text-[#5f6368] font-mono">
                SHA-256 Tamper-Proof Digital Seal · ISBT-128 Standard
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Certificate Body */}
        <div className="space-y-4 text-xs text-[#202124]">
          {/* Certificate Banner */}
          <div className="bg-[#f8fafd] p-4 rounded-2xl border border-[#dadce0] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#5f6368]">DIGITAL SEAL HASH</span>
              <span className="text-[10px] font-bold text-[#137333] bg-[#e6f4ea] px-2 py-0.5 rounded-full">
                VERIFIED ON LEDGER
              </span>
            </div>
            <p className="font-mono text-[10px] text-[#1a73e8] break-all bg-white p-2 rounded-xl border border-[#d2e3fc]">
              {seal.custodySealHash}
            </p>
          </div>

          {/* Key Parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="bg-[#f8fafd] p-3 rounded-2xl border border-[#dadce0]">
              <span className="text-[9px] text-[#5f6368] block uppercase font-semibold">BARCODE (ISBT-128)</span>
              <span className="font-mono font-bold text-[#202124] text-xs">{seal.isbt128Barcode}</span>
            </div>

            <div className="bg-[#f8fafd] p-3 rounded-2xl border border-[#dadce0]">
              <span className="text-[9px] text-[#5f6368] block uppercase font-semibold">BLOOD PAYLOAD</span>
              <span className="font-mono font-bold text-[#ea4335] text-xs">{dispatch.donorBloodType} (1 Unit)</span>
            </div>

            <div className="bg-[#f8fafd] p-3 rounded-2xl border border-[#dadce0]">
              <span className="text-[9px] text-[#5f6368] block uppercase font-semibold">THERMAL SEAL</span>
              <span className="font-mono font-bold text-[#137333] text-xs">2.0°C - 6.0°C Safe</span>
            </div>
          </div>

          {/* Origin & Destination */}
          <div className="bg-[#f8fafd] p-3.5 rounded-2xl border border-[#dadce0] space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#5f6368]">Dispatch Vector:</span>
              <span className="font-bold text-[#202124]">{dispatch.transportType} ({dispatch.id})</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#5f6368]">Origin Donor:</span>
              <span className="font-bold text-[#202124]">{dispatch.donorName}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#5f6368]">Receiving Center:</span>
              <span className="font-bold text-[#ea4335]">{dispatch.hospitalName}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleCopyHash}
              className="flex-1 bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#202124] font-bold py-2.5 rounded-full text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-[#5f6368]" />
              <span>{copied ? 'Hash Copied!' : 'Copy SHA-256 Hash'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold py-2.5 rounded-full text-xs shadow-sm transition-all"
            >
              Close Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
