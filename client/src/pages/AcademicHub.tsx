import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  ListPlus, 
  Flame, 
  Play, 
  Plus, 
  Clock, 
  FileText,
  BarChart3,
  BookmarkCheck,
  Check
} from 'lucide-react';
import { User, SubjectProgress, StudyTask, MockTest, MistakeEntry, BacklogItem, RevisionItem } from '../types';
import { api } from '../services/api';
import { PomodoroModal } from '../components/PomodoroModal';
import confetti from 'canvas-confetti';

interface AcademicHubProps {
  currentUser: User | null;
}

export const AcademicHub: React.FC<AcademicHubProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'planner' | 'revision' | 'mistakes' | 'backlogs'>('syllabus');
  const [syllabus, setSyllabus] = useState<SubjectProgress[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [mockTests, setMockTests] = useState<MockTest[]>([]);
  const [mistakes, setMistakes] = useState<MistakeEntry[]>([]);
  const [backlogs, setBacklogs] = useState<BacklogItem[]>([]);
  const [revision, setRevision] = useState<RevisionItem[]>([]);

  // Modals & forms
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [timerTaskTitle, setTimerTaskTitle] = useState('Focused Study Block');
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskSubject, setNewTaskSubject] = useState('Physics');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState('45');
  const [newTaskTime, setNewTaskTime] = useState('04:00 PM');

  const [showAddMistake, setShowAddMistake] = useState(false);
  const [newMistakeSubject, setNewMistakeSubject] = useState('Physics');
  const [newMistakeTopic, setNewMistakeTopic] = useState('');
  const [newMistakeType, setNewMistakeType] = useState<'Calculation Mistake' | 'Conceptual Error' | 'Silly Error' | 'Time Crunch'>('Conceptual Error');
  const [newMistakeDesc, setNewMistakeDesc] = useState('');
  const [newMistakeSolution, setNewMistakeSolution] = useState('');

  const [showAddMock, setShowAddMock] = useState(false);
  const [newMockTitle, setNewMockTitle] = useState('');
  const [newMockScore, setNewMockScore] = useState('');
  const [newMockTotal, setNewMockTotal] = useState('300');
  const [newMockPercentile, setNewMockPercentile] = useState('');
  const [newMockNotes, setNewMockNotes] = useState('');

  const [showAddBacklog, setShowAddBacklog] = useState(false);
  const [newBacklogSubject, setNewBacklogSubject] = useState('Mathematics');
  const [newBacklogChapter, setNewBacklogChapter] = useState('');
  const [newBacklogUrgency, setNewBacklogUrgency] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newBacklogHours, setNewBacklogHours] = useState('3');

  useEffect(() => {
    loadAcademicData();
  }, [currentUser]);

  const loadAcademicData = async () => {
    try {
      const studentId = currentUser?.id || 'student-1';
      const [sylRes, taskRes, mockRes, mistRes, bgRes, revRes] = await Promise.all([
        api.getSyllabus(studentId),
        api.getTasks(studentId),
        api.getMockTests(studentId),
        api.getMistakes(studentId),
        api.getBacklogs(studentId),
        api.getRevision(studentId)
      ]);
      setSyllabus(sylRes.syllabus || []);
      setTasks(taskRes.tasks || []);
      setMockTests(mockRes.tests || []);
      setMistakes(mistRes.mistakes || []);
      setBacklogs(bgRes.backlogs || []);
      setRevision(revRes.revisionSchedule || []);
    } catch (err) {
      console.error('Failed to load academic hub data:', err);
    }
  };

  const handleIncrement = async (subjectId: string) => {
    const res = await api.incrementSubject(subjectId, currentUser?.id);
    if (res.success) {
      setSyllabus(prev => prev.map(s => s.id === subjectId ? res.subject : s));
    }
  };

  const handleToggleTask = async (taskId: string) => {
    const res = await api.toggleTask(taskId, currentUser?.id);
    if (res.success) {
      setTasks(prev => prev.map(t => t.id === taskId ? res.task : t));
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    const res = await api.addTask({
      subject: newTaskSubject,
      task: newTaskTitle,
      durationMin: Number(newTaskDuration) || 45,
      scheduledTime: newTaskTime
    }, currentUser?.id);
    if (res.success) {
      setTasks(prev => [...prev, res.task]);
      setNewTaskTitle('');
      setShowAddTask(false);
    }
  };

  const handleCreateMistake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMistakeTopic) return;
    const res = await api.addMistake({
      subject: newMistakeSubject,
      topic: newMistakeTopic,
      errorType: newMistakeType as any,
      description: newMistakeDesc,
      solutionKey: newMistakeSolution
    }, currentUser?.id);
    if (res.success) {
      setMistakes(prev => [res.mistake, ...prev]);
      setNewMistakeTopic('');
      setNewMistakeDesc('');
      setNewMistakeSolution('');
      setShowAddMistake(false);
    }
  };

  const handleToggleMistake = async (id: string) => {
    const res = await api.toggleMistake(id, currentUser?.id);
    if (res.success) {
      setMistakes(prev => prev.map(m => m.id === id ? res.item : m));
    }
  };

  const handleCreateMock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMockTitle) return;
    const res = await api.addMockTest({
      title: newMockTitle,
      score: Number(newMockScore) || 0,
      totalMarks: Number(newMockTotal) || 300,
      percentile: Number(newMockPercentile) || 90,
      notes: newMockNotes
    }, currentUser?.id);
    if (res.success) {
      setMockTests(prev => [res.test, ...prev]);
      setNewMockTitle('');
      setNewMockScore('');
      setNewMockNotes('');
      setShowAddMock(false);
    }
  };

  const handleCreateBacklog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBacklogChapter) return;
    const res = await api.addBacklog({
      subject: newBacklogSubject,
      chapter: newBacklogChapter,
      urgency: newBacklogUrgency,
      estimatedHours: Number(newBacklogHours) || 2
    }, currentUser?.id);
    if (res.success) {
      setBacklogs(prev => [...prev, res.backlog]);
      setNewBacklogChapter('');
      setShowAddBacklog(false);
    }
  };

  const handleToggleBacklog = async (id: string) => {
    const res = await api.toggleBacklog(id, currentUser?.id);
    if (res.success) {
      setBacklogs(prev => prev.map(b => b.id === id ? res.item : b));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-lavender-700 font-semibold text-xs mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Sustainable Academic Tracking</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">Academic Prep Hub</h1>
          <p className="text-xs text-slate-500">Manage syllabus, spaced repetition, mock analysis, and backlogs calmly.</p>
        </div>

        <button
          onClick={() => {
            setTimerTaskTitle('Active Study Sprint');
            setIsPomodoroOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-lavender-600 hover:bg-lavender-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-lavender-200 transition-all shrink-0"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Launch Pomodoro Timer</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'syllabus', label: 'Syllabus Progress', icon: BookOpen },
          { id: 'planner', label: 'Daily Planner', icon: Calendar },
          { id: 'revision', label: 'Spaced Revision', icon: BookmarkCheck },
          { id: 'mistakes', label: 'Mock & Mistakes', icon: BarChart3 },
          { id: 'backlogs', label: 'Backlog Buster', icon: AlertTriangle }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-lavender-600 text-white shadow-md shadow-lavender-200'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-lavender-50 hover:text-lavender-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Syllabus Progress */}
      {activeTab === 'syllabus' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {syllabus.map(sub => (
              <div key={sub.id} className="bg-white rounded-3xl p-6 border border-lavender-100 shadow-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-extrabold text-slate-800">{sub.name}</h3>
                    <span className="text-xs font-black text-lavender-600">{sub.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-4">
                    <div
                      className="bg-gradient-to-r from-lavender-500 to-purple-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${sub.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Completed chapters</span>
                    <span className="font-bold text-slate-700">{sub.completedChapters} / {sub.totalChapters}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleIncrement(sub.id)}
                    className="flex-1 py-2 rounded-xl bg-lavender-50 hover:bg-lavender-100 text-lavender-800 font-bold text-xs border border-lavender-200 flex items-center justify-center gap-1 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Mark Next Chapter Done</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-800">Mindful Tip: </span>
            Aiming for 80% conceptual mastery with 3 rounds of revision yields far higher scores than rushing through 100% of the syllabus without retaining formulas or mechanisms.
          </div>
        </div>
      )}

      {/* Tab 2: Daily Planner */}
      {activeTab === 'planner' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">Today's Schedule & Focus Blocks</h2>
            <button
              onClick={() => setShowAddTask(!showAddTask)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-lavender-600 text-white font-bold text-xs hover:bg-lavender-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Task</span>
            </button>
          </div>

          {showAddTask && (
            <form onSubmit={handleCreateTask} className="p-5 rounded-3xl bg-lavender-50/70 border border-lavender-200 space-y-4 animate-in fade-in">
              <h3 className="text-xs font-bold uppercase tracking-wider text-lavender-900">New Study Session</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <select
                  value={newTaskSubject}
                  onChange={e => setNewTaskSubject(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                  <option value="Self-Care">Self-Care / Break</option>
                </select>
                <input
                  type="text"
                  placeholder="Task topic (e.g. Solve 20 Electrochemistry MCQs)"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  className="sm:col-span-2 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Time (e.g. 05:00 PM)"
                  value={newTaskTime}
                  onChange={e => setNewTaskTime(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-lavender-600 text-white font-bold text-xs hover:bg-lavender-700"
                >
                  Add Task
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {tasks.map(task => (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  task.completed ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-white border-lavender-100 shadow-sm text-slate-800'
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
                      <span className="text-[11px] text-slate-400">({task.durationMin} min)</span>
                    </div>
                    <p className={`text-xs sm:text-sm font-semibold mt-1 ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {task.task}
                    </p>
                  </div>
                </div>

                {!task.completed && (
                  <button
                    onClick={() => {
                      setTimerTaskTitle(task.task);
                      setIsPomodoroOpen(true);
                    }}
                    className="p-2.5 rounded-xl text-lavender-700 bg-lavender-50 hover:bg-lavender-100 transition-colors flex items-center gap-1.5 text-xs font-bold"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span className="hidden sm:inline">Focus</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Spaced Repetition Revision */}
      {activeTab === 'revision' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs text-purple-900 leading-relaxed">
            <span className="font-bold">Ebbinghaus Forgetting Curve: </span>
            Revisiting a concept at intervals of 1 Day, 3 Days, 7 Days, and 21 Days turns short-term coaching memory into permanent reflex during exam day.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {revision.map(rev => (
              <div key={rev.id} className="bg-white rounded-3xl p-5 border border-lavender-100 shadow-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                      {rev.interval}
                    </span>
                    <span className="text-xs font-bold text-amber-600">{rev.dueDate}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-1">{rev.subject}</p>
                  <h4 className="text-sm font-bold text-slate-800 mt-1 leading-snug">{rev.topic}</h4>
                </div>

                <button
                  onClick={() => {
                    setTimerTaskTitle(`Revision: ${rev.topic}`);
                    setIsPomodoroOpen(true);
                  }}
                  className="mt-4 w-full py-2 rounded-xl bg-lavender-50 hover:bg-lavender-100 text-lavender-800 font-bold text-xs border border-lavender-200 transition-all flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start 20m Quick Review</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Mock Tests & Mistake Notebook */}
      {activeTab === 'mistakes' && (
        <div className="space-y-8">
          
          {/* Mock Test Score Log */}
          <div className="bg-white rounded-3xl p-6 border border-lavender-100 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Mock Test History</h3>
                <p className="text-xs text-slate-500">Track accuracy trends over time</p>
              </div>
              <button
                onClick={() => setShowAddMock(!showAddMock)}
                className="px-3 py-1.5 rounded-xl bg-lavender-600 text-white font-bold text-xs hover:bg-lavender-700 transition-colors"
              >
                + Log Test Score
              </button>
            </div>

            {showAddMock && (
              <form onSubmit={handleCreateMock} className="p-4 rounded-2xl bg-lavender-50/70 border border-lavender-200 mb-4 space-y-3 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Test Name (e.g. Allen Mock #5)"
                    value={newMockTitle}
                    onChange={e => setNewMockTitle(e.target.value)}
                    className="sm:col-span-2 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Score (e.g. 215)"
                    value={newMockScore}
                    onChange={e => setNewMockScore(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Total Marks (e.g. 300)"
                    value={newMockTotal}
                    onChange={e => setNewMockTotal(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMock(false)}
                    className="px-3 py-1.5 text-xs text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-lavender-600 text-white font-bold text-xs"
                  >
                    Save Test
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {mockTests.map(test => (
                <div key={test.id} className="p-4 rounded-2xl border border-slate-100 hover:border-lavender-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">{test.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{test.date} • {test.notes}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-extrabold text-slate-800">{test.score} / {test.totalMarks}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {test.percentile} %ile
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* The Golden Mistake Notebook */}
          <div className="bg-white rounded-3xl p-6 border border-lavender-100 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Mistake Notebook (Error Analysis)</h3>
                <p className="text-xs text-slate-500">Every recorded mistake is 4 marks saved in the real examination</p>
              </div>
              <button
                onClick={() => setShowAddMistake(!showAddMistake)}
                className="px-3 py-1.5 rounded-xl bg-sage-600 text-white font-bold text-xs hover:bg-sage-700 transition-colors shadow-sm"
              >
                + Add Mistake Analysis
              </button>
            </div>

            {showAddMistake && (
              <form onSubmit={handleCreateMistake} className="p-4 rounded-2xl bg-sage-50/70 border border-sage-200 mb-4 space-y-3 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={newMistakeSubject}
                    onChange={e => setNewMistakeSubject(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Biology">Biology</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Chapter / Topic (e.g. Rotational Torque)"
                    value={newMistakeTopic}
                    onChange={e => setNewMistakeTopic(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    required
                  />
                  <select
                    value={newMistakeType}
                    onChange={e => setNewMistakeType(e.target.value as any)}
                    className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Conceptual Error">Conceptual Error</option>
                    <option value="Calculation Mistake">Calculation Mistake</option>
                    <option value="Silly Error">Silly Error / Misread Question</option>
                    <option value="Time Crunch">Time Crunch Panic</option>
                  </select>
                </div>
                <textarea
                  placeholder="What went wrong? (e.g. Substituted wrong axis of rotation in step 2)"
                  value={newMistakeDesc}
                  onChange={e => setNewMistakeDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  rows={2}
                  required
                />
                <input
                  type="text"
                  placeholder="Key Takeaway / Solution Formula to remember next time"
                  value={newMistakeSolution}
                  onChange={e => setNewMistakeSolution(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMistake(false)}
                    className="px-3 py-1.5 text-xs text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-sage-600 text-white font-bold text-xs"
                  >
                    Save to Notebook
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {mistakes.map(m => (
                <div
                  key={m.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    m.reviewed ? 'bg-slate-50/60 border-slate-200' : 'bg-white border-amber-100 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {m.subject}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          m.errorType === 'Conceptual Error' ? 'bg-red-50 text-red-700 border border-red-100' :
                          m.errorType === 'Calculation Mistake' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                          {m.errorType}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">{m.date}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 mt-1.5">{m.topic}</h4>
                      <p className="text-xs text-slate-600 mt-1">{m.description}</p>
                      <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900">
                        <span className="font-bold">Takeaway: </span>{m.solutionKey}
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleMistake(m.id)}
                      className={`p-2 rounded-xl text-xs font-semibold shrink-0 transition-colors ${
                        m.reviewed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {m.reviewed ? '✓ Reviewed' : 'Mark Reviewed'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab 5: Backlog Buster */}
      {activeTab === 'backlogs' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800">Backlog Recovery Plan</h2>
              <p className="text-xs text-slate-500">Break backlog dread into scheduled 2-hour mini recovery sessions</p>
            </div>
            <button
              onClick={() => setShowAddBacklog(!showAddBacklog)}
              className="px-3.5 py-1.5 rounded-xl bg-lavender-600 text-white font-bold text-xs hover:bg-lavender-700 transition-colors"
            >
              + Add Backlog Topic
            </button>
          </div>

          {showAddBacklog && (
            <form onSubmit={handleCreateBacklog} className="p-4 rounded-2xl bg-lavender-50/70 border border-lavender-200 space-y-3 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <select
                  value={newBacklogSubject}
                  onChange={e => setNewBacklogSubject(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Biology">Biology</option>
                </select>
                <input
                  type="text"
                  placeholder="Chapter (e.g. Wave Optics)"
                  value={newBacklogChapter}
                  onChange={e => setNewBacklogChapter(e.target.value)}
                  className="sm:col-span-2 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                  required
                />
                <select
                  value={newBacklogUrgency}
                  onChange={e => setNewBacklogUrgency(e.target.value as any)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="High">High Urgency</option>
                  <option value="Medium">Medium Urgency</option>
                  <option value="Low">Low Urgency</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBacklog(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-lavender-600 text-white font-bold text-xs"
                >
                  Save Backlog
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {backlogs.map(bg => (
              <div
                key={bg.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  bg.completed ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-white border-lavender-100 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleBacklog(bg.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-lavender-600 transition-colors"
                  >
                    {bg.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {bg.subject}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        bg.urgency === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                        bg.urgency === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-slate-50 text-slate-600 border border-slate-200'
                      }`}>
                        {bg.urgency} Priority
                      </span>
                      <span className="text-xs text-slate-400 font-mono">~{bg.estimatedHours} hrs needed</span>
                    </div>
                    <p className={`text-sm font-semibold mt-1 ${bg.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {bg.chapter}
                    </p>
                  </div>
                </div>

                {!bg.completed && (
                  <button
                    onClick={() => {
                      setTimerTaskTitle(`Backlog Sprint: ${bg.chapter}`);
                      setIsPomodoroOpen(true);
                    }}
                    className="p-2 rounded-xl text-lavender-600 bg-lavender-50 hover:bg-lavender-100 transition-colors text-xs font-bold"
                  >
                    Start Recovery Sprint
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pomodoro Timer Modal */}
      <PomodoroModal
        isOpen={isPomodoroOpen}
        onClose={() => setIsPomodoroOpen(false)}
        taskTitle={timerTaskTitle}
      />

    </div>
  );
};
