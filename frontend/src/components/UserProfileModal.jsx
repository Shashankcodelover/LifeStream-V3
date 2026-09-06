import React, { useState } from 'react';
import {
  X, User, ShieldCheck, Phone, Mail, Droplet, KeyRound,
  LogOut, Save, CheckCircle2, Award, HeartHandshake, MapPin
} from 'lucide-react';
import { resilientFetch } from '../api/client';

export function UserProfileModal({ user, onClose, onLogout, onProfileUpdated }) {
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bloodType, setBloodType] = useState(user?.bloodType || 'O-');
  const [availabilityStatus, setAvailabilityStatus] = useState(user?.availabilityStatus || 'Available for Immediate Dispatch');
  const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || '');
  const [medicalNotes, setMedicalNotes] = useState(user?.medicalNotes || '');

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSavedMsg(false);

    try {
      const data = await resilientFetch('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          name,
          phone,
          bloodType,
          availabilityStatus,
          emergencyContact,
          medicalNotes
        })
      });
      localStorage.setItem('lifestream_user', JSON.stringify(data));
      setSavedMsg(true);
      if (onProfileUpdated) onProfileUpdated(data);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPass || !newPass) return;

    try {
      await resilientFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass })
      });

      setPassMsg({ type: 'success', text: 'Password successfully updated.' });
      setCurrentPass('');
      setNewPass('');
    } catch (err) {
      setPassMsg({ type: 'error', text: err.message || 'Password change failed' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-white p-6 rounded-3xl shadow-2xl border border-slate-200 relative flex flex-col max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
          <X className="w-5 h-5" />
        </button>

        {/* Header Profile Summary */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-purple-600/20">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
                <span className="text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full uppercase">
                  {user?.role}
                </span>
                {user?.bloodType && (
                  <span className="text-[10px] font-mono font-bold bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded">
                    {user?.bloodType}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleUpdateProfile} className="space-y-4 mb-6">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Personal & Clinical Details</h4>

          {savedMsg && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Profile information updated successfully.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Full Legal Name</label>
              <input
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-purple-500 focus:bg-white"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Contact Phone</label>
              <input
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-purple-500 focus:bg-white"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Donor specific availability */}
          {user?.role === 'donor' && (
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Emergency Dispatch Availability Status</label>
              <select
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-emerald-700 font-semibold outline-none"
                value={availabilityStatus}
                onChange={e => setAvailabilityStatus(e.target.value)}
              >
                <option value="Available for Immediate Dispatch">🟢 Available for Immediate Rapid Dispatch</option>
                <option value="On Medical Cooldown">🟡 On Medical Cooldown (Within 56 Days)</option>
                <option value="Temporary Away / Out of Radar">🔴 Temporary Away / Out of Service Area</option>
              </select>
            </div>
          )}

          {/* Patient specific fields */}
          {user?.role === 'patient' && (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Emergency Contact Person</label>
                <input
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-purple-500"
                  placeholder="e.g. Spouse / Parent (+1 415-555-0912)"
                  value={emergencyContact}
                  onChange={e => setEmergencyContact(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Pre-Existing Medical Notes / Allergies</label>
                <textarea
                  rows="2"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none resize-none focus:border-purple-500"
                  value={medicalNotes}
                  onChange={e => setMedicalNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-xl text-xs shadow-sm transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile Settings</span>
          </button>
        </form>

        {/* Password Reset Section */}
        <div className="border-t border-slate-200 pt-5">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Security & Password</h4>

          {passMsg && (
            <div className={`mb-3 p-2.5 rounded-xl text-xs border ${
              passMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}>
              {passMsg.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <input
              type="password"
              placeholder="Current password"
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none"
              value={currentPass}
              onChange={e => setCurrentPass(e.target.value)}
            />
            <input
              type="password"
              placeholder="New password"
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none"
              value={newPass}
              onChange={e => setNewPass(e.target.value)}
            />
            <button
              type="submit"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-1.5 px-3 rounded-xl text-xs border border-slate-300 transition-all"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
