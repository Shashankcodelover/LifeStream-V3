import React, { useState, useEffect } from 'react';
import { X, Hospital, PackageCheck, AlertTriangle, Search, Copy, Check } from 'lucide-react';

export function HospitalInventoryModal({ onClose }) {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShortageOnly, setFilterShortageOnly] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/hospitals');
        const data = await res.json();
        setHospitals(data);
      } catch (e) {
        // silent fail handled by loading state
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const copyHospital = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const filteredHospitals = hospitals.filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) || h.id.toLowerCase().includes(searchTerm.toLowerCase());
    if (!filterShortageOnly) return matchesSearch;
    const hasShortage = Object.values(h.inventory).some((units) => units <= 1);
    return matchesSearch && hasShortage;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="hospital-inventory-title"
    >
      <div
        className="w-full max-w-2xl glass-panel p-6 rounded-2xl shadow-2xl border border-slate-700/80 relative flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
            <Hospital className="w-5 h-5" />
          </div>
          <div>
            <h2 id="hospital-inventory-title" className="text-lg font-bold text-white">
              Hospital Blood Bank Reserves
            </h2>
            <p className="text-xs text-slate-400">
              Real-time regional trauma center inventory & critical shortage tracking
            </p>
          </div>
        </div>

        {/* Search & Shortage filter toolbar */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              aria-label="Filter hospitals by facility name or ID"
              placeholder="Filter by facility name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/50 transition-colors"
            />
          </div>
          <button
            onClick={() => setFilterShortageOnly(!filterShortageOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              filterShortageOnly
                ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-sm shadow-red-900/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Shortages Only</span>
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400 font-mono">
            Accessing regional hospital inventory servers...
          </div>
        ) : (
          <div className="space-y-3.5 overflow-y-auto pr-1 custom-scrollbar flex-1">
            {filteredHospitals.map((h) => {
              const criticalUnits = Object.entries(h.inventory).filter(([_, units]) => units <= 1);
              return (
                <div key={h.id} className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="font-bold text-sm text-white">{h.name}</h3>
                      <span className="text-[10px] text-slate-400 font-mono">Trauma Level 1 Facility</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {criticalUnits.length > 0 && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {criticalUnits.length} Low Types
                        </span>
                      )}
                      <button
                        onClick={() => copyHospital(h.id)}
                        className="text-[10px] font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
                        title="Copy Facility Identifier"
                      >
                        {copiedId === h.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                        <span>{h.id}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                    {Object.entries(h.inventory).map(([type, units]) => {
                      const isLow = units <= 1;
                      return (
                        <div
                          key={type}
                          className={`p-2 rounded-lg text-center border font-mono transition-colors ${
                            isLow
                              ? 'bg-red-500/10 border-red-500/30 text-red-400 font-bold'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span className="text-[10px] block text-slate-400 font-sans font-semibold mb-0.5">
                            {type}
                          </span>
                          <span className="text-xs font-bold">{units} u</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {filteredHospitals.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs">
                No hospitals match the selected filter criteria.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
