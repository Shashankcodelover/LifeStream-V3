import React, { useState } from 'react';
import { X, UserPlus, MapPin, CheckCircle2 } from 'lucide-react';
import { resilientFetch } from '../api/client';

const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export function RegisterDonorModal({ onClose, onRegistered }) {
  const [form, setForm] = useState({ name: '', bloodType: 'O-', phone: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    setLoading(true);

    try {
      const newDonor = await resilientFetch('/api/donors', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setSuccess(true);
      setTimeout(() => {
        if (onRegistered) onRegistered(newDonor);
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-md bg-white p-6 rounded-3xl shadow-2xl border border-slate-200 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Register Emergency Donor</h3>
            <p className="text-xs text-slate-500">Join the rapid dispatch donor network in your area</p>
          </div>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="font-bold text-slate-900 text-base">Donor Registered!</h4>
            <p className="text-xs text-slate-500">Your profile is now active on the dispatch map.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Full Name *</label>
              <input
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-rose-500 focus:bg-white transition-all"
                placeholder="e.g. Marcus Vance"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Blood Type *</label>
              <select
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-rose-500 transition-all"
                value={form.bloodType}
                onChange={e => setForm(f => ({ ...f, bloodType: e.target.value }))}
              >
                {BLOOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Emergency Contact Phone</label>
              <input
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-rose-500 focus:bg-white transition-all"
                placeholder="+1 415-555-0199"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register & Join Network'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
