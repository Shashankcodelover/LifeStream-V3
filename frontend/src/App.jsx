import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { RadarMap } from './components/RadarMap';
import { DispatchSidebar } from './components/DispatchSidebar';
import { TelemetryOverlay } from './components/TelemetryOverlay';
import { HospitalInventoryModal } from './components/HospitalInventoryModal';
import { RegisterDonorModal } from './components/RegisterDonorModal';
import { LegalModal } from './components/LegalModal';
import { MissionModal } from './components/MissionModal';
import { AlertCircle, Shield } from 'lucide-react';

const DEFAULT_HOSPITAL = { id: 'HOSP-01', name: 'SF General Emergency Hospital', lat: 37.7749, lng: -122.4194 };

export default function App() {
  const [recipientType, setRecipientType] = useState('O-');
  const [urgency, setUrgency] = useState('critical');
  const [hospital, setHospital] = useState(DEFAULT_HOSPITAL);
  const [matches, setMatches] = useState([]);
  const [activeDispatch, setActiveDispatch] = useState(null);
  const [completedMission, setCompletedMission] = useState(null);

  const [showInventory, setShowInventory] = useState(false);
  const [showRegisterDonor, setShowRegisterDonor] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [legalTab, setLegalTab] = useState('privacy');
  const [errorToast, setErrorToast] = useState('');

  const trackingIntervalRef = useRef(null);

  // Fetch matched donors from API
  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch(`/api/donors/matches/${recipientType}?urgency=${urgency}`);
      if (!res.ok) throw new Error('Failed to retrieve donor coordinates');
      const data = await res.json();
      if (data.hospital) setHospital(data.hospital);
      if (Array.isArray(data.matches)) setMatches(data.matches);
    } catch (err) {
      setErrorToast('Registry synchronization error. Operating on cached telemetry.');
      setTimeout(() => setErrorToast(''), 4000);
    }
  }, [recipientType, urgency]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // Initiate Dispatch Mission
  const handleDispatch = async (donorId, transportType) => {
    if (activeDispatch) {
      setErrorToast('A transport mission is already active.');
      setTimeout(() => setErrorToast(''), 3000);
      return;
    }

    try {
      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donorId, transportType, hospitalId: hospital.id })
      });
      if (!res.ok) throw new Error('Dispatch command could not be initiated.');
      const data = await res.json();
      setActiveDispatch(data);
      startTelemetryTracking(data.id);
    } catch (err) {
      setErrorToast(err.message || 'Dispatch deployment failed.');
      setTimeout(() => setErrorToast(''), 4000);
    }
  };

  // Start real-time telemetry polling
  const startTelemetryTracking = (dispatchId) => {
    if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);

    trackingIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/dispatch/track/${dispatchId}`);
        if (!res.ok) return;
        const data = await res.json();
        setActiveDispatch(data);

        if (data.status === 'Arrived') {
          clearInterval(trackingIntervalRef.current);
          setTimeout(() => {
            setCompletedMission(data);
            setActiveDispatch(null);
            fetchMatches();
          }, 800);
        }
      } catch {
        // silent polling error resilience
      }
    }, 1500); // 1.5s live polling interval
  };

  // Cleanup telemetry interval on unmount
  useEffect(() => {
    return () => {
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
    };
  }, []);

  const handleOpenLegal = (tab = 'privacy') => {
    setLegalTab(tab);
    setShowLegal(true);
  };

  const handleResetView = () => {
    setRecipientType('O-');
    setUrgency('critical');
    fetchMatches();
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0b0f19] text-slate-100 font-sans">
      {/* Navbar Header */}
      <Navbar
        onOpenInventory={() => setShowInventory(true)}
        onOpenRegisterDonor={() => setShowRegisterDonor(true)}
        onOpenLegal={() => handleOpenLegal('privacy')}
        onLogoClick={handleResetView}
        activeDispatchCount={activeDispatch ? 1 : 0}
      />

      {/* Interactive Radar Leaflet Map */}
      <main className="w-full h-full">
        <RadarMap
          hospitalCoord={[hospital.lat, hospital.lng]}
          matches={matches}
          activeDispatch={activeDispatch}
        />
      </main>

      {/* AI Dispatch Sidebar */}
      <DispatchSidebar
        recipientType={recipientType}
        setRecipientType={setRecipientType}
        urgency={urgency}
        setUrgency={setUrgency}
        matches={matches}
        activeDispatch={activeDispatch}
        onDispatch={handleDispatch}
      />

      {/* Live Telemetry Overlay */}
      <TelemetryOverlay dispatch={activeDispatch} />

      {/* Error / Alert Toast */}
      {errorToast && (
        <div className="fixed top-20 right-6 z-50 bg-red-950/90 border border-red-500/50 text-red-200 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs backdrop-blur-md animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Bottom Compliance & Status Footer Dock */}
      <footer className="fixed bottom-0 right-0 z-10 px-4 py-1.5 hidden md:flex items-center gap-3 bg-slate-950/80 backdrop-blur-sm border-t border-l border-slate-800 rounded-tl-xl text-[11px] text-slate-400">
        <span>&copy; {new Date().getFullYear()} LifeStream V3.1</span>
        <span>•</span>
        <button onClick={() => handleOpenLegal('privacy')} className="hover:text-slate-200 underline-offset-2 hover:underline">
          Privacy Policy
        </button>
        <span>•</span>
        <button onClick={() => handleOpenLegal('terms')} className="hover:text-slate-200 underline-offset-2 hover:underline">
          Terms of Service
        </button>
        <span>•</span>
        <span className="flex items-center gap-1 text-slate-400">
          <Shield className="w-3 h-3 text-cyan-400" />
          HIPAA &amp; FAA Part 107 Compliant
        </span>
      </footer>

      {/* Modals */}
      {showInventory && <HospitalInventoryModal onClose={() => setShowInventory(false)} />}
      {showRegisterDonor && (
        <RegisterDonorModal
          onClose={() => setShowRegisterDonor(false)}
          onRegistered={fetchMatches}
          onOpenLegal={() => handleOpenLegal('terms')}
        />
      )}
      {showLegal && <LegalModal initialTab={legalTab} onClose={() => setShowLegal(false)} />}
      {completedMission && <MissionModal mission={completedMission} onClose={() => setCompletedMission(null)} />}
    </div>
  );
}
