import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  HeartHandshake, 
  PhoneCall, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Star, 
  ExternalLink, 
  Plus, 
  Trash2, 
  GraduationCap, 
  BookOpen 
} from 'lucide-react';
import { User, Counsellor, ConsultationRequest, TeacherContact } from '../types';
import { api } from '../services/api';

interface SupportDirectoryProps {
  currentUser: User | null;
  onOpenCrisisModal: () => void;
}

export const SupportDirectory: React.FC<SupportDirectoryProps> = ({ currentUser, onOpenCrisisModal }) => {
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [trustedAdult, setTrustedAdult] = useState<any>(null);
  const [teachers, setTeachers] = useState<TeacherContact[]>([]);
  
  // Trusted adult edit form
  const [adultName, setAdultName] = useState('');
  const [adultRelation, setAdultRelation] = useState('Mother');
  const [adultPhone, setAdultPhone] = useState('');
  const [adultEmail, setAdultEmail] = useState('');
  const [notifyOnCrisis, setNotifyOnCrisis] = useState(true);
  const [isSavedAdult, setIsSavedAdult] = useState(false);

  // New Teacher Form
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [tchName, setTchName] = useState('');
  const [tchSubject, setTchSubject] = useState('Physics');
  const [tchInstitute, setTchInstitute] = useState('');
  const [tchPhone, setTchPhone] = useState('');
  const [tchEmail, setTchEmail] = useState('');
  const [tchHours, setTchHours] = useState('Mon-Fri 4:00 PM - 6:00 PM');
  const [tchNotes, setTchNotes] = useState('');

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
      const [counRes, reqRes, adultRes, tchRes] = await Promise.all([
        api.getCounsellors(),
        api.getRequests(studentId),
        api.getTrustedAdult(studentId),
        api.getTeachers(studentId)
      ]);
      setCounsellors(counRes.counsellors || []);
      setRequests(reqRes.requests || []);
      setTeachers(tchRes.teachers || []);
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

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tchName || !tchSubject) return;
    try {
      const res = await api.addTeacher({
        name: tchName,
        subject: tchSubject,
        schoolOrCoaching: tchInstitute,
        phone: tchPhone,
        email: tchEmail,
        availableHours: tchHours,
        notes: tchNotes,
        isTrustedMentor: true
      }, currentUser?.id);
      if (res.success) {
        setTeachers(prev => [...prev, res.teacher]);
        setShowAddTeacher(false);
        setTchName('');
        setTchInstitute('');
        setTchPhone('');
        setTchEmail('');
        setTchNotes('');
      }
    } catch (err) {
      console.error('Failed to add teacher:', err);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    try {
      const res = await api.deleteTeacher(id, currentUser?.id);
      if (res.success) {
        setTeachers(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete teacher:', err);
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
            <span>Human Support Network & Guidance Directory</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">Support & Trusted Care Circle</h1>
          <p className="text-xs text-slate-500">
            Keep your trusted adults, teachers, and certified adolescent counsellors easily reachable whenever you need human connection.
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

      {/* 1. Student's Teachers' Contact Information (Prominent Section) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-lavender-100 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sage-800 font-bold text-sm">
              <GraduationCap className="w-5 h-5 text-sage-600" />
              <span>My Teachers & Academic Mentors</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Store your school and coaching teachers' contact info so you can reach out for guidance on tough topics, mock feedback, or reassurance.
            </p>
          </div>
          <button
            onClick={() => setShowAddTeacher(!showAddTeacher)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs shadow-sm transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Teacher Contact</span>
          </button>
        </div>

        {/* Add Teacher Form */}
        {showAddTeacher && (
          <form onSubmit={handleAddTeacher} className="p-5 rounded-2xl bg-sage-50/70 border border-sage-200 space-y-4 animate-in fade-in">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sage-900">Add Teacher / Mentor Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Teacher's Name</label>
                <input
                  type="text"
                  placeholder="e.g. Prof. Vikram Sen"
                  value={tchName}
                  onChange={e => setTchName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Physics, Mathematics, Biology"
                  value={tchSubject}
                  onChange={e => setTchSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">School / Coaching Institute</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Coaching / DPS R.K. Puram"
                  value={tchInstitute}
                  onChange={e => setTchInstitute(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98234 56789"
                  value={tchPhone}
                  onChange={e => setTchPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Email</label>
                <input
                  type="email"
                  placeholder="teacher@school.edu"
                  value={tchEmail}
                  onChange={e => setTchEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Available Hours / Doubt Timing</label>
                <input
                  type="text"
                  placeholder="e.g. Mon-Fri 4:30 PM - 6:00 PM"
                  value={tchHours}
                  onChange={e => setTchHours(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Mentor Note / Guidance Tip</label>
              <input
                type="text"
                placeholder="e.g. Very patient listener, encourages asking basic doubt questions"
                value={tchNotes}
                onChange={e => setTchNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddTeacher(false)}
                className="px-3.5 py-1.5 text-xs text-slate-500 hover:bg-white rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-sage-600 text-white font-bold text-xs shadow-sm"
              >
                Save Teacher Contact
              </button>
            </div>
          </form>
        )}

        {/* Teachers Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teachers.map(tch => (
            <div key={tch.id} className="p-5 rounded-3xl border border-slate-200 hover:border-sage-300 hover:shadow-md transition-all bg-white flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sage-100 text-sage-800">
                      {tch.subject}
                    </span>
                    <h3 className="font-bold text-base text-slate-800 mt-2">{tch.name}</h3>
                    <p className="text-xs text-slate-500">{tch.schoolOrCoaching}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteTeacher(tch.id)}
                    className="text-slate-300 hover:text-rose-600 p-1 transition-colors"
                    title="Remove teacher contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {tch.notes && (
                  <p className="text-xs text-slate-600 mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 leading-relaxed italic">
                    "{tch.notes}"
                  </p>
                )}

                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  {tch.availableHours && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Available: {tch.availableHours}</span>
                    </div>
                  )}
                  {tch.phone && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-mono">
                      <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                      <span>{tch.phone}</span>
                    </div>
                  )}
                  {tch.email && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{tch.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                {tch.phone && (
                  <a
                    href={`tel:${tch.phone.replace(/[^0-9+]/g, '')}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-sage-50 hover:bg-sage-100 text-sage-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-sage-200"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Teacher</span>
                  </a>
                )}
                {tch.email && (
                  <a
                    href={`mailto:${tch.email}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Send Email</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Grid: Trusted Adult (Family) & Counsellor Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Trusted Adult & Safeguarding Protocol */}
        <div className="space-y-6">
          
          {/* Trusted Adult Card */}
          <div className="bg-white rounded-3xl p-6 border border-lavender-100 shadow-card space-y-4">
            <div className="flex items-center gap-2 text-slate-800">
              <Users className="w-5 h-5 text-lavender-600" />
              <h2 className="text-base font-bold">Designated Trusted Adult (Family / Guardian)</h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Identify a family member or guardian who you feel safe confiding in. We only contact them upon your explicit directive or in verified life-safety escalation.
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
                    <option value="Aunt / Uncle">Aunt / Uncle</option>
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
              Your thoughts and private journal remain strictly shielded. Teachers and parents never see confidential wellbeing disclosures.
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
