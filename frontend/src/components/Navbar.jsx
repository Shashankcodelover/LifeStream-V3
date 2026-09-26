import React from 'react';
import { Activity, Hospital, UserPlus, Radio, ShieldCheck, Heart } from 'lucide-react';

export function Navbar({ onOpenInventory, onOpenRegisterDonor, onOpenLegal, activeDispatchCount, onLogoClick }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 px-4 md:px-6 py-3 flex items-center justify-between glass-panel border-b border-slate-800/80">
      {/* Brand & Mission Status */}
      <button
        onClick={onLogoClick}
        className="flex items-center gap-3 text-left focus:outline-none group"
        title="LifeStream Emergency Network — Click to reset view"
      >
        <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:bg-red-500 transition-colors">
          <Activity className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base md:text-lg text-white tracking-tight">LifeStream</span>
            <span className="text-[10px] font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
              V3.1
            </span>
          </div>
          <p className="hidden sm:block text-[11px] text-slate-400 font-medium">
            Emergency Blood Dispatch & Cold-Chain Logistics
          </p>
        </div>
      </button>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {activeDispatchCount > 0 ? (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-emerald-400 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 animate-spin" />
            <span>{activeDispatchCount} Active Mission{activeDispatchCount > 1 ? 's' : ''}</span>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-800/70 border border-slate-700/60 px-2.5 py-1 rounded-lg text-slate-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>SF Grid Operational</span>
          </div>
        )}

        <button
          onClick={onOpenLegal}
          className="hidden md:flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-xs px-2.5 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
          title="HIPAA & Emergency Logistics Compliance"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Compliance</span>
        </button>

        <button
          onClick={onOpenInventory}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
        >
          <Hospital className="w-4 h-4 text-red-400" />
          <span className="hidden sm:inline">Trauma Reserves</span>
          <span className="sm:hidden">Reserves</span>
        </button>

        <button
          onClick={onOpenRegisterDonor}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-red-600/30 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Register Donor</span>
          <span className="sm:hidden">Register</span>
        </button>
      </div>
    </header>
  );
}
