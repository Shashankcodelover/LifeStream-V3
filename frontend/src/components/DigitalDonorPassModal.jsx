import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Droplet, QrCode, Award, Heart, Sparkles, X,
  Calendar, CheckCircle2, Copy, Download, Share2
} from 'lucide-react';
import { resilientFetch } from '../api/client';

export function DigitalDonorPassModal({ user, onClose }) {
  const [passData, setPassData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await resilientFetch('/api/auth/donor-pass');
        setPassData(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const handleCopyPassId = () => {
    if (passData?.passId) {
      navigator.clipboard.writeText(passData.passId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-gradient-to-br from-slate-900 via-slate-800 to-rose-950 text-white p-6 rounded-3xl shadow-2xl border border-slate-700 relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/80 mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-rose-600 flex items-center justify-center text-white font-black text-xs shadow-md">
              <Droplet className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h3 className="text-xs font-bold tracking-tight text-white">Google Wallet • LifeStream Pass</h3>
              <p className="text-[9px] text-slate-400 font-mono">NFC Emergency Hero Badge</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Body */}
        {passData ? (
          <div className="space-y-4 relative z-10 font-sans">
            {/* Donor Identity Bar */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">HERO LIFESAVER</span>
                <h4 className="text-base font-black text-white">{user?.name || passData.passHolderName}</h4>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>AABB Verified Vanguard</span>
                </span>
              </div>

              {/* Big Blood Group Badge */}
              <div className="bg-rose-600 text-white font-mono font-black text-xl px-3 py-1.5 rounded-2xl shadow-lg border border-rose-400">
                {user?.bloodType || passData.bloodType}
              </div>
            </div>

            {/* Phenotype & Stats Grid */}
            <div className="grid grid-cols-2 gap-2 bg-slate-800/80 p-3 rounded-2xl border border-slate-700 text-xs">
              <div>
                <span className="text-[9px] text-slate-400 block font-semibold">LIFETIME DONATIONS</span>
                <span className="font-mono font-black text-white text-sm">{passData.totalDonations} Units</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 block font-semibold">EST. LIVES SAVED</span>
                <span className="font-mono font-black text-emerald-400 text-sm">~{passData.estimatedLivesSaved} People</span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-700">
                <span className="text-[9px] text-slate-400 block font-semibold">EXTENDED PHENOTYPE</span>
                <span className="font-mono text-[10px] text-sky-300 font-bold">{passData.phenotype}</span>
              </div>
            </div>

            {/* Simulated Digital Barcode & QR code */}
            <div className="bg-white p-3 rounded-2xl flex items-center justify-between gap-3 text-slate-900">
              <div className="w-14 h-14 bg-slate-100 rounded-xl border border-slate-300 flex items-center justify-center p-1">
                <QrCode className="w-full h-full text-slate-800" />
              </div>

              <div className="flex-1 text-right">
                <span className="text-[9px] text-slate-500 font-mono block">ISBT-128 BARCODE</span>
                <span className="text-xs font-mono font-black tracking-widest text-slate-900">{passData.barcode}</span>
                <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">Ready for Hospital NFC Scanner</span>
              </div>
            </div>

            {/* Pass Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleCopyPassId}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 rounded-full border border-white/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Pass ID Copied!' : 'Copy Pass Token'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">Loading digital pass...</div>
        )}
      </div>
    </div>
  );
}
