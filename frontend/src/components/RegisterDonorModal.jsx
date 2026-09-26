import React, { useState, useEffect } from 'react';
import { X, UserPlus, MapPin, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export function RegisterDonorModal({ onClose, onRegistered, onOpenLegal }) {
  const [form, setForm] = useState({ name: '', bloodType: 'O-', phone: '' });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.name.trim()) {
      setErrorMsg('Please enter your full legal name.');
      return;
    }

    if (!form.phone.trim()) {
      setErrorMsg('Please provide a valid emergency contact phone number.');
      return;
    }

    const cleanPhone = form.phone.replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Phone number must contain at least 10 valid digits.');
      return;
    }

    if (!agreed) {
      setErrorMsg('You must consent to emergency medical dispatch alerts to proceed.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          bloodType: form.bloodType,
          phone: form.phone.trim()
        })
      });

      if (!res.ok) {
        throw new Error('Registration request rejected by server.');
      }

      const newDonor = await res.json();
      setSuccess(true);
      setTimeout(() => {
        onRegistered();
        onClose();
      }, 1400);
    } catch (err) {
      setErrorMsg(err.message || 'Network error communicating with registry server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-donor-title"
    >
      <div
        className="w-full max-w-md glass-panel p-6 rounded-2xl shadow-2xl border border-slate-700/80 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close registration form"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 id="register-donor-title" className="text-base font-bold text-white">
              Register Emergency Blood Donor
            </h2>
            <p className="text-xs text-slate-400">Join the rapid dispatch volunteer donor registry</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-red-500/15 border border-red-500/30 p-2.5 rounded-xl flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {success ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="font-bold text-white text-base">Donor Registered Successfully</h3>
            <p className="text-xs text-slate-400">
              Profile activated. Your proximity coordinates are now live on the trauma dispatch radar.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="donor-fullname" className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Full Legal Name <span className="text-red-400">*</span>
              </label>
              <input
                id="donor-fullname"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-red-500/50 transition-colors"
                placeholder="e.g. Marcus Vance"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <label htmlFor="donor-bloodtype" className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Blood Group (ABO/Rh) <span className="text-red-400">*</span>
              </label>
              <select
                id="donor-bloodtype"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none focus:border-red-500/50 transition-colors font-mono"
                value={form.bloodType}
                onChange={(e) => setForm((f) => ({ ...f, bloodType: e.target.value }))}
              >
                {BLOOD_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-slate-900 text-white">
                    {t} {t === 'O-' ? '(Universal Donor)' : t === 'AB+' ? '(Universal Plasma)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="donor-phone" className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                Emergency Dispatch Mobile Number <span className="text-red-400">*</span>
              </label>
              <input
                id="donor-phone"
                type="tel"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-red-500/50 transition-colors font-mono"
                placeholder="+1 415-555-0199"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                required
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Used solely for urgent automated dispatch calls & SMS alerts.
              </span>
            </div>

            {/* Consent Language Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500/20"
                />
                <span className="leading-tight text-slate-400">
                  I confirm I am at least 17 years old, weigh &ge;110 lbs, and consent to emergency logistics dispatch under the{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      onOpenLegal();
                    }}
                    className="text-red-400 hover:underline underline-offset-2 font-medium"
                  >
                    Privacy Policy &amp; Terms
                  </button>.
                </span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !agreed}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl text-sm shadow-lg shadow-red-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
              >
                {loading ? 'Verifying Coordinates...' : 'Register as Volunteer Donor'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
