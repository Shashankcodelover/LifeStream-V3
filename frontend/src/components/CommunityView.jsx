import React, { useState, useEffect } from 'react';
import {
  Trophy, Award, Heart, CheckCircle2, Calendar, Plus, Phone, Droplet,
  Clock, ShieldCheck, Sparkles, UserCheck, MapPin, Bus, QrCode
} from 'lucide-react';
import { resilientFetch } from '../api/client';

export function CommunityView({ user, hospitals = [], onOpenAppointments, onOpenEligibility, onOpenDonorPass }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rsvpFeedback, setRsvpFeedback] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [lbData, aptData, drivesData] = await Promise.all([
          resilientFetch('/api/donors/leaderboard'),
          resilientFetch('/api/auth/appointments'),
          resilientFetch('/api/drives')
        ]);
        if (Array.isArray(lbData)) setLeaderboard(lbData);
        if (Array.isArray(aptData)) setAppointments(aptData);
        if (Array.isArray(drivesData)) setDrives(drivesData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRsvpDrive = async (driveId) => {
    try {
      const res = await fetch(`/api/drives/${driveId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: user?.name || 'Voluntary Lifesaver',
          bloodType: user?.bloodType || 'O-'
        })
      });
      const data = await res.json();
      setRsvpFeedback(`✓ RSVP Confirmed! Pass code: ${data.rsvp?.qrPassCode}`);
      setTimeout(() => setRsvpFeedback(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="pt-20 pb-12 px-4 sm:px-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header with Google Brand Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#fbbc04]" />
            <h2 className="text-xl font-bold text-[#202124] tracking-tight">
              Google Health • Community Heroes & Regional Mobile Drives
            </h2>
            <span className="text-[10px] font-bold bg-[#fef7e0] text-[#b06000] border border-[#feefc3] px-2.5 py-0.5 rounded-full">
              VOLUNTARY GUARDIANS
            </span>
          </div>
          <p className="text-xs text-[#5f6368] mt-1">
            Top voluntary lifesavers, mobile donation buses, scheduled center bookings, and digital NFC hero passes
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Digital Donor Pass Button */}
          <button
            onClick={onOpenDonorPass}
            className="flex items-center gap-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm transition-all"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Digital NFC Donor Pass</span>
          </button>

          <button
            onClick={onOpenEligibility}
            className="flex items-center gap-1.5 bg-white hover:bg-[#f8fafd] text-[#1e8e3e] border border-[#dadce0] text-xs font-bold px-3.5 py-2 rounded-full transition-all shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#34a853]" />
            <span>5-Point Health Clearance</span>
          </button>
        </div>
      </div>

      {rsvpFeedback && (
        <div className="p-3 bg-[#e6f4ea] border border-[#ceead6] text-[#137333] font-bold text-xs rounded-2xl animate-fade-in">
          {rsvpFeedback}
        </div>
      )}

      {/* 2-Column Community Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Leaderboard & Mobile Blood Drives */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Mobile Blood Drives */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bus className="w-5 h-5 text-[#1a73e8]" />
                <h3 className="text-sm font-bold text-[#202124] uppercase tracking-wider">
                  Upcoming Mobile Blood Buses & Campus Drives
                </h3>
              </div>
              <span className="text-[11px] text-[#5f6368]">Open Community Camps</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {drives.map(drive => (
                <div
                  key={drive.id}
                  className="bg-white border border-[#dadce0] p-4 rounded-3xl shadow-[0_1px_3px_rgba(60,64,67,0.08)] space-y-2.5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-xs text-[#202124] leading-tight">{drive.title}</h4>
                      <span className="text-[9px] font-bold bg-[#e8f0fe] text-[#1a73e8] px-2 py-0.5 rounded-full shrink-0">
                        {drive.registeredDonors}/{drive.targetUnits} Units
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-[#5f6368] mt-1">
                      <MapPin className="w-3 h-3 text-[#70757a]" />
                      <span className="truncate">{drive.address}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-[#70757a] font-mono mt-1">
                      <span>📅 {drive.date}</span>
                      <span>⏰ {drive.time}</span>
                    </div>

                    <div className="mt-2 p-2 rounded-xl bg-[#f8fafd] border border-[#dadce0] text-[10px] text-[#1e8e3e] font-semibold">
                      🎁 {drive.incentive}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRsvpDrive(drive.id)}
                    className="w-full bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#202124] text-xs font-bold py-2 rounded-full border border-[#dadce0] transition-all flex items-center justify-center gap-1 mt-2"
                  >
                    <span>RSVP & Get Mobile Pass</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Leaderboard */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#fbbc04]" />
                <h3 className="text-sm font-bold text-[#202124] uppercase tracking-wider">
                  Top Voluntary Blood Donors
                </h3>
              </div>
              <span className="text-[11px] text-[#5f6368]">Ranked by verified units & reliability</span>
            </div>

            <div className="space-y-2.5">
              {leaderboard.map((donor, idx) => {
                const rank = idx + 1;
                return (
                  <div
                    key={donor.id}
                    className={`p-3.5 rounded-3xl border transition-all flex flex-wrap items-center justify-between gap-3 shadow-[0_1px_3px_rgba(60,64,67,0.08)] ${
                      rank === 1
                        ? 'bg-[#fef7e0]/40 border-[#feefc3]'
                        : 'bg-white border-[#dadce0] hover:border-[#bdc1c6]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center ${
                          rank === 1
                            ? 'bg-[#fbbc04] text-[#202124] shadow-sm'
                            : rank === 2
                            ? 'bg-[#dadce0] text-[#202124]'
                            : rank === 3
                            ? 'bg-[#f8d7da] text-[#721c24]'
                            : 'bg-[#f1f3f4] text-[#5f6368]'
                        }`}
                      >
                        #{rank}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-[#202124] text-xs">{donor.name}</h4>
                          <span className="text-[10px] font-mono font-bold bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf] px-1.5 py-0.2 rounded">
                            {donor.bloodType}
                          </span>
                          {donor.isVerified && (
                            <span className="text-[9px] font-medium text-[#137333] border border-[#ceead6] bg-[#e6f4ea] px-1.5 py-0.2 rounded-full">
                              Verified
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                          {(donor.badges || []).map(b => (
                            <span key={b} className="text-[9px] bg-[#f1f3f4] text-[#5f6368] px-2 py-0.2 rounded-full border border-[#dadce0]">
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-right">
                        <span className="font-bold text-[#202124] block">{donor.totalDonations || 0} Donations</span>
                        <span className="text-[10px] text-[#137333] font-medium">~{donor.estimatedLivesSaved || (donor.totalDonations * 3)} Lives Saved</span>
                      </div>

                      <div className="text-right pl-3 border-l border-[#dadce0]">
                        <span className="font-bold text-[#1a73e8] block">{donor.reliabilityScore || 95}%</span>
                        <span className="text-[10px] text-[#70757a]">Reliability</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Appointments & Quick Actions */}
        <div className="space-y-6">
          {/* Scheduled Appointments */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#ea4335]" />
                <h3 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
                  Upcoming Center Bookings
                </h3>
              </div>
            </div>

            <div className="bg-white border border-[#dadce0] p-4 rounded-3xl shadow-[0_1px_3px_rgba(60,64,67,0.08)] space-y-3">
              {appointments.length > 0 ? (
                appointments.slice(0, 3).map(apt => (
                  <div key={apt.id} className="bg-[#f8fafd] border border-[#dadce0] p-3 rounded-2xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#202124]">{apt.hospitalName}</span>
                      <span className="text-[9px] font-medium text-[#137333] bg-[#e6f4ea] border border-[#ceead6] px-2 py-0.2 rounded-full">
                        {apt.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5f6368]">{apt.donationType}</p>
                    <div className="flex items-center justify-between text-[10px] text-[#70757a] pt-1 border-t border-[#e8eaed]">
                      <span>📅 {apt.date}</span>
                      <span>⏰ {apt.timeSlot}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-[#70757a]">
                  No appointments booked yet.
                </div>
              )}

              <button
                onClick={onOpenAppointments}
                className="w-full bg-[#ea4335] hover:bg-[#d93025] text-white text-xs font-bold py-2.5 rounded-full shadow-sm transition-all"
              >
                + Schedule Hospital Donation
              </button>
            </div>
          </div>

          {/* Impact Stats Card */}
          <div className="bg-[#e8f0fe]/60 border border-[#d2e3fc] p-5 rounded-3xl space-y-3 shadow-sm">
            <h4 className="text-xs font-bold text-[#1a73e8] uppercase tracking-wider">Community Impact Goal</h4>
            <p className="text-xs text-[#3c4043] leading-relaxed">
              Every single whole blood donation can be fractionated into Red Blood Cells, Plasma, and Platelets — potentially saving up to **3 individual lives** in acute trauma situations.
            </p>
            <div className="pt-2 border-t border-[#d2e3fc] flex items-center justify-between text-xs font-medium">
              <span className="text-[#5f6368]">Universal O- Runway</span>
              <span className="text-[#137333] font-bold">Priority Monitored</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
