import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Hospital, CheckCircle2, User, Droplet, Plus } from 'lucide-react';
import { resilientFetch } from '../api/client';

const TIME_SLOTS = ['09:00 AM', '10:30 AM', '11:30 AM', '01:30 PM', '03:00 PM', '04:30 PM'];
const DONATION_TYPES = ['Whole Blood (Standard 500ml)', 'Power Red (Double RBC)', 'Platelets & Plasma Apheresis'];

export function DonorAppointmentModal({ onClose, user, hospitals = [], onAppointmentBooked }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const [hospitalId, setHospitalId] = useState(hospitals[0]?.id || 'HOSP-01');
  const [date, setDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('10:30 AM');
  const [donationType, setDonationType] = useState('Whole Blood (Standard 500ml)');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const fetchAppointments = async () => {
    try {
      const data = await resilientFetch('/api/auth/appointments');
      setAppointments(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      const data = await resilientFetch('/api/auth/appointments', {
        method: 'POST',
        body: JSON.stringify({
          donorName: user?.name || 'Marcus Vance',
          hospitalId,
          date,
          timeSlot,
          donationType
        })
      });
      setBookingSuccess(true);
      fetchAppointments();
      if (onAppointmentBooked) onAppointmentBooked(data);
      setTimeout(() => {
        setBookingSuccess(false);
        setShowBookingForm(false);
      }, 1500);
    } catch (err) {
      console.error(err);
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

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-md shadow-rose-600/20">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">Donor Appointment & Center Booking</h3>
              <span className="text-[10px] font-mono font-bold bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full">
                SCHEDULED SESSIONS
              </span>
            </div>
            <p className="text-xs text-slate-500">Schedule your next voluntary donation at any of the 5 regional trauma centers</p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Your Scheduled Appointments ({appointments.length})
          </span>
          <button
            onClick={() => setShowBookingForm(!showBookingForm)}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book New Appointment</span>
          </button>
        </div>

        {/* Booking Form Drawer */}
        {showBookingForm && (
          <form onSubmit={handleBook} className="bg-slate-50 border border-rose-200 p-4 rounded-2xl mb-5 space-y-3 shadow-sm">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Schedule Donation Session</h4>

            {bookingSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Appointment Confirmed! Confirmation pass generated.</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Center / Hospital</label>
                <select
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-rose-500"
                  value={hospitalId}
                  onChange={e => setHospitalId(e.target.value)}
                >
                  {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Donation Type</label>
                <select
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-rose-500"
                  value={donationType}
                  onChange={e => setDonationType(e.target.value)}
                >
                  {DONATION_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Preferred Date</label>
                <input
                  type="date"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-rose-500"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Time Slot</label>
                <select
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-rose-500"
                  value={timeSlot}
                  onChange={e => setTimeSlot(e.target.value)}
                >
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs transition-all shadow-sm"
              >
                Confirm Appointment
              </button>
              <button
                type="button"
                onClick={() => setShowBookingForm(false)}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Existing Appointments List */}
        <div className="space-y-3">
          {appointments.map(apt => (
            <div key={apt.id} className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">{apt.hospitalName}</span>
                  <span className="text-[10px] font-mono bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded">{apt.id}</span>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {apt.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                  <span className="text-slate-700 font-semibold">{apt.donationType}</span>
                  <span>•</span>
                  <span>Donor: {apt.donorName}</span>
                </p>
              </div>

              <div className="text-right text-xs font-mono text-slate-600">
                <div className="flex items-center gap-1 text-slate-900 font-bold justify-end">
                  <Calendar className="w-3.5 h-3.5 text-rose-600" />
                  <span>{apt.date}</span>
                </div>
                <span className="text-[11px] text-slate-400">{apt.timeSlot}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
