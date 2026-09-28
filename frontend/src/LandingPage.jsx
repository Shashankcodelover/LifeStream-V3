import React from 'react';
import { Activity, ArrowRight, Play } from 'lucide-react';

export function LandingPage({ onDemo }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto">
        <div className="mx-auto w-24 h-24 bg-cyan-100 rounded-full flex items-center justify-center mb-8 shadow-sm">
          <Activity className="w-12 h-12 text-cyan-600" />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
          LifeStream V3
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto">
          The next-generation autonomous emergency medical drone dispatch system. 
          Instantly connect critical patients with live blood supplies, coordinate autonomous drone telemetry, and ensure rapid, life-saving delivery.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md mx-auto">
          <button
            onClick={() => alert('Authentication not yet configured.')}
            className="flex-1 px-8 py-4 bg-slate-900 text-white rounded-xl font-bold shadow hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            Sign Up / Login <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={onDemo}
            className="flex-1 px-8 py-4 bg-white border border-slate-300 text-slate-900 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" /> Try Demo
          </button>
        </div>
      </main>
    </div>
  );
}
