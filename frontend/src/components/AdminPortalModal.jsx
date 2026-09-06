import React, { useState, useEffect, useCallback } from 'react';
import {
  X, ShieldAlert, Users, Hospital, Radio, AlertTriangle, CheckCircle,
  XCircle, Trash2, Plus, RefreshCw, BarChart3, ArrowUpRight, Flame,
  Battery, Thermometer, MapPin, Search, Filter, ShieldCheck, HeartPulse
} from 'lucide-react';
import { resilientFetch } from '../api/client';

const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export function AdminPortalModal({ onClose, onDataChange }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview | donors | hospitals | dispatches | alerts
  const [stats, setStats] = useState(null);
  const [donors, setDonors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states for donors
  const [donorSearch, setDonorSearch] = useState('');
  const [donorBloodFilter, setDonorBloodFilter] = useState('');
  const [donorVerifiedFilter, setDonorVerifiedFilter] = useState('');

  // Add Donor form
  const [showAddDonor, setShowAddDonor] = useState(false);
  const [newDonor, setNewDonor] = useState({
    name: '',
    bloodType: 'O-',
    phone: '',
    reliabilityScore: 95,
    isVerified: true
  });

  // Add Hospital form
  const [showAddHospital, setShowAddHospital] = useState(false);
  const [newHospital, setNewHospital] = useState({
    name: '',
    lat: 37.7749,
    lng: -122.4194
  });

  // Create Alert form
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    hospitalId: 'HOSP-01',
    bloodType: 'O-',
    urgency: 'critical',
    message: ''
  });

  // Fetch all admin data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, donorsRes, hospitalsRes, dispatchesRes, alertsRes] = await Promise.all([
        resilientFetch('/api/admin/stats'),
        resilientFetch(`/api/admin/donors?search=${encodeURIComponent(donorSearch)}&bloodType=${donorBloodFilter}&verified=${donorVerifiedFilter}`),
        resilientFetch('/api/admin/hospitals'),
        resilientFetch('/api/admin/dispatches'),
        resilientFetch('/api/admin/alerts')
      ]);

      setStats(statsRes);
      setDonors(donorsRes || []);
      setHospitals(hospitalsRes || []);
      setDispatches(dispatchesRes || []);
      setAlerts(alertsRes || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  }, [donorSearch, donorBloodFilter, donorVerifiedFilter]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Donor Actions
  const toggleDonorVerification = async (id, currentStatus) => {
    try {
      await resilientFetch(`/api/admin/donors/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isVerified: !currentStatus })
      });
      fetchAllData();
      if (onDataChange) onDataChange();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteDonor = async (id) => {
    if (!confirm('Are you sure you want to remove this donor from the dispatch registry?')) return;
    try {
      await resilientFetch(`/api/admin/donors/${id}`, { method: 'DELETE' });
      fetchAllData();
      if (onDataChange) onDataChange();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateDonor = async (e) => {
    e.preventDefault();
    if (!newDonor.name) return;
    try {
      await resilientFetch('/api/admin/donors', {
        method: 'POST',
        body: JSON.stringify(newDonor)
      });
      setShowAddDonor(false);
      setNewDonor({ name: '', bloodType: 'O-', phone: '', reliabilityScore: 95, isVerified: true });
      fetchAllData();
      if (onDataChange) onDataChange();
    } catch (e) {
      console.error(e);
    }
  };

  // Hospital Inventory Actions
  const adjustHospitalInventory = async (hospitalId, bloodType, delta) => {
    try {
      await resilientFetch(`/api/admin/hospitals/${hospitalId}/inventory`, {
        method: 'PATCH',
        body: JSON.stringify({ bloodType, delta })
      });
      fetchAllData();
      if (onDataChange) onDataChange();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateHospital = async (e) => {
    e.preventDefault();
    if (!newHospital.name) return;
    try {
      await resilientFetch('/api/admin/hospitals', {
        method: 'POST',
        body: JSON.stringify(newHospital)
      });
      setShowAddHospital(false);
      setNewHospital({ name: '', lat: 37.7749, lng: -122.4194 });
      fetchAllData();
      if (onDataChange) onDataChange();
    } catch (e) {
      console.error(e);
    }
  };

  // Dispatch Actions
  const updateDispatchStatus = async (id, status) => {
    try {
      await resilientFetch(`/api/admin/dispatches/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      fetchAllData();
      if (onDataChange) onDataChange();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteDispatch = async (id) => {
    try {
      await resilientFetch(`/api/admin/dispatches/${id}`, { method: 'DELETE' });
      fetchAllData();
      if (onDataChange) onDataChange();
    } catch (e) {
      console.error(e);
    }
  };

  // Alert Actions
  const handleCreateAlert = async (e) => {
    e.preventDefault();
    if (!newAlert.message) return;
    try {
      await resilientFetch('/api/admin/alerts', {
        method: 'POST',
        body: JSON.stringify(newAlert)
      });
      setShowAddAlert(false);
      setNewAlert({ hospitalId: 'HOSP-01', bloodType: 'O-', urgency: 'critical', message: '' });
      fetchAllData();
      if (onDataChange) onDataChange();
    } catch (e) {
      console.error(e);
    }
  };

  const dismissAlert = async (id) => {
    try {
      await resilientFetch(`/api/admin/alerts/${id}`, { method: 'DELETE' });
      fetchAllData();
      if (onDataChange) onDataChange();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-5xl h-[88vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-rose-600/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">LifeStream Administrator Command Suite</h3>
                <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                  ROOT ACCESS
                </span>
              </div>
              <p className="text-xs text-slate-500">Network control, hospital reserves, donor authentication & cold-chain audit</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAllData}
              title="Refresh Data"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-slate-200 bg-white text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'overview'
                ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Overview & KPIs</span>
          </button>

          <button
            onClick={() => setActiveTab('donors')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'donors'
                ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Donors ({donors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('hospitals')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'hospitals'
                ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Hospital className="w-4 h-4" />
            <span>Hospital Blood Banks ({hospitals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('dispatches')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'dispatches'
                ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Dispatch Telemetry ({dispatches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'alerts'
                ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Emergency Alerts ({alerts.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              {/* Top Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm">
                  <span className="text-[11px] text-slate-500 font-medium block">Total Donors</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-slate-900">{stats.totalDonors}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Active</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm">
                  <span className="text-[11px] text-slate-500 font-medium block">Verified Network</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-emerald-600">{stats.verifiedPercentage}%</span>
                    <span className="text-[10px] text-slate-400">({stats.verifiedDonors})</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm">
                  <span className="text-[11px] text-slate-500 font-medium block">Trauma Centers</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-slate-900">{stats.totalHospitals}</span>
                    <span className="text-[10px] text-rose-600 font-semibold">SF Bay</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm">
                  <span className="text-[11px] text-slate-500 font-medium block">Active Drones</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-rose-600">{stats.activeDispatches}</span>
                    <span className="text-[10px] text-amber-600 font-semibold">In-Flight</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm">
                  <span className="text-[11px] text-slate-500 font-medium block">Total Reserve</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-sky-600">{stats.totalReserveUnits}</span>
                    <span className="text-[10px] text-slate-400">units</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm">
                  <span className="text-[11px] text-slate-500 font-medium block">Avg Reliability</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-sky-600">{stats.avgReliability}</span>
                    <span className="text-[10px] text-sky-600 font-semibold">/100</span>
                  </div>
                </div>
              </div>

              {/* Regional Blood Bank Reserve Distribution */}
              <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Regional Blood Bank Reserve Aggregate</h4>
                    <p className="text-xs text-slate-500">Total units available across all registered medical trauma centers</p>
                  </div>
                  <span className="text-xs font-mono bg-rose-50 text-rose-600 border border-rose-200 px-2.5 py-1 rounded-xl font-bold">
                    {stats.totalReserveUnits} Total Units
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                  {Object.entries(stats.aggregateInventory).map(([type, units]) => {
                    const isUniversal = type === 'O-';
                    const isCritical = units <= 2;
                    return (
                      <div
                        key={type}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isCritical
                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                            : 'bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-bold text-xs">{type}</span>
                          {isUniversal && <span className="text-[9px] bg-rose-600 text-white px-1 rounded font-bold">UNIV</span>}
                        </div>
                        <span className="text-xl font-bold font-mono block mt-1">{units}</span>
                        <span className="text-[10px] text-slate-400 block">units in bank</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions & Shortage Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Live Emergency Shortage Broadcasts</h4>
                  {alerts.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4">No active blood shortage broadcasts currently active.</p>
                  ) : (
                    <div className="space-y-2">
                      {alerts.map(a => (
                        <div key={a.id} className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-rose-600">[{a.bloodType}]</span>
                              <span className="text-xs font-semibold text-slate-900">{a.message}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 block mt-1">Center: {a.hospitalId} • {new Date(a.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <button
                            onClick={() => dismissAlert(a.id)}
                            className="text-[10px] text-rose-700 hover:text-white bg-white hover:bg-rose-600 px-2 py-1 rounded border border-rose-300 transition-all font-semibold"
                          >
                            Resolve
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Recent Dispatch Vectors</h4>
                  {dispatches.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4">No dispatch missions recorded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {dispatches.slice(0, 3).map(d => (
                        <div key={d.id} className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{d.id}</span>
                              <span className="text-[10px] font-mono bg-white border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{d.transportType}</span>
                            </div>
                            <p className="text-[11px] text-slate-600 mt-0.5">{d.donorName} ({d.donorBloodType}) → {d.hospitalName}</p>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            d.status === 'En Route'
                              ? 'bg-amber-50 border-amber-200 text-amber-700'
                              : d.status === 'Arrived'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}>
                            {d.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DONOR MANAGEMENT */}
          {activeTab === 'donors' && (
            <div className="space-y-4">
              {/* Action bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 outline-none focus:border-rose-500 transition-all"
                      placeholder="Search donor name or phone..."
                      value={donorSearch}
                      onChange={e => setDonorSearch(e.target.value)}
                    />
                  </div>

                  <select
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                    value={donorBloodFilter}
                    onChange={e => setDonorBloodFilter(e.target.value)}
                  >
                    <option value="">All Blood Types</option>
                    {BLOOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>

                  <select
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none"
                    value={donorVerifiedFilter}
                    onChange={e => setDonorVerifiedFilter(e.target.value)}
                  >
                    <option value="">All Verification</option>
                    <option value="true">Verified Only</option>
                    <option value="false">Unverified Only</option>
                  </select>
                </div>

                <button
                  onClick={() => setShowAddDonor(!showAddDonor)}
                  className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Donor</span>
                </button>
              </div>

              {/* Add Donor Form Drawer */}
              {showAddDonor && (
                <form onSubmit={handleCreateDonor} className="bg-white border border-rose-300 p-4 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Full Name</label>
                    <input
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                      placeholder="e.g. Rachel Adams"
                      value={newDonor.name}
                      onChange={e => setNewDonor(d => ({ ...d, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Blood Type</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                      value={newDonor.bloodType}
                      onChange={e => setNewDonor(d => ({ ...d, bloodType: e.target.value }))}
                    >
                      {BLOOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Phone</label>
                    <input
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                      placeholder="+1 415-555-0100"
                      value={newDonor.phone}
                      onChange={e => setNewDonor(d => ({ ...d, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Reliability Score</label>
                    <input
                      type="number"
                      min="50"
                      max="100"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                      value={newDonor.reliabilityScore}
                      onChange={e => setNewDonor(d => ({ ...d, reliabilityScore: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg transition-all"
                    >
                      Save Donor
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddDonor(false)}
                      className="px-2.5 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Donors Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Donor Name</th>
                        <th className="px-4 py-3">Blood Type</th>
                        <th className="px-4 py-3">Contact</th>
                        <th className="px-4 py-3">Reliability</th>
                        <th className="px-4 py-3">Donations</th>
                        <th className="px-4 py-3">Verification</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {donors.map(donor => (
                        <tr key={donor.id} className="hover:bg-slate-50/80 transition-all">
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            <div className="flex items-center gap-2">
                              <span>{donor.name}</span>
                              {donor.bloodType === 'O-' && (
                                <span className="text-[9px] bg-rose-50 text-rose-600 border border-rose-200 px-1.5 py-0.2 rounded font-mono font-bold">
                                  Universal
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-rose-600">{donor.bloodType}</td>
                          <td className="px-4 py-3 text-slate-500 font-mono">{donor.phone || 'N/A'}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sky-600">{donor.reliabilityScore || 90}%</span>
                              <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-sky-500 rounded-full"
                                  style={{ width: `${donor.reliabilityScore || 90}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono">{donor.totalDonations || 0} units</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => toggleDonorVerification(donor.id, donor.isVerified)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
                                donor.isVerified
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                                  : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                              }`}
                            >
                              {donor.isVerified ? (
                                <>
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  <span>Verified</span>
                                </>
                              ) : (
                                <>
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  <span>Pending</span>
                                </>
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => deleteDonor(donor.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                              title="Delete Donor"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HOSPITAL BLOOD BANKS & INVENTORY */}
          {activeTab === 'hospitals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Trauma Center Reserve Management</h4>
                  <p className="text-[11px] text-slate-500">Inline adjust inventory levels for emergency stock matching</p>
                </div>
                <button
                  onClick={() => setShowAddHospital(!showAddHospital)}
                  className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Medical Center</span>
                </button>
              </div>

              {/* Add Hospital Form */}
              {showAddHospital && (
                <form onSubmit={handleCreateHospital} className="bg-white border border-rose-300 p-4 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Center Name</label>
                    <input
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                      placeholder="e.g. Kaiser Permanente SF"
                      value={newHospital.name}
                      onChange={e => setNewHospital(h => ({ ...h, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Latitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                      value={newHospital.lat}
                      onChange={e => setNewHospital(h => ({ ...h, lat: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Longitude</label>
                    <input
                      type="number"
                      step="0.0001"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                      value={newHospital.lng}
                      onChange={e => setNewHospital(h => ({ ...h, lng: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg transition-all"
                    >
                      Save Hospital
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddHospital(false)}
                      className="px-2.5 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Hospital Cards with +/- buttons */}
              <div className="space-y-4">
                {hospitals.map(h => (
                  <div key={h.id} className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <Hospital className="w-4 h-4 text-rose-600" />
                          <h4 className="font-bold text-sm text-slate-900">{h.name}</h4>
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{h.id}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">GPS: [{h.lat}, {h.lng}]</p>
                      </div>

                      <span className="text-xs font-bold text-slate-700">
                        Total Stock: {Object.values(h.inventory || {}).reduce((a, b) => a + b, 0)} Units
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
                      {BLOOD_TYPES.map(type => {
                        const units = (h.inventory && h.inventory[type]) || 0;
                        const isLow = units <= 1;
                        return (
                          <div
                            key={type}
                            className={`p-2.5 rounded-2xl border text-center ${
                              isLow
                                ? 'bg-rose-50 border-rose-200 text-rose-700'
                                : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                          >
                            <span className="text-[10px] block font-bold text-slate-400 mb-1">{type}</span>
                            <span className="text-base font-bold font-mono block my-0.5">{units} u</span>
                            <div className="flex items-center justify-center gap-1 mt-1.5">
                              <button
                                onClick={() => adjustHospitalInventory(h.id, type, -1)}
                                className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold flex items-center justify-center text-xs transition-all"
                              >
                                -
                              </button>
                              <button
                                onClick={() => adjustHospitalInventory(h.id, type, 1)}
                                className="w-6 h-6 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center justify-center text-xs transition-all shadow-sm"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DISPATCH TELEMETRY AUDIT */}
          {activeTab === 'dispatches' && (
            <div className="space-y-4">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                <h4 className="text-xs font-bold text-slate-900">Cold-Chain Drone & Ground Transport Mission Log</h4>
                <p className="text-[11px] text-slate-500">Live vector state, battery telemetry, and temperature compliance</p>
              </div>

              {dispatches.length === 0 ? (
                <div className="bg-white border border-slate-200 p-12 text-center rounded-3xl text-slate-500 text-sm shadow-sm">
                  No active or past dispatch sessions recorded yet. Launch a dispatch from the main radar map.
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3">Mission ID</th>
                          <th className="px-4 py-3">Transport</th>
                          <th className="px-4 py-3">Route (Donor → Hospital)</th>
                          <th className="px-4 py-3">Cold-Chain Temp</th>
                          <th className="px-4 py-3">Battery</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dispatches.map(disp => (
                          <tr key={disp.id} className="hover:bg-slate-50/80 transition-all">
                            <td className="px-4 py-3 font-mono font-bold text-slate-900">{disp.id}</td>
                            <td className="px-4 py-3">
                              <span className="text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">
                                {disp.transportType}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <span className="font-semibold text-rose-600">{disp.donorName} ({disp.donorBloodType})</span>
                                <span className="text-slate-400 mx-1.5">→</span>
                                <span className="text-slate-800 font-medium">{disp.hospitalName}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono block">Rem: {disp.remainingMiles} mi • ETA: ~{disp.etaMinutes} min</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5 font-mono text-xs">
                                <Thermometer className="w-3.5 h-3.5 text-sky-600" />
                                <span className="text-sky-700 font-bold">{disp.tempCelsius}°C</span>
                                <span className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 rounded">Safe</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5 font-mono text-xs">
                                <Battery className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-slate-800 font-bold">{disp.batteryPct}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                                disp.status === 'En Route'
                                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                                  : disp.status === 'Arrived'
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                  : 'bg-slate-100 border-slate-200 text-slate-600'
                              }`}>
                                {disp.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {disp.status === 'En Route' && (
                                  <button
                                    onClick={() => updateDispatchStatus(disp.id, 'Cancelled')}
                                    className="text-[10px] bg-rose-50 hover:bg-rose-100 text-rose-600 px-2 py-1 rounded border border-rose-200 transition-all font-semibold"
                                  >
                                    Abort
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteDispatch(disp.id)}
                                  className="p-1 text-slate-400 hover:text-slate-700 transition-all"
                                  title="Clear Log"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: EMERGENCY BROADCAST ALERTS */}
          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Emergency Shortage Alerts & Network Broadcasts</h4>
                  <p className="text-[11px] text-slate-500">Broadcast immediate critical supply shortage beacons to regional donors</p>
                </div>
                <button
                  onClick={() => setShowAddAlert(!showAddAlert)}
                  className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Broadcast New Alert</span>
                </button>
              </div>

              {/* Add Alert Form */}
              {showAddAlert && (
                <form onSubmit={handleCreateAlert} className="bg-white border border-amber-300 p-4 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Target Medical Center</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                      value={newAlert.hospitalId}
                      onChange={e => setNewAlert(a => ({ ...a, hospitalId: e.target.value }))}
                    >
                      {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Shortage Blood Group</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                      value={newAlert.bloodType}
                      onChange={e => setNewAlert(a => ({ ...a, bloodType: e.target.value }))}
                    >
                      {BLOOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Emergency Message</label>
                    <input
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                      placeholder="e.g. Critical Trauma Shortage — Urgent O- units required"
                      value={newAlert.message}
                      onChange={e => setNewAlert(a => ({ ...a, message: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold py-2 rounded-lg transition-all shadow-sm"
                    >
                      Broadcast
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddAlert(false)}
                      className="px-2.5 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Alerts List */}
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <div className="bg-white border border-slate-200 p-12 text-center rounded-3xl text-slate-500 text-sm shadow-sm">
                    No active emergency broadcasts. All hospital reserves are within safe thresholds.
                  </div>
                ) : (
                  alerts.map(a => (
                    <div key={a.id} className="bg-white border border-rose-200 p-4 rounded-2xl shadow-sm flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs bg-rose-600 text-white px-2 py-0.5 rounded">
                              {a.bloodType} Shortage
                            </span>
                            <span className="text-xs text-slate-400 font-mono">{a.id}</span>
                            <span className="text-[10px] text-amber-700 font-semibold uppercase">{a.urgency}</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-900 mt-1">{a.message}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Location: {a.hospitalId} • Broadcasted {new Date(a.createdAt).toLocaleString()}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => dismissAlert(a.id)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 transition-all shrink-0"
                      >
                        Dismiss / Resolved
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
