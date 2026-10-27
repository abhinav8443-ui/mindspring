import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Play, 
  Calendar, 
  TrendingUp, 
  Clock, 
  Heart, 
  Smile, 
  ShieldAlert, 
  ArrowRight,
  BookOpen,
  Coffee,
  Check,
  Plus
} from 'lucide-react';
import { User, SubjectProgress, StudyTask, MockTest, MoodLog } from '../types';
import { api } from '../services/api';
import { PomodoroModal } from '../components/PomodoroModal';
import confetti from 'canvas-confetti';

interface StudentDashboardProps {
  currentUser: User | null;
  onNavigateTab: (tab: string) => void;
  onOpenCrisisModal: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ currentUser, onNavigateTab, onOpenCrisisModal }) => {
  const [syllabus, setSyllabus] = useState<SubjectProgress[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [moodEnergy, setMoodEnergy] = useState<number>(3);
  const [moodNote, setMoodNote] = useState<string>('');
  const [moodSubmitted, setMoodSubmitted] = useState<boolean>(false);
  const [activeTaskForTimer, setActiveTaskForTimer] = useState<StudyTask | null>(null);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState<boolean>(false);

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    try {
      const studentId = currentUser?.id || 'student-1';
      const [sylRes, taskRes, mockRes, moodRes] = await Promise.all([
        api.getSyllabus(studentId),
        api.getTasks(studentId),
        api.getMockTests(studentId),
        api.getMoods(studentId)
      ]);
      setSyllabus(sylRes.syllabus || []);
      setTasks(taskRes.tasks || []);
      setMockTests(mockRes.tests || []);
      setMoodLogs(moodRes.moodHistory || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      const res = await api.toggleTask(taskId, currentUser?.id);
      if (res.success) {
        setTasks(prev => prev.map(t => t.id === taskId ? res.task : t));
        if (res.task.completed) {
          try {
            confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleIncrementChapter = async (subjectId: string) => {
    try {
      const res = await api.incrementSubject(subjectId, currentUser?.id);
      if (res.success) {
        setSyllabus(prev => prev.map(s => s.id === subjectId ? res.subject : s));
      }
    } catch (err) {
      console.error('Failed to update chapter:', err);
    }
  };

  const handleMoodSubmit = async () => {
    if (!selectedMood) return;
    try {
      const res = await api.logMood({
        mood: selectedMood as any,
        energy: moodEnergy,
        level: selectedMood === 'Great' ? 5 : selectedMood === 'Good' ? 4 : selectedMood === 'Okay' ? 3 : 2,
        note: moodNote,
        tags: [selectedMood]
      }, currentUser?.id);
      if (res.success) {
        setMoodSubmitted(true);
        loadDashboardData();
      }
    } catch (err) {
      console.error('Failed to submit mood:', err);
    }
  };

  const completedTasksCount = tasks.filter(t => t.completed).length;
  const totalTasksCount = tasks.length;
  const taskCompletionPercent = totalTasksCount ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Welcoming Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-lavender-700 via-purple-700 to-indigo-800 p-6 sm:p-8 text-white shadow-xl shadow-lavender-200">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-lavender-200" />
            <span>Target Goal: {currentUser?.examGoal || 'JEE Main & Advanced 2027'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser?.name?.split(' ')[0] || 'Scholar'}!
          </h1>
          <p className="text-lavender-100 text-xs sm:text-sm mt-2 leading-relaxed">
            "True preparation isn't about running until you break. It is built on steady habits, honest rest, and self-compassion on hard days."
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => setIsPomodoroOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-lavender-900 font-bold text-xs sm:text-sm shadow-md hover:bg-lavender-50 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-lavender-800 text-lavender-800" />
              <span>Start 25m Focus Block</span>
            </button>
            <button
              onClick={() => onNavigateTab('companion')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-lavender-600/60 hover:bg-lavender-600 border border-white/30 text-white font-medium text-xs sm:text-sm backdrop-blur-sm transition-all"
            >
              <span>Talk with AI Companion</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-lavender-100 shadow-soft">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Today's Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-800">{completedTasksCount} / {totalTasksCount}</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${taskCompletionPercent}%` }} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-lavender-100 shadow-soft">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Study Streak</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-800">14 Days</p>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">Consistent rhythm 🔥</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-lavender-100 shadow-soft">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Daily Goal</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-800">{currentUser?.dailyTargetHours || 6.5} hrs</p>
          <p className="text-[11px] text-slate-400 mt-1">Balanced target</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-lavender-100 shadow-soft">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Next Mock Test</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-800">3 Days</p>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">Full Syllabus #5</p>
        </div>
      </div>

      {/* 3. Main Dashboard Grid: Left Academic Column, Right Wellbeing Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Academic Preparation */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Today's Study Plan */}
          <div className="bg-white rounded-3xl p-6 border border-lavender-100 shadow-card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Today's Study Plan</h2>
                <p className="text-xs text-slate-500">Prioritized for memory retention and sustainable focus</p>
              </div>
              <button
                onClick={() => onNavigateTab('academic')}
                className="text-xs font-bold text-lavender-600 hover:text-lavender-800 flex items-center gap-1"
              >
                <span>Full Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    task.completed
                      ? 'bg-slate-50/70 border-slate-200 text-slate-400'
                      : 'bg-white border-lavender-100 hover:border-lavender-300 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-lavender-600 transition-colors"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-lavender-50 text-lavender-700 border border-lavender-100">
                          {task.subject}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">{task.scheduledTime}</span>
                      </div>
                      <p className={`text-xs sm:text-sm font-medium mt-1 ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {task.task}
                      </p>
                    </div>
                  </div>

                  {!task.completed && (
                    <button
                      onClick={() => {
                        setActiveTaskForTimer(task);
                        setIsPomodoroOpen(true);
                      }}
                      className="p-2 rounded-xl text-lavender-600 bg-lavender-50 hover:bg-lavender-100 transition-colors shrink-0"
                      title="Focus on this task"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Subject Syllabus Progress */}
          <div className="bg-white rounded-3xl p-6 border border-lavender-100 shadow-card">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Syllabus Coverage</h2>
                <p className="text-xs text-slate-500">Track chapter completion at your own pace</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Exam Goal: {currentUser?.examGoal || 'JEE Main'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {syllabus.map(sub => (
                <div key={sub.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-slate-800">{sub.name}</span>
                      <span className="text-xs font-black text-lavender-600">{sub.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-3">
                      <div
                        className="bg-gradient-to-r from-lavender-500 to-purple-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${sub.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      {sub.completedChapters} of {sub.totalChapters} chapters done
                    </p>
                  </div>
                  <button
                    onClick={() => handleIncrementChapter(sub.id)}
                    className="mt-4 w-full py-1.5 px-3 rounded-xl bg-white border border-slate-200 hover:border-lavender-300 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1 shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+1 Chapter Done</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Mock Test Performance */}
          <div className="bg-white rounded-3xl p-6 border border-lavender-100 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Recent Mock Tests</h2>
                <p className="text-xs text-slate-500">Use mocks to diagnose concept gaps, not to judge your worth</p>
              </div>
              <button
                onClick={() => onNavigateTab('academic')}
                className="text-xs font-bold text-lavender-600 hover:text-lavender-800"
              >
                Mistake Notebook →
              </button>
            </div>

            <div className="space-y-3">
              {mockTests.slice(0, 2).map(test => (
                <div key={test.id} className="p-4 rounded-2xl border border-slate-100 bg-white hover:border-lavender-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">{test.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Date: {test.date} • {test.notes}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-slate-800">{test.score} / {test.totalMarks}</p>
                      <p className="text-[11px] text-emerald-600 font-bold">{test.percentile} %ile</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Dedicated Mental Wellbeing & Self-Care */}
        <div className="space-y-6">
          
          {/* Daily Mood Check-In Widget */}
          <div className="bg-gradient-to-br from-sage-50 via-white to-lavender-50 rounded-3xl p-6 border border-sage-100 shadow-card">
            <div className="flex items-center gap-2 mb-2 text-sage-800">
              <Heart className="w-4 h-4 fill-sage-500 text-sage-500" />
              <h2 className="text-base font-bold">Daily Mood Check-In</h2>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              How is your energy and mind feeling right now? Checking in takes 10 seconds.
            </p>

            {moodSubmitted ? (
              <div className="p-4 rounded-2xl bg-sage-100/70 border border-sage-200 text-center animate-in fade-in">
                <CheckCircle2 className="w-8 h-8 text-sage-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-sage-800">Check-in logged for today!</p>
                <p className="text-[11px] text-sage-600 mt-1">Thank you for pausing and listening to yourself.</p>
                <button
                  onClick={() => setMoodSubmitted(false)}
                  className="mt-3 text-xs text-sage-700 underline font-medium"
                >
                  Update check-in
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { label: 'Great', emoji: '🌟' },
                    { label: 'Good', emoji: '😊' },
                    { label: 'Okay', emoji: '😐' },
                    { label: 'Stressed', emoji: '😰' },
                    { label: 'Exhausted', emoji: '😴' }
                  ].map(m => (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => setSelectedMood(m.label)}
                      className={`p-2 rounded-xl text-center transition-all ${
                        selectedMood === m.label
                          ? 'bg-sage-600 text-white shadow-md scale-105'
                          : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-xl block">{m.emoji}</span>
                      <span className="text-[10px] font-bold block mt-1 truncate">{m.label}</span>
                    </button>
                  ))}
                </div>

                {selectedMood && (
                  <div className="space-y-3 animate-in fade-in">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Energy Level (1-5): {moodEnergy}/5
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={moodEnergy}
                        onChange={e => setMoodEnergy(Number(e.target.value))}
                        className="w-full accent-sage-600 cursor-pointer"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Optional note: What is on your mind?"
                      value={moodNote}
                      onChange={e => setMoodNote(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sage-400"
                    />
                    <button
                      onClick={handleMoodSubmit}
                      className="w-full py-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs shadow-md shadow-sage-200 transition-all"
                    >
                      Save Daily Check-In
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Weekly Wellbeing Reflection Callout */}
          <div className="bg-white rounded-3xl p-6 border border-lavender-100 shadow-card">
            <div className="flex items-center gap-2 mb-2 text-lavender-700">
              <Sparkles className="w-4 h-4" />
              <h2 className="text-base font-bold">Weekly Reflection</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Take 3 minutes to reflect on sleep, stress, and academic pressure. Get personalized, non-judgmental guidance.
            </p>
            <button
              onClick={() => onNavigateTab('wellbeing')}
              className="w-full py-2.5 rounded-xl bg-lavender-50 hover:bg-lavender-100 text-lavender-800 font-bold text-xs border border-lavender-200 transition-all flex items-center justify-center gap-2"
            >
              <span>Take Weekly Check-In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Recommended Breaks & Self-Care */}
          <div className="bg-white rounded-3xl p-6 border border-lavender-100 shadow-card">
            <div className="flex items-center gap-2 mb-3 text-slate-800">
              <Coffee className="w-4 h-4 text-amber-600" />
              <h2 className="text-base font-bold">Mindful Micro-Breaks</h2>
            </div>
            <div className="space-y-2.5">
              {[
                { title: '20-20-20 Eye Rest', desc: 'Look at an object 20 feet away for 20 seconds to relax ocular muscles.' },
                { title: 'Hydration Reset', desc: 'Drink a glass of water. Brain cells are 73% water; dehydration drops focus.' },
                { title: '5-Minute Box Breathing', desc: 'Inhale 4s, Hold 4s, Exhale 4s, Hold 4s to reset the vagus nerve.' }
              ].map((b, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <h3 className="text-xs font-bold text-slate-800">{b.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{b.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateTab('games')}
              className="mt-4 w-full py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
            >
              Explore 4 Wellbeing Games →
            </button>
          </div>

          {/* Support Safety Banner */}
          <div className="p-5 rounded-3xl bg-rose-50/70 border border-rose-200">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs mb-1">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Always Here For You</span>
            </div>
            <p className="text-xs text-rose-900 leading-relaxed mb-3">
              If exam stress feels unmanageable, you don't have to carry it in silence. Free, confidential support is available 24x7.
            </p>
            <button
              onClick={onOpenCrisisModal}
              className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors"
            >
              View Free Crisis Helplines (14416)
            </button>
          </div>

        </div>

      </div>

      {/* Pomodoro Focus Modal */}
      <PomodoroModal
        isOpen={isPomodoroOpen}
        onClose={() => setIsPomodoroOpen(false)}
        taskTitle={activeTaskForTimer?.task}
        onCompleteTask={() => {
          if (activeTaskForTimer) {
            handleToggleTask(activeTaskForTimer.id);
          }
        }}
      />

    </div>
  );
};
