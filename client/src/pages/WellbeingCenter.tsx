import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Sparkles, 
  Lock, 
  ShieldCheck, 
  TrendingUp, 
  Calendar, 
  Plus, 
  Trash2, 
  AlertCircle, 
  HelpCircle,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';
import { User, WellbeingAssessment, MoodLog, JournalEntry } from '../types';
import { api } from '../services/api';

interface WellbeingCenterProps {
  currentUser: User | null;
  onOpenCrisisModal: () => void;
  onNavigateTab: (tab: string) => void;
}

export const WellbeingCenter: React.FC<WellbeingCenterProps> = ({ currentUser, onOpenCrisisModal, onNavigateTab }) => {
  const [activeSubTab, setActiveSubTab] = useState<'reflection' | 'trends' | 'journal'>('reflection');
  const [assessments, setAssessments] = useState<WellbeingAssessment[]>([]);
  const [disclaimer, setDisclaimer] = useState<string>('');
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  // Questionnaire form states
  const [moodScore, setMoodScore] = useState<number>(3);
  const [stressScore, setStressScore] = useState<number>(3);
  const [sleepScore, setSleepScore] = useState<number>(3);
  const [energyScore, setEnergyScore] = useState<number>(3);
  const [socialScore, setSocialScore] = useState<number>(3);
  const [pressureScore, setPressureScore] = useState<number>(3);
  const [supportScore, setSupportScore] = useState<number>(3);
  const [reflectionNotes, setReflectionNotes] = useState<string>('');
  const [submittingAssessment, setSubmittingAssessment] = useState<boolean>(false);
  const [latestFeedback, setLatestFeedback] = useState<WellbeingAssessment | null>(null);

  // Journal form states
  const [showAddJournal, setShowAddJournal] = useState<boolean>(false);
  const [journalTitle, setJournalTitle] = useState<string>('');
  const [journalContent, setJournalContent] = useState<string>('');
  const [journalMood, setJournalMood] = useState<string>('Reflective');

  useEffect(() => {
    loadWellbeingData();
  }, [currentUser]);

  const loadWellbeingData = async () => {
    try {
      const studentId = currentUser?.id || 'student-1';
      const [assessRes, moodRes, jrRes] = await Promise.all([
        api.getAssessments(studentId),
        api.getMoods(studentId),
        api.getJournal(studentId)
      ]);
      setAssessments(assessRes.assessments || []);
      setDisclaimer(assessRes.disclaimer || '');
      setMoodLogs(moodRes.moodHistory || []);
      setJournalEntries(jrRes.entries || []);
    } catch (err) {
      console.error('Failed to load wellbeing data:', err);
    }
  };

  const handleAssessmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAssessment(true);
    try {
      const res = await api.submitAssessment({
        mood: moodScore,
        stress: stressScore,
        sleep: sleepScore,
        energy: energyScore,
        socialConnection: socialScore,
        academicPressure: pressureScore,
        supportAccess: supportScore,
        reflectionNotes
      }, currentUser?.id);

      if (res.success) {
        setLatestFeedback(res.assessment);
        setAssessments(prev => [res.assessment, ...prev]);
        setReflectionNotes('');
      }
    } catch (err) {
      console.error('Failed to submit assessment:', err);
    } finally {
      setSubmittingAssessment(false);
    }
  };

  const handleAddJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalContent) return;
    try {
      const res = await api.addJournal({
        title: journalTitle || 'Mindful Reflection',
        content: journalContent,
        mood: journalMood,
        tags: ['Private Entry']
      }, currentUser?.id);

      if (res.success) {
        setJournalEntries(prev => [res.entry, ...prev]);
        setJournalTitle('');
        setJournalContent('');
        setShowAddJournal(false);
      }
    } catch (err) {
      console.error('Failed to save journal:', err);
    }
  };

  const handleDeleteJournal = async (id: string) => {
    try {
      const res = await api.deleteJournal(id, currentUser?.id);
      if (res.success) {
        setJournalEntries(prev => prev.filter(e => e.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-sage-700 font-semibold text-xs mb-1">
            <Heart className="w-4 h-4 fill-sage-600 text-sage-600" />
            <span>Confidential & Non-Judgmental Space</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">Mental Wellbeing Sanctuary</h1>
          <p className="text-xs text-slate-500">
            A reflective space to honor your thoughts, track your recovery rhythms, and write freely.
          </p>
        </div>

        <button
          onClick={onOpenCrisisModal}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold transition-all shrink-0"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Talk to Someone 24x7 (14416)</span>
        </button>
      </div>

      {/* Non-Diagnostic Ethical Guardrail Notice */}
      <div className="p-4 rounded-2xl bg-lavender-50/80 border border-lavender-100 text-xs text-lavender-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-lavender-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Transparent Wellbeing Principle: </span>
          MindSpring reflections are self-guided tools to help you notice stress patterns. We never diagnose medical conditions, score you against other students, or use AI to predict clinical risk. If you ever feel you need a caring listening ear, professional counsellors are warmly recommended.
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveSubTab('reflection')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === 'reflection'
              ? 'bg-sage-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Weekly Reflection Check-In
        </button>
        <button
          onClick={() => setActiveSubTab('trends')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === 'trends'
              ? 'bg-sage-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Historical Trends ({assessments.length})
        </button>
        <button
          onClick={() => setActiveSubTab('journal')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === 'journal'
              ? 'bg-sage-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Private Journal ({journalEntries.length})
        </button>
      </div>

      {/* Sub Tab 1: Weekly Reflection Questionnaire */}
      {activeSubTab === 'reflection' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2">
            <form onSubmit={handleAssessmentSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-lavender-100 shadow-card space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-800">Weekly Check-In Questionnaire</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Rate how things have felt over the past 7 days. There are no right or wrong answers.
                </p>
              </div>

              {/* Questions */}
              <div className="space-y-5">
                {[
                  { label: 'Overall Mood & Emotional Outlook', val: moodScore, setVal: setMoodScore, low: 'Heavy / Low', high: 'Bright / Hopeful' },
                  { label: 'Stress & Overwhelm Level', val: stressScore, setVal: setStressScore, low: 'Manageable / Calm', high: 'Intense / Overwhelming' },
                  { label: 'Sleep Quality & Restfulness', val: sleepScore, setVal: setSleepScore, low: 'Fragmented / < 5 hrs', high: 'Deep / Restful (7+ hrs)' },
                  { label: 'Daily Energy & Stamina', val: energyScore, setVal: setEnergyScore, low: 'Depleted / Drained', high: 'Vibrant / Steady' },
                  { label: 'Connection with Family / Friends', val: socialScore, setVal: setSocialScore, low: 'Isolated / Distant', high: 'Supported / Connected' },
                  { label: 'Academic & Exam Pressure Felt', val: pressureScore, setVal: setPressureScore, low: 'Balanced', high: 'Crushing Expectations' },
                  { label: 'Access to Support (Someone who listens)', val: supportScore, setVal: setSupportScore, low: 'Feel alone', high: 'Have people I trust' }
                ].map((q, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                      <span>{idx + 1}. {q.label}</span>
                      <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800">
                        {q.val} / 5
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={q.val}
                      onChange={e => q.setVal(Number(e.target.value))}
                      className="w-full accent-sage-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>{q.low}</span>
                      <span>{q.high}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Optional Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Optional Reflection Notes
                </label>
                <textarea
                  placeholder="Anything specific that happened this week you'd like to acknowledge? (e.g., tough mock test, good study rhythm, feeling tired after coaching)"
                  value={reflectionNotes}
                  onChange={e => setReflectionNotes(e.target.value)}
                  className="w-full p-3 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  rows={3}
                />
              </div>

              <button
                type="submit"
                disabled={submittingAssessment}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-sage-600 to-emerald-600 hover:from-sage-700 hover:to-emerald-700 text-white font-bold text-sm shadow-md shadow-sage-200 transition-all active:scale-95 disabled:opacity-50"
              >
                {submittingAssessment ? 'Analyzing Reflection...' : 'Submit Reflection & Get Insights'}
              </button>
            </form>
          </div>

          {/* Feedback Card */}
          <div className="space-y-6">
            {latestFeedback ? (
              <div className="bg-white rounded-3xl p-6 border border-sage-200 shadow-card space-y-4 animate-in fade-in">
                <div className="flex items-center gap-2 text-sage-800 font-bold text-sm">
                  <Sparkles className="w-5 h-5 text-sage-600" />
                  <span>Supportive Feedback</span>
                </div>

                <div className="p-4 rounded-2xl bg-sage-50 border border-sage-100">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span>Wellbeing Harmony Index</span>
                    <span className="font-extrabold text-sage-800 text-sm">{latestFeedback.overallIndex} / 100</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sage-600 h-full rounded-full transition-all duration-700"
                      style={{ width: `${latestFeedback.overallIndex}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-slate-700 leading-relaxed space-y-2">
                  <p className="font-medium">{latestFeedback.summaryFeedback}</p>
                  <p className="text-slate-600"><span className="font-bold text-slate-800">Coping Thought: </span>{latestFeedback.recommendation}</p>
                </div>

                {latestFeedback.consultationSuggested && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                    <p className="font-bold mb-1">Gentle Recommendation</p>
                    <p>High academic pressure detected. We recommend booking a free, confidential chat with a school counsellor.</p>
                    <button
                      onClick={() => onNavigateTab('support')}
                      className="mt-2 text-xs font-bold text-amber-800 underline"
                    >
                      Connect with a counsellor →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-6 border border-lavender-100 shadow-card text-center text-slate-500 text-xs leading-relaxed">
                <HelpCircle className="w-8 h-8 text-lavender-400 mx-auto mb-2" />
                <p className="font-bold text-slate-700">Submit Your Check-In</p>
                <p className="mt-1">Fill out the questionnaire on the left to receive non-judgmental feedback and personalized coping insights.</p>
              </div>
            )}

            {/* Quick Coping Cards */}
            <div className="bg-white rounded-3xl p-6 border border-lavender-100 shadow-card space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Scientifically Grounded Routines</h4>
              {[
                { title: 'The 90-Minute Focus Ultradian Rhythm', desc: 'Brain focus peaks in 90-minute waves. Always take a 15-minute break after 90 minutes to maintain neuroplasticity.' },
                { title: 'Visual Horizon Reset', desc: 'Looking at the sky or across a room decreases sympathetic nervous system activation and lowers cortisol.' }
              ].map((r, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <p className="font-bold text-slate-800">{r.title}</p>
                  <p className="text-slate-500 text-[11px] mt-1">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Sub Tab 2: Historical Trends */}
      {activeSubTab === 'trends' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-lavender-100 shadow-card">
            <h3 className="text-base font-bold text-slate-800 mb-1">Historical Check-In Log</h3>
            <p className="text-xs text-slate-500 mb-6">Review your personal wellbeing rhythm over past weeks</p>

            <div className="space-y-4">
              {assessments.map(item => (
                <div key={item.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-lavender-200 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold text-slate-800">Week of {item.date}</span>
                    </div>
                    <span className="text-xs font-black text-sage-700 bg-sage-50 px-2.5 py-1 rounded-full border border-sage-200">
                      Wellbeing Index: {item.overallIndex} / 100
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 mt-3 leading-relaxed">{item.summaryFeedback}</p>
                  <p className="text-xs text-slate-500 mt-1.5"><span className="font-bold text-slate-700">Takeaway: </span>{item.recommendation}</p>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4 pt-3 border-t border-slate-100 text-center text-[10px]">
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-400 block">Mood</span>
                      <span className="font-bold text-slate-800">{item.scores.mood}/5</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-400 block">Sleep</span>
                      <span className="font-bold text-slate-800">{item.scores.sleep}/5</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-400 block">Energy</span>
                      <span className="font-bold text-slate-800">{item.scores.energy}/5</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-400 block">Stress</span>
                      <span className="font-bold text-slate-800">{item.scores.stress}/5</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-400 block">Pressure</span>
                      <span className="font-bold text-slate-800">{item.scores.academicPressure}/5</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-400 block">Support</span>
                      <span className="font-bold text-slate-800">{item.scores.supportAccess}/5</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 3: Private Journal */}
      {activeSubTab === 'journal' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              <p className="text-xs text-slate-600">
                End-to-end private to you. Never shared with parents or teachers.
              </p>
            </div>
            <button
              onClick={() => setShowAddJournal(!showAddJournal)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sage-600 text-white font-bold text-xs hover:bg-sage-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Write Private Entry</span>
            </button>
          </div>

          {showAddJournal && (
            <form onSubmit={handleAddJournal} className="p-6 rounded-3xl bg-sage-50/70 border border-sage-200 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  placeholder="Entry Title (e.g., Releasing today's mock anxiety)"
                  value={journalTitle}
                  onChange={e => setJournalTitle(e.target.value)}
                  className="w-2/3 px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                />
                <select
                  value={journalMood}
                  onChange={e => setJournalMood(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Calm">Mood: Calm 🌿</option>
                  <option value="Hopeful">Mood: Hopeful ✨</option>
                  <option value="Tired">Mood: Tired 😴</option>
                  <option value="Anxious">Mood: Anxious 🌧️</option>
                  <option value="Grateful">Mood: Grateful 🙏</option>
                </select>
              </div>
              <textarea
                placeholder="Write whatever is in your heart. No one is grading this. Let your thoughts flow freely..."
                value={journalContent}
                onChange={e => setJournalContent(e.target.value)}
                className="w-full p-3.5 text-xs rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sage-400"
                rows={5}
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddJournal(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-sage-600 text-white font-bold text-xs shadow-sm"
                >
                  Save Entry
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {journalEntries.map(entry => (
              <div key={entry.id} className="bg-white rounded-3xl p-5 border border-lavender-100 shadow-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sage-50 text-sage-800 border border-sage-200">
                      {entry.mood}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">{entry.title}</h4>
                  <p className="text-xs text-slate-600 mt-2 whitespace-pre-line leading-relaxed">
                    {entry.content}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-500" /> Private
                  </span>
                  <button
                    onClick={() => handleDeleteJournal(entry.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    title="Delete entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
