import React, { useState, useEffect, useCallback } from 'react';
import {
  X, ShieldAlert, Users, Hospital, Radio, AlertTriangle, CheckCircle,
  XCircle, Trash2, Plus, RefreshCw, BarChart3, ArrowUpRight, Flame,
  Battery, Thermometer, MapPin, Search, Filter, ShieldCheck, HeartPulse,
  Network, Share2, Upload, FileText, CheckCircle2, Link2, Database
} from 'lucide-react';
import { resilientFetch } from '../api/client';

const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export function AdminPortalModal({ onClose, onDataChange }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview | donors | hospitals | dispatches | alerts | relations | upload
  const [stats, setStats] = useState(null);
  const [donors, setDonors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [relations, setRelations] = useState([]);
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

  // Relations form
  const [showAddRelation, setShowAddRelation] = useState(false);
  const [newRelation, setNewRelation] = useState({
    fromHospitalId: 'HOSP-01',
    toHospitalId: 'HOSP-02',
    relationType: 'trauma_escalation',
    notes: ''
  });

  // Bulk Ingestion State
  const [uploadType, setUploadType] = useState('donors'); // donors | hospitals | requests
  const [csvText, setCsvText] = useState('');
  const [uploadResult, setUploadResult] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch all admin data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, donorsRes, hospitalsRes, dispatchesRes, alertsRes, relationsRes] = await Promise.all([
        resilientFetch('/api/admin/stats'),
        resilientFetch(`/api/admin/donors?search=${encodeURIComponent(donorSearch)}&bloodType=${donorBloodFilter}&verified=${donorVerifiedFilter}`),
        resilientFetch('/api/admin/hospitals'),
        resilientFetch('/api/admin/dispatches'),
        resilientFetch('/api/admin/alerts'),
        resilientFetch('/api/admin/relations')
      ]);

      setStats(statsRes);
      setDonors(donorsRes || []);
      setHospitals(hospitalsRes || []);
      setDispatches(dispatchesRes || []);
      setAlerts(alertsRes || []);
      setRelations(relationsRes || []);
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

  // Hospital Deletion
  const deleteHospital = async (id) => {
    if (!confirm('Are you sure you want to remove this hospital center and sever its mutual aid connections?')) return;
    try {
      await resilientFetch(`/api/hospitals/${id}`, { method: 'DELETE' });
      fetchAllData();
      if (onDataChange) onDataChange();
    } catch (e) {
      console.error(e);
    }
  };

  // Inter-Hospital Relation Actions
  const handleCreateRelation = async (e) => {
    e.preventDefault();
    if (newRelation.fromHospitalId === newRelation.toHospitalId) {
      alert('Source and target hospitals must be different.');
      return;
    }
    try {
      await resilientFetch('/api/admin/relations', {
        method: 'POST',
        body: JSON.stringify(newRelation)
      });
      setShowAddRelation(false);
      setNewRelation({
        fromHospitalId: 'HOSP-01',
        toHospitalId: 'HOSP-02',
        relationType: 'trauma_escalation',
        notes: ''
      });
      fetchAllData();
      if (onDataChange) onDataChange();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteRelation = async (id) => {
    if (!confirm('Are you sure you want to sever this mutual aid relationship link?')) return;
    try {
      await resilientFetch(`/api/admin/relations/${id}`, { method: 'DELETE' });
      fetchAllData();
      if (onDataChange) onDataChange();
    } catch (e) {
      console.error(e);
    }
  };

  // Sample CSV Presets
  const loadSampleCSV = (type) => {
    setUploadResult(null);
    if (type === 'donors') {
      setCsvText(
`name,bloodType,phone,lat,lng,hospitalAffiliation
Dr. Robert Lang,O-,+1 415-555-8811,37.7712,-122.4221,HOSP-01
Elena Rostova,B+,+1 415-555-8822,37.7820,-122.4180,HOSP-02
Marcus Vance,O-,+1 415-555-8833,37.7650,-122.4310,HOSP-01
Sarah Jenkins,A+,+1 415-555-8844,37.7590,-122.4450,HOSP-03`
      );
    } else if (type === 'hospitals') {
      setCsvText(
`name,code,lat,lng,phone,helipad,O-,O+,A+,A-,B+,B-,AB+,AB-
Mission District Trauma Hub,MDTH,37.7599,-122.4148,+1 415-555-1100,true,4,8,12,4,6,2,5,3
Sunset Regional Clinic,SRC,37.7533,-122.4941,+1 415-555-2200,false,2,5,8,3,4,1,3,1`
      );
    } else {
      setCsvText(
`patientName,bloodType,unitsRequired,urgency,hospitalId,contactPhone,medicalReason
Patient Vance,O-,2,critical,HOSP-01,+1 415-555-9011,Emergency surgery vascular trauma
Liam Chen,A+,1,urgent,HOSP-02,+1 415-555-9022,Pediatric emergency transfusion
Aria Walker,B-,3,critical,HOSP-04,+1 415-555-9033,Severe acute hemorrhagic shock`
      );
    }
  };

  // Bulk Ingestion Execution
  const handleExecuteUpload = async () => {
    if (!csvText.trim()) return;
    setUploading(true);
    setUploadResult(null);
    try {
      let endpoint = '/api/donors/upload';
      if (uploadType === 'hospitals') endpoint = '/api/hospitals/upload';
      else if (uploadType === 'requests') endpoint = '/api/requests/upload';

      const res = await resilientFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ csvText })
      });
      setUploadResult(res);
      fetchAllData();
      if (onDataChange) onDataChange();
    } catch (err) {
      setUploadResult({ error: err.message || 'Upload failed' });
    } finally {
      setUploading(false);
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

          <button
            onClick={() => setActiveTab('relations')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'relations'
                ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Network className="w-4 h-4 text-purple-600" />
            <span>Healthcare Mesh & Relations ({relations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition-all ${
              activeTab === 'upload'
                ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Bulk Ingestion Engine</span>
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

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-700">
                          Total Stock: {Object.values(h.inventory || {}).reduce((a, b) => a + b, 0)} Units
                        </span>
                        <button
                          onClick={() => deleteHospital(h.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-slate-200"
                          title="Delete Medical Center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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

          {/* TAB 6: HEALTHCARE MESH & RELATIONS */}
          {activeTab === 'relations' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-purple-600" />
                    <h4 className="text-xs font-bold text-slate-900">Inter-Hospital Mutual Aid Mesh & Corridors</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Define cross-facility triage, drone flight corridors, and pediatric contingency links</p>
                </div>
                <button
                  onClick={() => setShowAddRelation(!showAddRelation)}
                  className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Establish Mutual Aid Link</span>
                </button>
              </div>

              {/* Add Relation Form */}
              {showAddRelation && (
                <form onSubmit={handleCreateRelation} className="bg-white border border-purple-300 p-4 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Source Medical Center</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                      value={newRelation.fromHospitalId}
                      onChange={e => setNewRelation(r => ({ ...r, fromHospitalId: e.target.value }))}
                    >
                      {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Target Medical Center</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                      value={newRelation.toHospitalId}
                      onChange={e => setNewRelation(r => ({ ...r, toHospitalId: e.target.value }))}
                    >
                      {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Corridor Archetype</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold"
                      value={newRelation.relationType}
                      onChange={e => setNewRelation(r => ({ ...r, relationType: e.target.value }))}
                    >
                      <option value="trauma_escalation">Level-1 Trauma Escalation</option>
                      <option value="pediatric_transfer">Pediatric & Neonatal Transfer</option>
                      <option value="emergency_reserve">Emergency Reserve Backup</option>
                      <option value="drone_corridor">Autonomous Air Corridor</option>
                      <option value="surplus_mesh">Surplus Rebalancing Mesh</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Protocol Notes</label>
                    <div className="flex gap-2">
                      <input
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                        placeholder="e.g. Priority emergency corridor"
                        value={newRelation.notes}
                        onChange={e => setNewRelation(r => ({ ...r, notes: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-4 flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddRelation(false)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-all shadow-sm"
                    >
                      Confirm & Establish Corridor
                    </button>
                  </div>
                </form>
              )}

              {/* Relations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {relations.length === 0 ? (
                  <div className="col-span-2 bg-white border border-slate-200 p-12 text-center rounded-3xl text-slate-500 text-sm shadow-sm">
                    No active inter-hospital relations established. Click &apos;Establish Mutual Aid Link&apos; to link trauma centers.
                  </div>
                ) : (
                  relations.map(rel => {
                    const fromHosp = hospitals.find(h => h.id === rel.fromHospitalId);
                    const toHosp = hospitals.find(h => h.id === rel.toHospitalId);

                    const typeStyles = {
                      trauma_escalation: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', label: 'Trauma Escalation' },
                      pediatric_transfer: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', label: 'Pediatric Transfer' },
                      emergency_reserve: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', label: 'Emergency Reserve' },
                      drone_corridor: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', label: 'Airspace Drone Corridor' },
                      surplus_mesh: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', label: 'Surplus Mesh' }
                    }[rel.relationType] || { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', label: rel.relationType };

                    return (
                      <div key={rel.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${typeStyles.bg} ${typeStyles.border} ${typeStyles.text}`}>
                              {typeStyles.label}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 font-bold">{rel.id}</span>
                          </div>

                          {/* Hospital Node Link */}
                          <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="flex-1 min-w-0">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Origin Facility</span>
                              <p className="text-xs font-bold text-slate-800 truncate">{fromHosp ? fromHosp.name : rel.fromHospitalId}</p>
                              <span className="text-[10px] font-mono text-slate-500">{rel.fromHospitalId}</span>
                            </div>

                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-inner">
                              <Link2 className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0 text-right">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Destination Facility</span>
                              <p className="text-xs font-bold text-slate-800 truncate">{toHosp ? toHosp.name : rel.toHospitalId}</p>
                              <span className="text-[10px] font-mono text-slate-500">{rel.toHospitalId}</span>
                            </div>
                          </div>

                          {rel.notes && (
                            <p className="text-[11px] text-slate-600 mt-2.5 px-1 italic">
                              &ldquo;{rel.notes}&rdquo;
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400 font-mono">
                            {rel.createdAt ? new Date(rel.createdAt).toLocaleDateString() : 'Active'}
                          </span>
                          <button
                            onClick={() => deleteRelation(rel.id)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Sever Link</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 7: BULK DATA INGESTION ENGINE */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-slate-900">Enterprise Bulk Ingestion Engine</h4>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Ingest CSV or JSON payloads directly into Live operational databases</p>
                </div>

                {/* Ingestion Target Selector */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                  <button
                    onClick={() => { setUploadType('donors'); setCsvText(''); setUploadResult(null); }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                      uploadType === 'donors'
                        ? 'bg-white text-slate-900 shadow-sm font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-rose-500" />
                    <span>Donors</span>
                  </button>

                  <button
                    onClick={() => { setUploadType('hospitals'); setCsvText(''); setUploadResult(null); }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                      uploadType === 'hospitals'
                        ? 'bg-white text-slate-900 shadow-sm font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Hospital className="w-3.5 h-3.5 text-blue-500" />
                    <span>Hospitals</span>
                  </button>

                  <button
                    onClick={() => { setUploadType('requests'); setCsvText(''); setUploadResult(null); }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                      uploadType === 'requests'
                        ? 'bg-white text-slate-900 shadow-sm font-bold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-500" />
                    <span>Requests</span>
                  </button>
                </div>
              </div>

              {/* Upload Workspace */}
              <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    CSV / TSV Ingestion Stream ({uploadType.toUpperCase()})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadSampleCSV(uploadType)}
                      className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg transition-all flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Load Sample Template</span>
                    </button>
                    {csvText && (
                      <button
                        onClick={() => { setCsvText(''); setUploadResult(null); }}
                        className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  className="w-full h-44 bg-slate-900 text-emerald-400 font-mono text-xs p-3.5 rounded-2xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed resize-none"
                  placeholder="Paste raw CSV or structured TSV text here..."
                  value={csvText}
                  onChange={e => setCsvText(e.target.value)}
                />

                {/* Upload Status / Results */}
                {uploadResult && (
                  <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-3 ${
                    uploadResult.error
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                  }`}>
                    {uploadResult.error ? (
                      <>
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        <div>
                          <p className="font-bold">Ingestion Failed</p>
                          <p className="text-[11px] text-rose-700">{uploadResult.error}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-bold">{uploadResult.message || 'Records Ingested Successfully'}</p>
                          <p className="text-[11px] text-emerald-700">
                            Processed {uploadResult.count || uploadResult.insertedCount || (uploadResult.donors && uploadResult.donors.length) || (uploadResult.hospitals && uploadResult.hospitals.length) || 1} records into primary registry.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500">
                    {csvText.trim() ? `${csvText.trim().split('\n').length - 1} data rows detected` : 'No payload staged'}
                  </span>
                  <button
                    onClick={handleExecuteUpload}
                    disabled={uploading || !csvText.trim()}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      uploading || !csvText.trim()
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                    }`}
                  >
                    <Upload className={`w-3.5 h-3.5 ${uploading ? 'animate-bounce' : ''}`} />
                    <span>{uploading ? 'Ingesting Payload...' : 'Execute Batch Ingestion'}</span>
                  </button>
                </div>
              </div>

              {/* Schema Reference Guide */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs text-slate-600">
                <span className="font-bold text-slate-800 block mb-1.5">Required Schema Specification</span>
                {uploadType === 'donors' && (
                  <p className="font-mono text-[11px] text-slate-700">
                    Headers: <code className="bg-slate-200 px-1 py-0.5 rounded text-rose-600 font-bold">name,bloodType,phone,lat,lng,hospitalAffiliation</code>
                  </p>
                )}
                {uploadType === 'hospitals' && (
                  <p className="font-mono text-[11px] text-slate-700">
                    Headers: <code className="bg-slate-200 px-1 py-0.5 rounded text-blue-600 font-bold">name,code,lat,lng,phone,helipad,O-,O+,A+,A-,B+,B-,AB+,AB-</code>
                  </p>
                )}
                {uploadType === 'requests' && (
                  <p className="font-mono text-[11px] text-slate-700">
                    Headers: <code className="bg-slate-200 px-1 py-0.5 rounded text-amber-600 font-bold">patientName,bloodType,unitsRequired,urgency,hospitalId,contactPhone,medicalReason</code>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
