import React from 'react';
import {
  Activity, Radio, Siren, Droplet, Trophy, Package,
  Compass, MapPin, Volume2, VolumeX, LogIn, User, Hospital, ShieldAlert,
  ChevronDown, HeartPulse, Sparkles, TrendingUp, QrCode
} from 'lucide-react';

export function Navbar({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onOpenProfile,
  onOpenEmergencyRequest,
  onOpenAdmin,
  onOpenDonorPass,
  onToggleSound,
  soundOn = true,
  activeDispatchCount = 0,
  isTrackingUserLocation = false,
  onToggleUserLocation
}) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-6 h-16 flex items-center justify-between bg-white/95 backdrop-blur-md border-b border-[#dadce0] shadow-[0_1px_3px_rgba(60,64,67,0.08)]">
      {/* Brand & Google Health Standard Logo */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => setActiveTab('radar')}
          className="cursor-pointer flex items-center gap-2.5 group"
        >
          {/* Google 4-color accent logo badge */}
          <div className="relative w-8 h-8 rounded-full bg-white border border-[#dadce0] flex items-center justify-center shadow-sm group-hover:shadow transition-shadow">
            <div className="w-4 h-4 rounded-full flex items-center justify-center relative">
              <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-[#4285F4] rounded-full" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#EA4335] rounded-full" />
              <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-[#34A853] rounded-full" />
              <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#FBBC05] rounded-full" />
              <Droplet className="w-3 h-3 text-[#EA4335] z-10 fill-[#EA4335]" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-[#202124] tracking-tight">
                <span className="font-medium text-[#5f6368]">Google</span> Health <span className="text-[#1a73e8]">LifeStream</span>
              </span>
              <span className="text-[10px] font-medium bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] px-2 py-0.5 rounded-full">
                V5.0 Enterprise
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-[#5f6368]">
              <span className="w-2 h-2 rounded-full bg-[#34a853] animate-pulse" />
              <span>Real-Time Autonomous Trauma Dispatch</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modular 5-Tab Material 3 Navigation Switcher */}
      <nav className="hidden lg:flex items-center gap-1 bg-[#f1f3f4] p-1 rounded-full border border-[#dadce0]">
        <button
          onClick={() => setActiveTab('radar')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeTab === 'radar'
              ? 'bg-white text-[#1a73e8] shadow-sm font-bold'
              : 'text-[#5f6368] hover:text-[#202124] hover:bg-white/60'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Live Radar</span>
        </button>

        <button
          onClick={() => setActiveTab('tracker')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all relative ${
            activeTab === 'tracker'
              ? 'bg-white text-[#1a73e8] shadow-sm font-bold'
              : 'text-[#5f6368] hover:text-[#202124] hover:bg-white/60'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-[#1a73e8]" />
          <span>Deliveries</span>
          {activeDispatchCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#1a73e8] animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('clinical')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeTab === 'clinical'
              ? 'bg-white text-[#ea4335] shadow-sm font-bold'
              : 'text-[#5f6368] hover:text-[#202124] hover:bg-white/60'
          }`}
        >
          <HeartPulse className="w-3.5 h-3.5 text-[#ea4335]" />
          <span>Clinical MTP</span>
        </button>

        <button
          onClick={() => setActiveTab('forecaster')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeTab === 'forecaster'
              ? 'bg-white text-[#1a73e8] shadow-sm font-bold'
              : 'text-[#5f6368] hover:text-[#202124] hover:bg-white/60'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-[#1a73e8]" />
          <span>AI Forecaster</span>
        </button>

        <button
          onClick={() => setActiveTab('community')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeTab === 'community'
              ? 'bg-white text-[#1a73e8] shadow-sm font-bold'
              : 'text-[#5f6368] hover:text-[#202124] hover:bg-white/60'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-[#fbbc04]" />
          <span>Community</span>
        </button>
      </nav>

      {/* Action Controls & Google Account */}
      <div className="flex items-center gap-2">
        {/* Digital Wallet Pass Button */}
        <button
          onClick={onOpenDonorPass}
          title="Open Google Wallet / Apple Wallet Digital Hero Pass"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#f8fafd] text-[#1a73e8] border border-[#dadce0] hover:bg-[#e8f0fe] transition-all"
        >
          <QrCode className="w-3.5 h-3.5 text-[#1a73e8]" />
          <span>Wallet Pass</span>
        </button>

        {/* Live GPS Locator Button */}
        <button
          onClick={onToggleUserLocation}
          title="Track your real-time physical GPS location on the radar"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            isTrackingUserLocation
              ? 'bg-[#e8f0fe] text-[#1a73e8] border-[#1a73e8] shadow-sm font-bold'
              : 'bg-white text-[#5f6368] border-[#dadce0] hover:text-[#202124] hover:bg-[#f8fafd]'
          }`}
        >
          <MapPin className={`w-3.5 h-3.5 ${isTrackingUserLocation ? 'text-[#1a73e8]' : 'text-[#5f6368]'}`} />
          <span className="hidden sm:inline">{isTrackingUserLocation ? 'GPS Locked' : 'Locate Me'}</span>
        </button>

        {/* Google Red STAT Emergency Button */}
        <button
          onClick={onOpenEmergencyRequest}
          className="flex items-center gap-1.5 bg-[#ea4335] hover:bg-[#d93025] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <Siren className="w-3.5 h-3.5 animate-pulse" />
          <span>STAT SOS</span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          title={soundOn ? 'Sound Alerts Active' : 'Sound Muted'}
          className="p-2 rounded-full text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] transition-all"
        >
          {soundOn ? <Volume2 className="w-4 h-4 text-[#34a853]" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Admin Console Toggle */}
        <button
          onClick={onOpenAdmin}
          title="Open Admin Command Suite"
          className="p-2 rounded-full text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] transition-all hidden xl:flex"
        >
          <ShieldAlert className="w-4 h-4 text-[#fbbc04]" />
        </button>

        {/* User Profile Pill OR Sign In */}
        {user ? (
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 bg-white border border-[#dadce0] hover:border-[#bdc1c6] px-2.5 py-1 rounded-full text-xs font-medium text-[#202124] transition-all shadow-sm"
          >
            <div className="w-6 h-6 rounded-full bg-[#1a73e8] text-white text-[11px] font-bold flex items-center justify-center">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="max-w-[100px] truncate hidden sm:inline font-medium">{user.name}</span>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}
