import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Heart, 
  Smile, 
  ShieldAlert, 
  ArrowRight, 
  Coffee, 
  Bot, 
  Gamepad2, 
  Wind, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Calendar, 
  Flame, 
  BookOpen, 
  Sun,
  ShieldCheck,
  PhoneCall,
  CheckSquare,
  Check,
  Bell,
  Clock,
  Plus
} from 'lucide-react';
import { User, MoodLog, TodoTask } from '../types';
import { api } from '../services/api';
import { soundscapes } from '../utils/audioSynthesis';
import confetti from 'canvas-confetti';

interface StudentDashboardProps {
  currentUser: User | null;
  onNavigateTab: (tab: string) => void;
  onOpenCrisisModal: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ currentUser, onNavigateTab, onOpenCrisisModal }) => {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [moodEnergy, setMoodEnergy] = useState<number>(3);
  const [moodNote, setMoodNote] = useState<string>('');
  const [moodSubmitted, setMoodSubmitted] = useState<boolean>(false);
  const [activeSound, setActiveSound] = useState<string | null>(null);

  // Quick 60-second breathing orb
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathCount, setBreathCount] = useState<number>(4);
  const [isBreathActive, setIsBreathActive] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isBreathActive) {
      interval = setInterval(() => {
        setBreathCount(prev => {
          if (prev <= 1) {
            setBreathPhase(curr => {
              if (curr === 'Inhale') return 'Hold';
              if (curr === 'Hold') return 'Exhale';
              if (curr === 'Exhale') return 'Rest';
              return 'Inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathActive]);

  const handleMoodSubmit = async () => {
    if (!selectedMood) return;
    try {
      await api.logMood({
        mood: selectedMood as any,
        energy: moodEnergy,
        level: selectedMood === 'Great' ? 5 : selectedMood === 'Good' ? 4 : selectedMood === 'Okay' ? 3 : 2,
        note: moodNote,
        tags: [selectedMood]
      }, currentUser?.id);
      setMoodSubmitted(true);
      try {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
      } catch (e) {}
    } catch (err) {
      console.error('Failed to submit mood:', err);
    }
  };

  const [todayTasks, setTodayTasks] = useState<TodoTask[]>([]);
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadTodayTasks();
  }, [currentUser]);

  const loadTodayTasks = async () => {
    try {
      const res = await api.getTodoTasks(currentUser?.id, { date: todayStr });
      setTodayTasks(res.tasks || []);
    } catch (e) {
      console.error('Failed to load today tasks:', e);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      const res = await api.toggleTodoTask(taskId, currentUser?.id);
      if (res.success) {
        setTodayTasks(prev => prev.map(t => t.id === taskId ? res.task : t));
        if (res.task.completed) {
          try {
            confetti({ particleCount: 30, spread: 45, origin: { y: 0.8 } });
          } catch (e) {}
        }
      }
    } catch (e) {
      console.error('Failed to toggle task:', e);
    }
  };

  const toggleSound = (type: 'rain' | 'bowl' | 'breeze') => {
    if (activeSound === type) {
      soundscapes.stopAmbient();
      setActiveSound(null);
    } else {
      soundscapes.playAmbient(type);
      setActiveSound(type);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Serene Sanctuary Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-lavender-700 via-purple-700 to-sage-700 p-6 sm:p-10 text-white shadow-xl shadow-lavender-200">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3 border border-white/20">
            <Heart className="w-3.5 h-3.5 fill-rose-300 text-rose-300" />
            <span>A Safe Mental Sanctuary for Students</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Take a deep breath, {currentUser?.name?.split(' ')[0] || 'friend'}.
          </h1>
          <p className="text-lavender-100 text-xs sm:text-base mt-3 leading-relaxed">
            You don't have to study right now. MindSpring is your quiet retreat from endless coaching pressure, competition, and mock test panic. You are human first, not a test score.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onNavigateTab('companion')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-lavender-900 font-bold text-xs sm:text-sm shadow-md hover:bg-lavender-50 transition-all active:scale-95"
            >
              <Bot className="w-4 h-4 text-lavender-700" />
              <span>Talk with AI Companion</span>
            </button>
            <button
              onClick={() => onNavigateTab('games')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-lavender-600/60 hover:bg-lavender-600 border border-white/30 text-white font-semibold text-xs sm:text-sm backdrop-blur-sm transition-all"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Play Calming Wellbeing Games</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Ambient Soundscape & Breath Reset Bar */}
      <div className="bg-white rounded-3xl p-5 border border-lavender-100 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sage-50 text-sage-700 flex items-center justify-center">
            <Sun className="w-5 h-5 text-sage-600" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800">Soothing Ambient Soundscapes</h3>
            <p className="text-[11px] text-slate-500">Play in the background while you relax or write</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => toggleSound('rain')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeSound === 'rain' ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {activeSound === 'rain' ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : '🌧️'}
            <span>Gentle Rain</span>
          </button>
          <button
            onClick={() => toggleSound('bowl')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeSound === 'bowl' ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {activeSound === 'bowl' ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : '🧘'}
            <span>Tibetan Singing Bowl</span>
          </button>
          <button
            onClick={() => toggleSound('breeze')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeSound === 'breeze' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {activeSound === 'breeze' ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : '🍃'}
            <span>Forest Breeze</span>
          </button>
          {activeSound && (
            <button
              onClick={() => toggleSound(activeSound as any)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              title="Stop sound"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Core Sanctuary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Emotional Check-in & AI Companion Lounge */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Daily Mood & Emotional Check-In Widget */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sage-100 shadow-card space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-sage-800 font-bold text-sm">
                  <Heart className="w-4 h-4 fill-sage-600 text-sage-600" />
                  <span>How is your heart and mind feeling today?</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Honest self-awareness is the highest form of self-care. There are no right or wrong feelings.
                </p>
              </div>
            </div>

            {moodSubmitted ? (
              <div className="p-5 rounded-2xl bg-sage-50 border border-sage-200 text-center animate-in fade-in space-y-2">
                <CheckCircle2 className="w-8 h-8 text-sage-600 mx-auto" />
                <h4 className="text-sm font-bold text-sage-900">Check-In Saved with Care</h4>
                <p className="text-xs text-sage-700">
                  Thank you for pausing and acknowledging how you feel. Remember to drink water and unclench your jaw.
                </p>
                <button
                  onClick={() => setMoodSubmitted(false)}
                  className="text-xs font-semibold text-sage-800 underline mt-2 inline-block"
                >
                  Update your mood
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { label: 'Peaceful', emoji: '🌿', desc: 'Calm & grounded' },
                    { label: 'Hopeful', emoji: '✨', desc: 'Quiet optimism' },
                    { label: 'Okay', emoji: '😐', desc: 'Just getting by' },
                    { label: 'Stressed', emoji: '😰', desc: 'Test pressure' },
                    { label: 'Exhausted', emoji: '😴', desc: 'Need deep rest' }
                  ].map(m => (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => setSelectedMood(m.label)}
                      className={`p-3.5 rounded-2xl text-center transition-all ${
                        selectedMood === m.label
                          ? 'bg-sage-600 text-white shadow-md scale-105'
                          : 'bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{m.emoji}</span>
                      <p className="text-xs font-bold truncate">{m.label}</p>
                      <p className="text-[10px] opacity-80 mt-0.5 truncate">{m.desc}</p>
                    </button>
                  ))}
                </div>

                {selectedMood && (
                  <div className="space-y-3 pt-2 animate-in fade-in">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Current Energy Reserve: {moodEnergy}/5
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
                      placeholder="Optional: Want to write one sentence about what is on your mind?"
                      value={moodNote}
                      onChange={e => setMoodNote(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sage-400"
                    />
                    <button
                      onClick={handleMoodSubmit}
                      className="w-full py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs shadow-md shadow-sage-200 transition-all"
                    >
                      Save Check-In
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Wellbeing Companion Quick Lounge */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-lavender-100 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-lavender-700 font-bold text-sm">
                  <Bot className="w-4 h-4" />
                  <span>Talk with AI Companion</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-800 mt-1">Choose a Caring Voice to Chat With</h3>
              </div>
              <button
                onClick={() => onNavigateTab('companion')}
                className="text-xs font-bold text-lavender-600 hover:text-lavender-800 flex items-center gap-1"
              >
                <span>Full Chatroom</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                {
                  id: 'champion_ronaldo',
                  name: 'Champion Spirit (CR7)',
                  avatar: '⚡',
                  quote: '"Siuuu! Keep your head up, champion! Consistent habits beat temporary doubt every single day."',
                  color: 'hover:border-amber-300'
                },
                {
                  id: 'mickey_pal',
                  name: 'Cheerful Pal (Mickey)',
                  avatar: '🎈',
                  quote: '"Oh boy, pal! Every tough problem is just a puzzle waiting for a friendly team solution!"',
                  color: 'hover:border-rose-300'
                },
                {
                  id: 'anime_sensei',
                  name: 'Inspiring Anime Sensei',
                  avatar: '⚔️',
                  quote: '"This exam is merely one training arc in your epic story. Master your inner calm."',
                  color: 'hover:border-purple-300'
                },
                {
                  id: 'calm_friend',
                  name: 'Calm, Thoughtful Friend',
                  avatar: '☕',
                  quote: '"You do not have to prove anything to me right now. I am right here with you."',
                  color: 'hover:border-sky-300'
                }
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => onNavigateTab('companion')}
                  className={`p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white text-left transition-all ${c.color} flex flex-col justify-between`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{c.avatar}</span>
                    <span className="font-bold text-xs text-slate-800">{c.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 italic leading-snug">{c.quote}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 4 Interactive Games Showcase */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-lavender-100 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
                  <Gamepad2 className="w-4 h-4" />
                  <span>Playful Mindful Resets</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-800 mt-1">Four Interactive Wellbeing Games</h3>
              </div>
              <button
                onClick={() => onNavigateTab('games')}
                className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
              >
                <span>Play Games</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { title: 'Pattern & Focus', icon: '🌸', desc: 'Harmonic chimes memory' },
                { title: 'Emotion Garden', icon: '🌿', desc: 'Plant compassion blooms' },
                { title: 'Choices & Stories', icon: '📖', desc: 'Exam dilemma scenarios' },
                { title: 'Calm Break', icon: '🧘', desc: 'Box breath & soundscapes' }
              ].map((g, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigateTab('games')}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-purple-200 hover:bg-white text-left transition-all"
                >
                  <span className="text-2xl block mb-1">{g.icon}</span>
                  <h4 className="text-xs font-bold text-slate-800">{g.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{g.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Today's To-Do & Reminders Dashboard Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-lavender-100 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-lavender-700 font-bold text-sm">
                  <CheckSquare className="w-4 h-4" />
                  <span>Today's To-Do & Gentle Reminders</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-800 mt-0.5">
                  {todayTasks.filter(t => t.completed).length} of {todayTasks.length} Completed Today
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('planner')}
                className="text-xs font-bold text-lavender-700 hover:text-lavender-900 flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Open To-Do Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todayTasks.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
                <p className="text-xs text-slate-500">
                  No tasks scheduled for today. Enjoy a quiet recovery day, or plan a small task.
                </p>
                <button
                  onClick={() => onNavigateTab('planner')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lavender-600 hover:bg-lavender-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Plan a Task</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayTasks.slice(0, 4).map(task => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      task.completed ? 'bg-slate-50/70 border-slate-200 opacity-75' : 'bg-white border-slate-200 hover:border-lavender-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${
                          task.completed ? 'bg-sage-600 text-white' : 'border border-slate-300'
                        }`}
                      >
                        {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </button>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{task.category}</span>
                          {task.startTime && (
                            <span className="flex items-center gap-0.5">
                              &bull; <Clock className="w-3 h-3 inline" /> {task.startTime}
                            </span>
                          )}
                          {task.reminderMinutesBefore !== undefined && (
                            <span className="flex items-center gap-0.5 text-lavender-600 font-semibold">
                              &bull; <Bell className="w-2.5 h-2.5 inline" /> {task.reminderMinutesBefore === 0 ? 'Now' : `${task.reminderMinutesBefore}m`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border shrink-0 ${
                      task.priority === 'high' 
                        ? 'bg-red-50 text-red-700 border-red-200' 
                        : task.priority === 'medium'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-sky-50 text-sky-700 border-sky-200'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: 60-Second Breathing, Self-Care Insights & Schedule Nudge */}
        <div className="space-y-6">
          
          {/* Quick Guided Breathing Circle */}
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-card text-center space-y-4">
            <div className="flex items-center justify-center gap-1.5 text-sky-700 font-bold text-xs">
              <Wind className="w-4 h-4" />
              <span>Instant Nervous System Reset</span>
            </div>

            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-tr from-sky-300 to-indigo-400 opacity-20 transition-all duration-1000 ${
                  isBreathActive && breathPhase === 'Inhale'
                    ? 'scale-125'
                    : isBreathActive && breathPhase === 'Exhale'
                    ? 'scale-75'
                    : 'scale-100'
                }`}
              />
              <div className="relative z-10">
                <span className="text-base font-extrabold text-slate-800 block">
                  {breathPhase}
                </span>
                <span className="text-2xl font-black text-sky-600 font-mono mt-0.5 block">
                  {breathCount}s
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsBreathActive(!isBreathActive)}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              {isBreathActive ? 'Pause Breath Guide' : 'Start 60-Second Breathing'}
            </button>
          </div>

          {/* Mental Wellbeing Mantras for Exam Aspirants */}
          <div className="bg-white rounded-3xl p-6 border border-lavender-100 shadow-card space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Remember When Pressure Rises</h4>
            <div className="space-y-2.5">
              {[
                { title: 'Sleep is Brain Consolidation', desc: 'Long-term memory is formed in slow-wave sleep. 7 hours of rest beats 4 hours of drowsy cramming.' },
                { title: 'The Comparison Trap', desc: 'Others may boast or project confidence. The only trajectory that matters is your personal quiet growth.' },
                { title: 'You Are More Than an Exam', desc: 'No rank defines your capability, your heart, or the love of the people who matter.' }
              ].map((m, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-800">{m.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* To-Do Planner Shortcut Card */}
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-2.5 text-left">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
              <CheckSquare className="w-4 h-4 text-lavender-600" />
              <span>To-Do Planner (Daily & Monthly)</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Plan tasks for today or map your month on an interactive calendar with audio alarms and notifications. Zero syllabus pressure.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onNavigateTab('planner')}
                className="text-xs font-bold text-lavender-700 hover:text-lavender-900 flex items-center gap-1"
              >
                <span>Open Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 24x7 Crisis Support Card */}
          <div className="p-5 rounded-3xl bg-rose-50/80 border border-rose-200 space-y-2">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Free 24x7 Confidential Help</span>
            </div>
            <p className="text-[11px] text-rose-900 leading-relaxed">
              If feelings feel heavy or unbearable, human counsellors are ready to listen without judgment.
            </p>
            <button
              onClick={onOpenCrisisModal}
              className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Tele-MANAS (14416)</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
