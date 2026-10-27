import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  HeartHandshake, 
  PhoneCall, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Star,
  ExternalLink,
  Plus
} from 'lucide-react';
import { User, Counsellor, ConsultationRequest } from '../types';
import { api } from '../services/api';

interface SupportDirectoryProps {
  currentUser: User | null;
  onOpenCrisisModal: () => void;
}

export const SupportDirectory: React.FC<SupportDirectoryProps> = ({ currentUser, onOpenCrisisModal }) => {
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [trustedAdult, setTrustedAdult] = useState<any>(null);
  
  // Trusted adult edit form
  const [adultName, setAdultName] = useState('');
  const [adultRelation, setAdultRelation] = useState('Mother');
  const [adultPhone, setAdultPhone] = useState('');
  const [adultEmail, setAdultEmail] = useState('');
  const [notifyOnCrisis, setNotifyOnCrisis] = useState(true);
  const [isSavedAdult, setIsSavedAdult] = useState(false);

  // Booking modal state
  const [selectedCounsellor, setSelectedCounsellor] = useState<Counsellor | null>(null);
  const [bookingReason, setBookingReason] = useState('');
  const [bookingSlot, setBookingSlot] = useState('Wednesday 5:00 PM');
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  useEffect(() => {
    loadSupportData();
  }, [currentUser]);

  const loadSupportData = async () => {
    try {
      const studentId = currentUser?.id || 'student-1';
      const [counRes, reqRes, adultRes] = await Promise.all([
        api.getCounsellors(),
        api.getRequests(studentId),
        api.getTrustedAdult(studentId)
      ]);
      setCounsellors(counRes.counsellors || []);
      setRequests(reqRes.requests || []);
      if (adultRes.trustedAdult) {
        setTrustedAdult(adultRes.trustedAdult);
        setAdultName(adultRes.trustedAdult.name || '');
        setAdultRelation(adultRes.trustedAdult.relation || 'Mother');
        setAdultPhone(adultRes.trustedAdult.phone || '');
        setAdultEmail(adultRes.trustedAdult.email || '');
        setNotifyOnCrisis(Boolean(adultRes.trustedAdult.notifyOnCrisis));
      }
    } catch (err) {
      console.error('Failed to load support data:', err);
    }
  };

  const handleSaveAdult = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.updateTrustedAdult({
        name: adultName,
        relation: adultRelation,
        phone: adultPhone,
        email: adultEmail,
        notifyOnCrisis
      }, currentUser?.id);
      if (res.success) {
        setTrustedAdult(res.emergencyContact);
        setIsSavedAdult(true);
        setTimeout(() => setIsSavedAdult(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save adult:', err);
    }
  };

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCounsellor) return;
    try {
      const res = await api.bookSession({
        studentId: currentUser?.id || 'student-1',
        counsellorId: selectedCounsellor.id,
        reason: bookingReason,
        preferredSlot: bookingSlot
      });
      if (res.success) {
        setRequests(prev => [res.request, ...prev]);
        setBookingSubmitted(true);
        setTimeout(() => {
          setBookingSubmitted(false);
          setSelectedCounsellor(null);
          setBookingReason('');
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to book session:', err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-lavender-700 font-semibold text-xs mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Human Support & Safeguarding System</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">Trusted Adult & Professional Care</h1>
          <p className="text-xs text-slate-500">
            Real human psychologists and verified guardians who support you throughout your competitive exam preparation.
          </p>
        </div>

        <button
          onClick={onOpenCrisisModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-200 transition-all shrink-0"
        >
          <PhoneCall className="w-4 h-4" />
          <span>Verified Crisis Helplines (14416)</span>
        </button>
      </div>

      {/* Grid: Left Trusted Adult & Safeguarding, Right Counsellor Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Trusted Adult & Safeguarding Protocol */}
        <div className="space-y-6">
          
          {/* Trusted Adult Card */}
          <div className="bg-white rounded-3xl p-6 border border-lavender-100 shadow-card space-y-4">
            <div className="flex items-center gap-2 text-slate-800">
              <Users className="w-5 h-5 text-lavender-600" />
              <h2 className="text-base font-bold">Designated Trusted Adult</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Identify a family member or teacher who you trust. We only connect them upon your explicit directive or in immediate life safety escalation.
            </p>

            <form onSubmit={handleSaveAdult} className="space-y-3 pt-2">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sunita Sharma"
                  value={adultName}
                  onChange={e => setAdultName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Relationship</label>
                  <select
                    value={adultRelation}
                    onChange={e => setAdultRelation(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Older Sibling">Older Sibling</option>
                    <option value="Favorite Teacher">Mentor / Teacher</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={adultPhone}
                    onChange={e => setAdultPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Email</label>
                <input
                  type="email"
                  placeholder="contact@email.com"
                  value={adultEmail}
                  onChange={e => setAdultEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <label className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={notifyOnCrisis}
                  onChange={e => setNotifyOnCrisis(e.target.checked)}
                  className="mt-0.5 accent-lavender-600"
                />
                <span>Authorize emergency crisis coordination if severe life-safety risk is verified by human professionals.</span>
              </label>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-lavender-600 hover:bg-lavender-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                {isSavedAdult ? '✓ Updated Successfully' : 'Save Trusted Adult Details'}
              </button>
            </form>
          </div>

          {/* Ethical Safeguarding Protocol Card */}
          <div className="bg-white rounded-3xl p-6 border border-lavender-100 shadow-card space-y-3 text-xs text-slate-600 leading-relaxed">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ethical Safeguarding Protocol
            </h3>
            <p className="font-semibold text-slate-800">
              1. Minimum-Necessary Information Sharing
            </p>
            <p>
              Your thoughts and journal are shielded. Teachers and parents only see academic milestones unless you explicitly request a joint conference.
            </p>
            <p className="font-semibold text-slate-800">
              2. What if home is not a safe contact?
            </p>
            <p>
              If a student discloses domestic difficulties, our protocol directs escalation exclusively to verified neutral child-protection bodies (Childline 1098 / Tele-MANAS) rather than notifying potentially unsafe family members.
            </p>
            <p className="font-semibold text-slate-800">
              3. Human Decision-Making
            </p>
            <p>
              Algorithms never make clinical decisions. Only licensed human psychologists handle triage and care escalation.
            </p>
          </div>

        </div>

        {/* Right 2 Columns: Certified Counsellor Directory & Active Appointments */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Consultation Requests Tracker */}
          {requests.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-lavender-100 shadow-card space-y-4">
              <h2 className="text-base font-bold text-slate-800">Your Confidential Consultation Requests</h2>
              <div className="space-y-3">
                {requests.map(req => (
                  <div key={req.id} className="p-4 rounded-2xl bg-lavender-50/60 border border-lavender-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">{req.counsellorName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">Topic: {req.reason}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Slot: {req.preferredSlot}</p>
                    </div>
                    <span className="text-xs font-semibold text-lavender-700 bg-white px-3 py-1.5 rounded-xl border border-lavender-200 shrink-0">
                      Private Virtual Room
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Counsellor Directory */}
          <div className="bg-white rounded-3xl p-6 border border-lavender-100 shadow-card space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">Certified Student Mental Health Counsellors</h2>
              <p className="text-xs text-slate-500">
                1-on-1 virtual sessions with clinical psychologists specializing in competitive exam anxiety and sleep hygiene.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {counsellors.map(c => (
                <div key={c.id} className="p-5 rounded-3xl border border-slate-200 hover:border-lavender-300 hover:shadow-md transition-all bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="text-3xl">{c.avatar}</span>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{c.rating}</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-sm text-slate-800 mt-2">{c.name}</h3>
                    <p className="text-xs text-lavender-700 font-semibold">{c.title}</p>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{c.experience}</p>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {c.badges.map((b, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">{c.availability}</span>
                    <button
                      onClick={() => setSelectedCounsellor(c)}
                      className="px-3 py-1.5 rounded-xl bg-lavender-600 hover:bg-lavender-700 text-white font-bold text-xs shadow-sm transition-colors"
                    >
                      Book 1-on-1
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Booking Modal */}
      {selectedCounsellor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-lavender-100 space-y-4">
            <h3 className="text-base font-bold text-slate-800">
              Request Confidential Session with {selectedCounsellor.name}
            </h3>
            <p className="text-xs text-slate-500">
              Your consultation is 100% confidential. No academic rank or mental health scores are shared with test coaching institutes.
            </p>

            {bookingSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-center text-xs font-bold">
                ✓ Request Submitted! The counsellor desk will contact you with session link.
              </div>
            ) : (
              <form onSubmit={handleBookSession} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">What would you like to discuss?</label>
                  <textarea
                    placeholder="e.g. Test pacing panic, trouble sleeping before mock tests, feeling overwhelmed"
                    value={bookingReason}
                    onChange={e => setBookingReason(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Preferred Time Slot</label>
                  <select
                    value={bookingSlot}
                    onChange={e => setBookingSlot(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Wednesday 5:00 PM">Wednesday 5:00 PM</option>
                    <option value="Thursday 6:30 PM">Thursday 6:30 PM</option>
                    <option value="Saturday 4:00 PM">Saturday 4:00 PM</option>
                    <option value="Next available weekday evening">Next available weekday evening</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCounsellor(null)}
                    className="px-3 py-2 rounded-xl text-xs text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-lavender-600 text-white font-bold text-xs"
                  >
                    Confirm Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
