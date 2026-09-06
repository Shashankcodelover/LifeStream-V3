import React, { useState, useEffect } from 'react';
import { X, Trophy, Award, Heart, Send, CheckCircle2, ShieldCheck, Zap, Phone } from 'lucide-react';
import { resilientFetch } from '../api/client';

export function DonorLeaderboardModal({ onClose, activeHospitalName = 'SF General Trauma Center' }) {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pingedDonorId, setPingedDonorId] = useState(null);
  const [pingMessage, setPingMessage] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await resilientFetch('/api/donors/leaderboard');
        setDonors(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSimulatePing = async (donor) => {
    setPingedDonorId(donor.id);
    try {
      const data = await resilientFetch(`/api/donors/ping/${donor.id}`, {
        method: 'POST',
        body: JSON.stringify({
          hospitalName: activeHospitalName,
          bloodType: donor.bloodType,
          urgency: 'critical'
        })
      });
      setPingMessage(data.notification);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-3xl glass-panel p-6 rounded-2xl shadow-2xl border border-slate-700/80 relative flex flex-col max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">Community Blood Heroes & Impact Leaderboard</h3>
              <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                TOP 1% RESPONDERS
              </span>
            </div>
            <p className="text-xs text-slate-400">Honoring verified life-savers across the San Francisco rapid emergency network</p>
          </div>
        </div>

        {/* SMS Ping Alert Notification Card if triggered */}
        {pingMessage && (
          <div className="mb-4 bg-purple-950/40 border border-purple-500/40 p-4 rounded-2xl animate-fade-in flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">SMS Dispatch Alert Sent to {pingMessage.recipient}</span>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">DELIVERED</span>
                </div>
                <p className="text-xs font-mono text-slate-300 mt-1 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  {pingMessage.payload}
                </p>
                <span className="text-[10px] text-slate-500 mt-1 block">Recipient: {pingMessage.phone} • Timestamp: {new Date(pingMessage.sentAt).toLocaleTimeString()}</span>
              </div>
            </div>

            <button
              onClick={() => setPingMessage(null)}
              className="text-xs text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Leaderboard Table */}
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">Loading hero rankings...</div>
        ) : (
          <div className="space-y-3">
            {donors.map((donor, idx) => {
              const isTop3 = idx < 3;
              const rankColor = idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-slate-500';

              return (
                <div
                  key={donor.id}
                  className={`bg-slate-900/80 border rounded-2xl p-4 transition-all flex flex-wrap items-center justify-between gap-3 ${
                    isTop3 ? 'border-amber-500/30 shadow-md shadow-amber-500/5' : 'border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-bold font-mono text-sm ${rankColor}`}>
                      #{idx + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{donor.name}</h4>
                        <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded">
                          {donor.bloodType}
                        </span>
                        {donor.isVerified && (
                          <ShieldCheck className="w-4 h-4 text-cyan-400" title="Verified Responder" />
                        )}
                        <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          {donor.rankTier}
                        </span>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {(donor.badges || ['Life Saver']).map((badge, bIdx) => (
                          <span key={bIdx} className="text-[10px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800">
                            ⭐ {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="flex items-baseline gap-1 justify-end">
                        <span className="text-lg font-bold font-mono text-emerald-400">{donor.livesImpacted}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">Lives Saved</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono block">{donor.totalDonations} Donations • {donor.reliabilityScore}% Reliability</span>
                    </div>

                    <button
                      onClick={() => handleSimulatePing(donor)}
                      className="flex items-center gap-1.5 bg-slate-800 hover:bg-purple-600/30 text-slate-300 hover:text-purple-300 border border-slate-700 hover:border-purple-500/40 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
                      title="Send Emergency Dispatch SMS Alert"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Ping SMS</span>
                    </button>
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
