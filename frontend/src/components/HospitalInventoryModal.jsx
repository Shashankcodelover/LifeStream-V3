import React, { useState, useEffect } from 'react';
import { X, Hospital, PackageCheck, AlertTriangle, Phone, ShieldCheck } from 'lucide-react';
import { resilientFetch } from '../api/client';

const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export function HospitalInventoryModal({ onClose }) {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await resilientFetch('/api/hospitals');
        setHospitals(data || []);
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-3xl bg-white p-6 rounded-3xl shadow-2xl border border-slate-200 relative flex flex-col max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <Hospital className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">Trauma Center Blood Bank Reserves</h3>
              <span className="text-[10px] font-mono font-bold bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full">
                5 REGIONAL HUBS
              </span>
            </div>
            <p className="text-xs text-slate-500">Real-time inventory levels across San Francisco regional trauma centers</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">Loading hospital data...</div>
        ) : (
          <div className="space-y-4 pr-1">
            {hospitals.map(h => {
              const totalUnits = Object.values(h.inventory || {}).reduce((a, b) => a + b, 0);
              return (
                <div key={h.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex flex-wrap justify-between items-center gap-2 mb-3 pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{h.name}</h4>
                      <span className="text-[10px] font-mono bg-white text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">{h.code || h.id}</span>
                      {h.helipad && (
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-mono font-bold">
                          HELIPAD ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-600 font-mono">
                      <span>Total: <strong className="text-slate-900">{totalUnits} units</strong></span>
                      {h.phone && <span>Tel: {h.phone}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {BLOOD_TYPES.map(type => {
                      const units = (h.inventory && h.inventory[type]) || 0;
                      const isLow = units <= 1;
                      return (
                        <div
                          key={type}
                          className={`p-2 rounded-xl text-center border font-mono ${
                            isLow
                              ? 'bg-rose-50 border-rose-200 text-rose-700 font-bold'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="text-[10px] block text-slate-400 font-sans font-semibold">{type}</span>
                          <span className="text-sm font-bold">{units} u</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
