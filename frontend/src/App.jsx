import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { RadarMap } from './components/RadarMap';
import { DispatchSidebar } from './components/DispatchSidebar';
import { TelemetryOverlay } from './components/TelemetryOverlay';
import { DroneCockpitHUD } from './components/DroneCockpitHUD';
import { ClinicalMTPView } from './components/ClinicalMTPView';
import { PredictiveForecasterView } from './components/PredictiveForecasterView';
import { CommunityView } from './components/CommunityView';
import { DeliveryTrackerView } from './components/DeliveryTrackerView';
import { AlgorithmStudioView } from './components/AlgorithmStudioView';
import { AssessmentArenaView } from './components/AssessmentArenaView';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { EmergencyRequestModal } from './components/EmergencyRequestModal';
import { DonorAppointmentModal } from './components/DonorAppointmentModal';
import { DonorEligibilityModal } from './components/DonorEligibilityModal';
import { InterHospitalTransferModal } from './components/InterHospitalTransferModal';
import { RegisterDonorModal } from './components/RegisterDonorModal';
import { DigitalDonorPassModal } from './components/DigitalDonorPassModal';
import { DigitalCustodyModal } from './components/DigitalCustodyModal';
import { ToastNotification } from './components/ToastNotification';
import { playDispatchSonar, playArrivalChime, toggleSound } from './utils/audioAlerts';
import { resilientFetch } from './api/client';

export default function App() {
  // Navigation View Tab State (5 Modular Views)
  const [activeTab, setActiveTab] = useState('radar'); // radar | tracker | clinical | forecaster | community

  // Authentication State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('lifestream_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Live Geolocation State
  const [userLocation, setUserLocation] = useState(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const geoWatchIdRef = useRef(null);

  // Operational State
  const [recipientType, setRecipientType] = useState('O-');
  const [urgency, setUrgency] = useState('critical');
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState('HOSP-01');
  const [matches, setMatches] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [focusedDispatchId, setFocusedDispatchId] = useState(null);
  const [soundOn, setSoundOn] = useState(true);

  // Modal Visibility States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showEmergencyRequest, setShowEmergencyRequest] = useState(false);
  const [showAppointments, setShowAppointments] = useState(false);
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [showInterHospital, setShowInterHospital] = useState(false);
  const [showRegisterDonor, setShowRegisterDonor] = useState(false);
  const [showDonorPass, setShowDonorPass] = useState(false);
  const [selectedCustodyDispatch, setSelectedCustodyDispatch] = useState(null);
  const [showCockpitHUD, setShowCockpitHUD] = useState(true);

  const trackingIntervalRef = useRef(null);
  const acknowledgedArrivedRef = useRef(new Set());

  // Geolocation Tracker Toggle
  const toggleUserLocation = () => {
    if (isTrackingLocation) {
      if (geoWatchIdRef.current) navigator.geolocation.clearWatch(geoWatchIdRef.current);
      setIsTrackingLocation(false);
      setUserLocation(null);
      showToast('Live GPS tracking deactivated.', 'info');
    } else {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setUserLocation(coords);
            setIsTrackingLocation(true);
            showToast(`📍 GPS Locked: Lat ${coords.lat.toFixed(4)}, Lng ${coords.lng.toFixed(4)}`, 'success');
          },
          (err) => {
            console.warn(err);
            const coords = { lat: 37.7749, lng: -122.4194 };
            setUserLocation(coords);
            setIsTrackingLocation(true);
            showToast('GPS Radar anchored to San Francisco Trauma Grid.', 'info');
          }
        );

        geoWatchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
          () => {},
          { enableHighAccuracy: true, maximumAge: 5000 }
        );
      } else {
        showToast('Geolocation is not supported by your browser.', 'error');
      }
    }
  };

  // Fetch Hospitals list
  const fetchHospitals = useCallback(async () => {
    try {
      const data = await resilientFetch('/api/hospitals');
      if (Array.isArray(data) && data.length > 0) {
        setHospitals(data);
        if (!selectedHospitalId) {
          setSelectedHospitalId(data[0].id);
        }
      }
    } catch (e) {
      console.error('Error fetching hospitals:', e);
    }
  }, [selectedHospitalId]);

  // Fetch AI Matched Donors
  const fetchMatches = useCallback(async () => {
    try {
      const url = userLocation
        ? `/api/donors/matches/${recipientType}?urgency=${urgency}&lat=${userLocation.lat}&lng=${userLocation.lng}`
        : `/api/donors/matches/${recipientType}?urgency=${urgency}&hospitalId=${selectedHospitalId}`;
      const data = await resilientFetch(url);
      if (data && data.matches) {
        setMatches(data.matches);
      }
    } catch (e) {
      console.error('Error fetching matches:', e);
    }
  }, [recipientType, urgency, selectedHospitalId, userLocation]);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // Poll active telemetry for all dispatches
  const pollActiveTelemetry = useCallback(async () => {
    try {
      const allDispatches = await resilientFetch('/api/dispatch/track-all', {}, 1, 4000);
      if (Array.isArray(allDispatches)) {
        setDispatches(allDispatches);

        // Check if newly arrived
        allDispatches.forEach(disp => {
          if (disp.status === 'Arrived' && !acknowledgedArrivedRef.current.has(disp.id)) {
            acknowledgedArrivedRef.current.add(disp.id);
            playArrivalChime();
            showToast(`🎉 Rooftop Arrival: ${disp.transportType} delivered ${disp.donorBloodType} blood to ${disp.hospitalName}.`, 'success');
          }
        });
      }
    } catch (e) {
      console.error('Telemetry polling error:', e);
    }
  }, []);

  useEffect(() => {
    trackingIntervalRef.current = setInterval(pollActiveTelemetry, 1500);
    return () => {
      if (trackingIntervalRef.current) clearInterval(trackingIntervalRef.current);
    };
  }, [pollActiveTelemetry]);

  // Initiate Dispatch Mission
  const handleDispatch = async (donorId, transportType, componentType) => {
    try {
      playDispatchSonar();
      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorId,
          transportType,
          componentType,
          hospitalId: selectedHospitalId
        })
      });
      const newDisp = await res.json();
      setDispatches(prev => [newDisp, ...prev]);
      setFocusedDispatchId(newDisp.id);
      fetchMatches();
      showToast(`🚀 ${newDisp.transportType} ${newDisp.id} launched with SHA-256 seal.`, 'info');
    } catch (err) {
      console.error('Dispatch error:', err);
    }
  };

  // Launch MTP Multi-Drone Fleet
  const handleLaunchMTPBundle = async (prbcCount, ffpCount) => {
    try {
      playDispatchSonar();
      const donor = matches[0] || { id: 101 };
      await handleDispatch(donor.id, 'MTP Drone Fleet Vector 1', 'Packed Red Blood Cells (PRBC)');
      showToast(`⚡ STAT MTP 1:1:1 Resuscitation Fleet dispatched (${prbcCount} PRBC + ${ffpCount} FFP).`, 'success');
      setActiveTab('tracker');
    } catch (err) {
      console.error(err);
    }
  };

  // Hospital Intake Confirmation
  const handleConfirmReceipt = async (dispatchId, nurseName, badgeId) => {
    try {
      const res = await fetch(`/api/dispatch/${dispatchId}/confirm-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nurseName, badgeId })
      });
      const data = await res.json();
      pollActiveTelemetry();
      fetchHospitals();
      fetchMatches();
      showToast(`✓ Hospital intake logged by ${badgeId}. Blood inventory updated.`, 'success');
    } catch (err) {
      console.error('Receipt confirmation error:', err);
    }
  };

  const handleSoundToggle = () => {
    const next = toggleSound();
    setSoundOn(next);
    showToast(next ? 'Sound alerts enabled.' : 'Sound muted.', 'info');
  };

  const handleAuthSuccess = (authUser, token) => {
    setUser(authUser);
    showToast(`Welcome back, ${authUser.name}! Authenticated as ${authUser.role.toUpperCase()}.`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('lifestream_token');
    localStorage.removeItem('lifestream_user');
    setUser(null);
    setShowProfileModal(false);
    showToast('Signed out of LifeStream session.', 'info');
  };

  const activeInFlightCount = dispatches.filter(d => d.status === 'En Route').length;
  const currentHospital = hospitals.find(h => h.id === selectedHospitalId) || hospitals[0] || { name: 'SF General Trauma Center', lat: 37.7749, lng: -122.4194 };
  const currentFocusedDispatch = dispatches.find(d => d.id === focusedDispatchId) || dispatches.find(d => d.status === 'En Route') || dispatches[0];

  return (
    <div className="relative w-full h-screen overflow-x-hidden select-none bg-[#f8fafd] font-sans text-[#202124]">
      {/* Toast Alert */}
      <ToastNotification toast={toast} onDismiss={() => setToast(null)} />

      {/* Clean, Lightweight Modular Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenEmergencyRequest={() => setShowEmergencyRequest(true)}
        onOpenAdmin={() => setShowAdminModal(true)}
        onOpenDonorPass={() => setShowDonorPass(true)}
        onToggleSound={handleSoundToggle}
        soundOn={soundOn}
        activeDispatchCount={activeInFlightCount}
        isTrackingUserLocation={isTrackingLocation}
        onToggleUserLocation={toggleUserLocation}
      />

      {/* VIEW 1: RADAR & DISPATCH (Clean Full Map with Collapsible Controls & Drone Cockpit HUD) */}
      {activeTab === 'radar' && (
        <div className="relative w-full h-full">
          <RadarMap
            hospitals={hospitals}
            selectedHospitalId={selectedHospitalId}
            onSelectHospital={setSelectedHospitalId}
            matches={matches}
            activeDispatches={dispatches}
            focusedDispatchId={focusedDispatchId}
            userLocation={userLocation}
          />

          <DispatchSidebar
            hospitals={hospitals}
            selectedHospitalId={selectedHospitalId}
            onSelectHospital={setSelectedHospitalId}
            recipientType={recipientType}
            setRecipientType={setRecipientType}
            urgency={urgency}
            setUrgency={setUrgency}
            matches={matches}
            activeDispatches={dispatches}
            onDispatch={handleDispatch}
            onOpenInterHospital={() => setShowInterHospital(true)}
            onOpenEmergencyRequest={() => setShowEmergencyRequest(true)}
            onOpenMatrix={() => setActiveTab('clinical')}
          />

          <TelemetryOverlay
            dispatches={dispatches}
            focusedDispatchId={focusedDispatchId}
            onFocusDispatch={setFocusedDispatchId}
            onConfirmReceipt={handleConfirmReceipt}
          />

          {/* Real-Time Drone Flight Cockpit HUD */}
          {showCockpitHUD && currentFocusedDispatch && currentFocusedDispatch.status === 'En Route' && (
            <DroneCockpitHUD
              dispatch={currentFocusedDispatch}
              onClose={() => setShowCockpitHUD(false)}
              onActionFeedback={(msg) => showToast(msg, 'info')}
            />
          )}
        </div>
      )}

      {/* VIEW 2: DELIVERY TRACKER & CUSTODY */}
      {activeTab === 'tracker' && (
        <DeliveryTrackerView
          activeDispatches={dispatches}
          onOpenEmergencyRequest={() => setShowEmergencyRequest(true)}
          onOpenCustodyModal={(disp) => setSelectedCustodyDispatch(disp)}
        />
      )}

      {/* VIEW 3: CLINICAL MTP RESUSCITATION & COMPONENT RESERVES */}
      {activeTab === 'clinical' && (
        <ClinicalMTPView
          hospitals={hospitals}
          onOpenInterHospital={() => setShowInterHospital(true)}
          onOpenEmergencyRequest={() => setShowEmergencyRequest(true)}
          onLaunchMTPBundle={handleLaunchMTPBundle}
        />
      )}

      {/* VIEW 4: AI PREDICTIVE REGIONAL SHORTAGE FORECASTER */}
      {activeTab === 'forecaster' && (
        <PredictiveForecasterView
          hospitals={hospitals}
          onOpenInterHospital={() => setShowInterHospital(true)}
        />
      )}

      {/* VIEW 5: ALGORITHM STUDIO & VISUAL STATE TRACER */}
      {activeTab === 'studio' && (
        <AlgorithmStudioView />
      )}

      {/* VIEW 6: PROCTORED CLINICAL & LOGISTICS ARENA */}
      {activeTab === 'arena' && (
        <AssessmentArenaView user={user} />
      )}

      {/* VIEW 6: HERO COMMUNITY & REGIONAL BLOOD DRIVES */}
      {activeTab === 'community' && (
        <CommunityView
          user={user}
          hospitals={hospitals}
          onOpenAppointments={() => setShowAppointments(true)}
          onOpenEligibility={() => setShowEligibilityModal(true)}
          onOpenDonorPass={() => setShowDonorPass(true)}
        />
      )}

      {/* AUTH MODAL */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* PROFILE MODAL */}
      {showProfileModal && (
        <UserProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          onLogout={handleLogout}
          onProfileUpdated={(updated) => {
            setUser(updated);
            showToast('Profile updated successfully.', 'success');
          }}
        />
      )}

      {/* EMERGENCY REQUEST MODAL */}
      {showEmergencyRequest && (
        <EmergencyRequestModal
          onClose={() => setShowEmergencyRequest(false)}
          hospitals={hospitals}
          onDispatchMission={(donorId, transportType) => handleDispatch(donorId, transportType)}
          onRequestCreated={(ticket) => {
            fetchMatches();
            pollActiveTelemetry();
            setActiveTab('tracker');
            showToast(`STAT Emergency Request ${ticket.request.id} broadcasted. Delivery tracker opened.`, 'info');
          }}
        />
      )}

      {/* DIGITAL DONOR WALLET PASS MODAL */}
      {showDonorPass && (
        <DigitalDonorPassModal
          user={user}
          onClose={() => setShowDonorPass(false)}
        />
      )}

      {/* DIGITAL PROOF-OF-CUSTODY AUDIT MODAL */}
      {selectedCustodyDispatch && (
        <DigitalCustodyModal
          dispatch={selectedCustodyDispatch}
          onClose={() => setSelectedCustodyDispatch(null)}
        />
      )}

      {/* APPOINTMENT MODAL */}
      {showAppointments && (
        <DonorAppointmentModal
          user={user}
          hospitals={hospitals}
          onClose={() => setShowAppointments(false)}
          onAppointmentBooked={() => {
            showToast('Blood donation appointment successfully booked.', 'success');
          }}
        />
      )}

      {/* 5-POINT HEALTH SCREENING MODAL */}
      {showEligibilityModal && (
        <DonorEligibilityModal
          onClose={() => setShowEligibilityModal(false)}
          onClearedForRegistration={() => setShowRegisterDonor(true)}
        />
      )}

      {/* REGISTER DONOR MODAL */}
      {showRegisterDonor && (
        <RegisterDonorModal
          onClose={() => setShowRegisterDonor(false)}
          onRegistered={() => {
            fetchMatches();
            fetchHospitals();
            showToast('New emergency donor registered in the network.', 'success');
          }}
        />
      )}

      {/* INTER-HOSPITAL DRONE TRANSFER MODAL */}
      {showInterHospital && (
        <InterHospitalTransferModal
          onClose={() => setShowInterHospital(false)}
          currentHospital={currentHospital}
          onTransferInitiated={(newDisp) => {
            setDispatches(prev => [newDisp, ...prev]);
            setFocusedDispatchId(newDisp.id);
            fetchHospitals();
            setActiveTab('radar');
            showToast(`Inter-hospital drone transfer ${newDisp.id} launched.`, 'info');
          }}
        />
      )}

      {/* ROOT ADMIN COMMAND MODAL */}
      {showAdminModal && (
        <AdminPortalModal
          onClose={() => setShowAdminModal(false)}
          onDataChange={() => {
            fetchMatches();
            fetchHospitals();
            pollActiveTelemetry();
          }}
        />
      )}
    </div>
  );
}
