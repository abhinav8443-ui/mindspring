import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckSquare, 
  Plus, 
  Clock, 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  CalendarDays, 
  CheckCircle2, 
  Circle, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Tag, 
  Flag, 
  Sparkles,
  Info,
  RotateCcw,
  Check
} from 'lucide-react';
import { User, TodoTask, TaskPriority, TaskCategory } from '../types';
import { api } from '../services/api';
import { soundscapes } from '../utils/audioSynthesis';
import confetti from 'canvas-confetti';

interface TodoPlannerProps {
  currentUser: User | null;
}

export const TodoPlanner: React.FC<TodoPlannerProps> = ({ currentUser }) => {
  const [plannerMode, setPlannerMode] = useState<'daily' | 'monthly'>('daily');
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Selected date for Daily view (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Current month for Monthly view (year and 0-indexed month)
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());

  // Filters for Daily view
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Notification and Alarm state
  const [alarmsEnabled, setAlarmsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('mindspring_alarms_enabled') !== 'false';
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('mindspring_notifications_enabled') === 'true' && 
           typeof Notification !== 'undefined' && 
           Notification.permission === 'granted';
  });
  const [notificationPermissionStatus, setNotificationPermissionStatus] = useState<string>(() => {
    return typeof Notification !== 'undefined' ? Notification.permission : 'unsupported';
  });

  // Active in-app reminder alert toast
  const [activeReminderTask, setActiveReminderTask] = useState<TodoTask | null>(null);

  // Add / Edit Task Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<TodoTask | null>(null);
  const [taskFormTitle, setTaskFormTitle] = useState<string>('');
  const [taskFormDesc, setTaskFormDesc] = useState<string>('');
  const [taskFormDate, setTaskFormDate] = useState<string>(todayStr);
  const [taskFormTime, setTaskFormTime] = useState<string>('10:00');
  const [taskFormPriority, setTaskFormPriority] = useState<TaskPriority>('medium');
  const [taskFormCategory, setTaskFormCategory] = useState<TaskCategory>('Study');
  const [taskFormReminder, setTaskFormReminder] = useState<number>(10);
  const [formError, setFormError] = useState<string>('');

  // Reschedule Modal
  const [reschedulingTask, setReschedulingTask] = useState<TodoTask | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>(todayStr);

  // Load tasks on mount and on user change
  useEffect(() => {
    loadTasks();
  }, [currentUser]);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const studentId = currentUser?.id || 'student-1';
      const res = await api.getTodoTasks(studentId);
      setTasks(res.tasks || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Background reminder & alarm checker (runs every 15 seconds)
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const nowTotalMin = now.getHours() * 60 + now.getMinutes();
      const today = now.toISOString().split('T')[0];

      tasks.forEach(task => {
        if (task.completed || task.notified || task.date !== today || !task.startTime) return;

        const [tHours, tMin] = task.startTime.split(':').map(Number);
        if (isNaN(tHours) || isNaN(tMin)) return;
        const taskTotalMin = tHours * 60 + tMin;

        const reminderOffset = task.reminderMinutesBefore !== undefined ? task.reminderMinutesBefore : 10;
        const triggerTimeMin = taskTotalMin - reminderOffset;

        // Check if current minute window matches trigger time (or within 2 minutes)
        if (nowTotalMin >= triggerTimeMin && nowTotalMin <= taskTotalMin + 15) {
          triggerTaskAlarm(task);
        }
      });
    };

    const interval = setInterval(checkReminders, 15000);
    return () => clearInterval(interval);
  }, [tasks, alarmsEnabled, notificationsEnabled]);

  const triggerTaskAlarm = (task: TodoTask) => {
    // 1. Mark as notified to avoid repeating alarm
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, notified: true } : t));
    api.updateTodoTask(task.id, { notified: true }, currentUser?.id);

    // 2. Play audible alarm chime if enabled
    if (alarmsEnabled) {
      soundscapes.playAlarmTone();
    }

    // 3. Trigger native browser notification if granted & enabled
    if (notificationsEnabled && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        const offsetText = task.reminderMinutesBefore === 0 
          ? 'is starting now!' 
          : `is starting in ${task.reminderMinutesBefore} minutes!`;
        new Notification(`⏰ MindSpring Reminder: ${task.title}`, {
          body: `${task.category} task scheduled at ${formatTime(task.startTime)} ${offsetText}`,
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%238b5cf6"><circle cx="12" cy="12" r="10"/></svg>'
        });
      } catch (e) {
        console.warn('Browser notification error:', e);
      }
    }

    // 4. Always show in-app modal toast
    setActiveReminderTask(task);
  };

  // Toggle browser notifications
  const handleToggleNotifications = async () => {
    if (typeof Notification === 'undefined') {
      alert('Browser notifications are not supported in your browser.');
      return;
    }

    if (Notification.permission === 'denied') {
      alert('Browser notifications are currently blocked in your browser settings. Please enable them in your browser URL bar / site settings to receive reminders.');
      setNotificationPermissionStatus('denied');
      setNotificationsEnabled(false);
      localStorage.setItem('mindspring_notifications_enabled', 'false');
      return;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermissionStatus(permission);
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('mindspring_notifications_enabled', 'true');
        new Notification('🌸 MindSpring Reminders Enabled!', {
          body: 'You will receive gentle task reminders when MindSpring is open.'
        });
      } else {
        setNotificationsEnabled(false);
        localStorage.setItem('mindspring_notifications_enabled', 'false');
      }
      return;
    }

    if (Notification.permission === 'granted') {
      const nextState = !notificationsEnabled;
      setNotificationsEnabled(nextState);
      localStorage.setItem('mindspring_notifications_enabled', String(nextState));
    }
  };

  // Toggle alarms
  const handleToggleAlarms = () => {
    const nextState = !alarmsEnabled;
    setAlarmsEnabled(nextState);
    localStorage.setItem('mindspring_alarms_enabled', String(nextState));
    if (nextState) {
      soundscapes.playChime(659, 0.4);
    }
  };

  // Toggle task completion
  const handleToggleTask = async (taskId: string) => {
    try {
      const res = await api.toggleTodoTask(taskId, currentUser?.id);
      if (res.success) {
        setTasks(prev => {
          const updated = prev.map(t => t.id === taskId ? res.task : t);
          // If all tasks for selected date are completed, trigger celebration confetti
          const dateTasks = updated.filter(t => t.date === selectedDate);
          if (dateTasks.length > 0 && dateTasks.every(t => t.completed)) {
            try {
              confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
            } catch (e) {}
          }
          return updated;
        });
      }
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  // Open modal to add new task
  const handleOpenAddModal = (dateToUse?: string) => {
    setEditingTask(null);
    setTaskFormTitle('');
    setTaskFormDesc('');
    setTaskFormDate(dateToUse || selectedDate);
    setTaskFormTime('10:00');
    setTaskFormPriority('medium');
    setTaskFormCategory('Study');
    setTaskFormReminder(10);
    setFormError('');
    setIsTaskModalOpen(true);
  };

  // Open modal to edit existing task
  const handleOpenEditModal = (task: TodoTask) => {
    setEditingTask(task);
    setTaskFormTitle(task.title);
    setTaskFormDesc(task.description || '');
    setTaskFormDate(task.date);
    setTaskFormTime(task.startTime || '10:00');
    setTaskFormPriority(task.priority);
    setTaskFormCategory(task.category);
    setTaskFormReminder(task.reminderMinutesBefore !== undefined ? task.reminderMinutesBefore : 10);
    setFormError('');
    setIsTaskModalOpen(true);
  };

  // Save task (Add or Edit)
  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskFormTitle.trim()) {
      setFormError('Please enter a task title.');
      return;
    }

    try {
      if (editingTask) {
        const res = await api.updateTodoTask(editingTask.id, {
          title: taskFormTitle.trim(),
          description: taskFormDesc.trim(),
          date: taskFormDate,
          startTime: taskFormTime,
          priority: taskFormPriority,
          category: taskFormCategory,
          reminderMinutesBefore: Number(taskFormReminder),
          notified: false // reset notification on edit
        }, currentUser?.id);

        if (res.success) {
          setTasks(prev => prev.map(t => t.id === editingTask.id ? res.task : t));
          setIsTaskModalOpen(false);
        }
      } else {
        const res = await api.addTodoTask({
          title: taskFormTitle.trim(),
          description: taskFormDesc.trim(),
          date: taskFormDate,
          startTime: taskFormTime,
          priority: taskFormPriority,
          category: taskFormCategory,
          reminderMinutesBefore: Number(taskFormReminder)
        }, currentUser?.id);

        if (res.success) {
          setTasks(prev => [res.task, ...prev]);
          setIsTaskModalOpen(false);
          if (taskFormDate === selectedDate) {
            // keep selection
          }
        }
      }
    } catch (err) {
      console.error('Failed to save task:', err);
      setFormError('Failed to save task. Please try again.');
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await api.deleteTodoTask(taskId, currentUser?.id);
      if (res.success) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Reschedule task
  const handleReschedule = async () => {
    if (!reschedulingTask || !rescheduleDate) return;
    try {
      const res = await api.rescheduleTodoTask(reschedulingTask.id, rescheduleDate, currentUser?.id);
      if (res.success) {
        setTasks(prev => prev.map(t => t.id === reschedulingTask.id ? res.task : t));
        setReschedulingTask(null);
      }
    } catch (err) {
      console.error('Failed to reschedule task:', err);
    }
  };

  // Quick move to tomorrow or today
  const handleQuickMove = async (task: TodoTask, targetDate: string) => {
    try {
      const res = await api.rescheduleTodoTask(task.id, targetDate, currentUser?.id);
      if (res.success) {
        setTasks(prev => prev.map(t => t.id === task.id ? res.task : t));
      }
    } catch (err) {
      console.error('Failed to move task:', err);
    }
  };

  // Date helpers
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const shiftSelectedDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const formatDisplayDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h)) return timeStr;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
  };

  // Daily View Filtered Tasks
  const dailyTasks = tasks.filter(t => t.date === selectedDate);
  const filteredDailyTasks = dailyTasks.filter(t => {
    if (statusFilter === 'pending') return !t.completed;
    if (statusFilter === 'completed') return t.completed;
    if (statusFilter === 'overdue') return !t.completed && t.date < todayStr;
    return true;
  }).filter(t => {
    if (categoryFilter === 'all') return true;
    return t.category.toLowerCase() === categoryFilter.toLowerCase();
  });

  const pendingCount = dailyTasks.filter(t => !t.completed).length;
  const completedCount = dailyTasks.filter(t => t.completed).length;
  const overdueCount = tasks.filter(t => !t.completed && t.date < todayStr).length;

  // Monthly Calendar Generator
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const shiftMonth = (delta: number) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  // Calendar cells calculation
  const calendarCells = [];
  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const prevMonthDate = new Date(currentYear, currentMonth - 1, day);
    const dateStr = prevMonthDate.toISOString().split('T')[0];
    calendarCells.push({ day, dateStr, isCurrentMonth: false });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const curDate = new Date(currentYear, currentMonth, d);
    const dateStr = curDate.toISOString().split('T')[0];
    calendarCells.push({ day: d, dateStr, isCurrentMonth: true });
  }
  // Next month leading days to complete row (multiples of 7)
  const remainingCells = 7 - (calendarCells.length % 7);
  if (remainingCells < 7) {
    for (let d = 1; d <= remainingCells; d++) {
      const nextDate = new Date(currentYear, currentMonth + 1, d);
      const dateStr = nextDate.toISOString().split('T')[0];
      calendarCells.push({ day: d, dateStr, isCurrentMonth: false });
    }
  }

  // Monthly stats
  const currentMonthStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}`;
  const monthTasks = tasks.filter(t => t.date.startsWith(currentMonthStr));
  const monthCompleted = monthTasks.filter(t => t.completed).length;
  const monthPending = monthTasks.filter(t => !t.completed).length;
  const monthCompletionRate = monthTasks.length > 0 ? Math.round((monthCompleted / monthTasks.length) * 100) : 0;

  // Selected date tasks for monthly view sidebar/bottom list
  const monthlySelectedTasks = tasks.filter(t => t.date === selectedDate);

  // Styling helper for categories
  const getCategoryBadgeClass = (category: TaskCategory) => {
    switch (category) {
      case 'Study': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Revision': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Practice': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Personal': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Styling helper for priorities
  const getPriorityBadgeClass = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low': return 'bg-sky-50 text-sky-700 border-sky-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-lavender-700 font-semibold text-xs mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>Gentle Self-Paced Organization</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">To-Do Planner</h1>
          <p className="text-xs text-slate-500">
            Organize daily tasks and plan ahead month-by-month without syllabus pressure or rankings.
          </p>
        </div>

        {/* View Switcher & Notification Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Daily vs Monthly Segmented Toggle */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-200">
            <button
              onClick={() => setPlannerMode('daily')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                plannerMode === 'daily'
                  ? 'bg-white text-lavender-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Daily Planner</span>
            </button>
            <button
              onClick={() => setPlannerMode('monthly')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                plannerMode === 'monthly'
                  ? 'bg-white text-lavender-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Monthly Planner</span>
            </button>
          </div>

          {/* Sound Alarm Toggle */}
          <button
            onClick={handleToggleAlarms}
            title={alarmsEnabled ? 'Sound Alarm: ON (Click to mute)' : 'Sound Alarm: MUTED (Click to enable)'}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
              alarmsEnabled 
                ? 'bg-lavender-50 border-lavender-200 text-lavender-700' 
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            {alarmsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{alarmsEnabled ? 'Alarm On' : 'Alarm Muted'}</span>
          </button>

          {/* Browser Notifications Toggle */}
          <button
            onClick={handleToggleNotifications}
            title={notificationsEnabled ? 'Browser Notifications: ACTIVE' : 'Click to enable Browser Notifications'}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
              notificationsEnabled 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{notificationsEnabled ? 'Reminders On' : 'Enable Reminders'}</span>
          </button>

          {/* + Add Task Button */}
          <button
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-lavender-600 hover:bg-lavender-700 text-white font-bold text-xs shadow-md shadow-lavender-200 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Transparent Disclaimer Bar for Alarms */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-lavender-500 shrink-0" />
          <span>
            <strong>Reminder Notice:</strong> Browser notifications and audio chimes trigger when MindSpring is open in your browser tab.
          </span>
        </div>
        <span className="text-[10px] text-slate-400 hidden sm:inline">
          {notificationPermissionStatus === 'granted' ? '✓ Browser permission granted' : '⚠️ In-app alerts active'}
        </span>
      </div>

      {/* ============================================================ */}
      {/* MODE 1: DAILY PLANNER                                        */}
      {/* ============================================================ */}
      {plannerMode === 'daily' && (
        <div className="space-y-6">

          {/* Day Stepper & Summary Header */}
          <div className="bg-white rounded-3xl p-5 border border-lavender-100 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Date Selector Navigation */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <button
                onClick={() => shiftSelectedDate(-1)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                title="Previous Day"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="text-center sm:text-left">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-800">
                    {formatDisplayDate(selectedDate)}
                  </h2>
                  {selectedDate === todayStr && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-lavender-100 text-lavender-700">
                      Today
                    </span>
                  )}
                  {selectedDate === tomorrowStr && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-sky-100 text-sky-700">
                      Tomorrow
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {dailyTasks.length} task{dailyTasks.length === 1 ? '' : 's'} scheduled &bull; {completedCount} completed
                </p>
              </div>

              <button
                onClick={() => shiftSelectedDate(1)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                title="Next Day"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Date Jumper & Today Button */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setSelectedDate(todayStr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedDate === todayStr
                    ? 'bg-lavender-100 text-lavender-800'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setSelectedDate(tomorrowStr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedDate === tomorrowStr
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Tomorrow
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-lavender-400 bg-white"
              />
            </div>

          </div>

          {/* Filter Chips Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All', count: dailyTasks.length },
                { id: 'pending', label: 'Pending', count: pendingCount },
                { id: 'completed', label: 'Completed', count: completedCount },
                { id: 'overdue', label: 'Overdue', count: overdueCount }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                    statusFilter === f.id
                      ? f.id === 'overdue' 
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-lavender-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === f.id ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold">Category:</span>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-lavender-300"
              >
                <option value="all">All Categories</option>
                <option value="study">Study</option>
                <option value="revision">Revision</option>
                <option value="practice">Practice</option>
                <option value="personal">Personal & Rest</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-3">
            {filteredDailyTasks.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-lavender-50 text-lavender-600 flex items-center justify-center mx-auto text-xl">
                  🌸
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  {statusFilter === 'completed'
                    ? 'No completed tasks yet for this day.'
                    : statusFilter === 'overdue'
                    ? 'No overdue tasks! You are right on track.'
                    : 'No tasks scheduled for this day.'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {statusFilter === 'all' && 'Enjoy your restful free time, or add a gentle goal for yourself whenever you feel ready.'}
                </p>
                {statusFilter === 'all' && (
                  <button
                    onClick={() => handleOpenAddModal(selectedDate)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-lavender-600 hover:bg-lavender-700 text-white font-bold text-xs shadow-md transition-all mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add a Task for this Day</span>
                  </button>
                )}
              </div>
            ) : (
              filteredDailyTasks.map(task => {
                const isOverdue = !task.completed && task.date < todayStr;
                return (
                  <div
                    key={task.id}
                    className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all shadow-sm hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      task.completed
                        ? 'border-slate-200 bg-slate-50/70 opacity-75'
                        : isOverdue
                        ? 'border-red-200 bg-red-50/30'
                        : 'border-lavender-100 hover:border-lavender-300'
                    }`}
                  >
                    
                    {/* Left Checkbox & Title */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                          task.completed
                            ? 'bg-sage-600 text-white'
                            : 'border-2 border-slate-300 hover:border-lavender-500 bg-white'
                        }`}
                      >
                        {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className={`text-sm font-bold text-slate-800 break-words ${
                            task.completed ? 'line-through text-slate-400' : ''
                          }`}>
                            {task.title}
                          </h4>

                          {/* Category Badge */}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(task.category)}`}>
                            {task.category}
                          </span>

                          {/* Priority Badge */}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadgeClass(task.priority)}`}>
                            {task.priority.toUpperCase()}
                          </span>

                          {/* Overdue Badge */}
                          {isOverdue && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>Overdue</span>
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className={`text-xs text-slate-600 leading-relaxed ${task.completed ? 'line-through text-slate-400' : ''}`}>
                            {task.description}
                          </p>
                        )}

                        {/* Timing and Reminder pills */}
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                          {task.startTime && (
                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{formatTime(task.startTime)}</span>
                            </span>
                          )}

                          {task.reminderMinutesBefore !== undefined && (
                            <span className="flex items-center gap-1 text-lavender-700 font-medium">
                              <Bell className="w-3.5 h-3.5 text-lavender-500" />
                              <span>
                                {task.reminderMinutesBefore === 0
                                  ? 'At start time'
                                  : `${task.reminderMinutesBefore}m before`}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {/* Move to Tomorrow shortcut if unfinished */}
                      {!task.completed && (
                        <button
                          onClick={() => handleQuickMove(task, tomorrowStr)}
                          title="Move to Tomorrow"
                          className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-600 flex items-center gap-1 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3 text-slate-400" />
                          <span className="hidden md:inline">Tomorrow</span>
                        </button>
                      )}

                      {/* Reschedule Button */}
                      <button
                        onClick={() => {
                          setReschedulingTask(task);
                          setRescheduleDate(task.date);
                        }}
                        title="Reschedule to another day"
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        <CalendarIcon className="w-4 h-4" />
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEditModal(task)}
                        title="Edit Task"
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        title="Delete Task"
                        className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 2: MONTHLY PLANNER                                      */}
      {/* ============================================================ */}
      {plannerMode === 'monthly' && (
        <div className="space-y-6">

          {/* Month Stepper & Statistics */}
          <div className="bg-white rounded-3xl p-5 border border-lavender-100 shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Month Navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => shiftMonth(-1)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <h2 className="text-lg sm:text-xl font-extrabold text-slate-800">
                {monthNames[currentMonth]} {currentYear}
              </h2>

              <button
                onClick={() => shiftMonth(1)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                title="Next Month"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  setCurrentMonth(new Date().getMonth());
                  setCurrentYear(new Date().getFullYear());
                }}
                className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 ml-2"
              >
                Current Month
              </button>
            </div>

            {/* Monthly Summary Statistics */}
            <div className="flex items-center gap-3 text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 font-medium">Total: </span>
                <span className="font-bold text-slate-800">{monthTasks.length}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                <span className="font-medium">Done: </span>
                <span className="font-bold">{monthCompleted}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
                <span className="font-medium">Pending: </span>
                <span className="font-bold">{monthPending}</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-lavender-50 border border-lavender-200 text-lavender-800 font-bold">
                {monthCompletionRate}% Done
              </div>
            </div>

          </div>

          {/* Monthly Calendar Grid */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-lavender-100 shadow-card">
            
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 text-center pb-2 border-b border-slate-100">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                <div key={idx} className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Matrix */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-3">
              {calendarCells.map((cell, idx) => {
                const dayTasks = tasks.filter(t => t.date === cell.dateStr);
                const isSelected = selectedDate === cell.dateStr;
                const isToday = todayStr === cell.dateStr;
                const hasPending = dayTasks.some(t => !t.completed);
                const allDone = dayTasks.length > 0 && dayTasks.every(t => t.completed);

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(cell.dateStr)}
                    className={`min-h-[75px] sm:min-h-[90px] p-2 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-lavender-500 bg-lavender-50/60 ring-2 ring-lavender-400 shadow-sm'
                        : isToday
                        ? 'border-purple-300 bg-purple-50/30'
                        : cell.isCurrentMonth
                        ? 'border-slate-100 bg-white hover:border-lavender-200 hover:bg-slate-50/50'
                        : 'border-slate-50 bg-slate-50/30 text-slate-300'
                    }`}
                  >
                    {/* Date Number Header */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${
                        isToday 
                          ? 'w-6 h-6 rounded-full bg-lavender-600 text-white flex items-center justify-center font-extrabold'
                          : cell.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}>
                        {cell.day}
                      </span>

                      {/* Status indicator badge */}
                      {dayTasks.length > 0 && (
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                          allDone 
                            ? 'bg-sage-100 text-sage-800' 
                            : 'bg-lavender-100 text-lavender-800'
                        }`}>
                          {dayTasks.length}
                        </span>
                      )}
                    </div>

                    {/* Task preview indicators */}
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {/* Mobile priority dots */}
                      <div className="flex sm:hidden items-center gap-1 flex-wrap">
                        {dayTasks.slice(0, 3).map((t, tIdx) => (
                          <div
                            key={tIdx}
                            className={`w-1.5 h-1.5 rounded-full ${
                              t.completed 
                                ? 'bg-sage-400' 
                                : t.priority === 'high' 
                                ? 'bg-red-500' 
                                : t.priority === 'medium'
                                ? 'bg-amber-400'
                                : 'bg-sky-400'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Desktop preview pills */}
                      <div className="hidden sm:block space-y-1">
                        {dayTasks.slice(0, 2).map((t, tIdx) => (
                          <div
                            key={tIdx}
                            className={`text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium ${
                              t.completed 
                                ? 'bg-slate-100 text-slate-400 line-through' 
                                : 'bg-lavender-100/70 text-slate-700'
                            }`}
                          >
                            {t.title}
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <p className="text-[9px] text-slate-400 font-bold pl-1">
                            +{dayTasks.length - 2} more
                          </p>
                        )}
                      </div>
                    </div>

                  </button>
                );
              })}
            </div>

          </div>

          {/* Selected Date Detail Section in Monthly Mode */}
          <div className="bg-white rounded-3xl p-6 border border-lavender-100 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <span>Tasks for {formatDisplayDate(selectedDate)}</span>
                  {selectedDate === todayStr && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-lavender-100 text-lavender-700 font-bold">
                      Today
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400">
                  {monthlySelectedTasks.length} task{monthlySelectedTasks.length === 1 ? '' : 's'} scheduled for this date
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPlannerMode('daily')}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 transition-colors flex items-center gap-1"
                >
                  <span>Open in Daily View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleOpenAddModal(selectedDate)}
                  className="px-3 py-1.5 rounded-xl bg-lavender-600 hover:bg-lavender-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task for this Day</span>
                </button>
              </div>
            </div>

            {monthlySelectedTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No tasks planned for {formatDisplayDate(selectedDate)}. Click "+ Add Task for this Day" to schedule ahead.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {monthlySelectedTasks.map(task => (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                      task.completed ? 'bg-slate-50 border-slate-200 opacity-75' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
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
                          {task.startTime && <span>&bull; {formatTime(task.startTime)}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(task)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 1: ADD / EDIT TASK MODAL                               */}
      {/* ============================================================ */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-lavender-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-lavender-600" />
                <h3 className="text-lg font-extrabold text-slate-800">
                  {editingTask ? 'Edit Task' : 'Add New Task'}
                </h3>
              </div>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveTask} className="space-y-4">
              
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Practice 10 Thermodynamics numericals"
                  value={taskFormTitle}
                  onChange={e => setTaskFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-lavender-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional context, formula sheet reference, or gentle reminders..."
                  value={taskFormDesc}
                  onChange={e => setTaskFormDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-lavender-400 resize-none"
                />
              </div>

              {/* Date & Start Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={taskFormDate}
                    onChange={e => setTaskFormDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-lavender-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={taskFormTime}
                    onChange={e => setTaskFormTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-lavender-400"
                  />
                </div>
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={taskFormCategory}
                    onChange={e => setTaskFormCategory(e.target.value as TaskCategory)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-lavender-400 bg-white"
                  >
                    <option value="Study">Study</option>
                    <option value="Revision">Revision</option>
                    <option value="Practice">Practice</option>
                    <option value="Personal">Personal & Rest</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={taskFormPriority}
                    onChange={e => setTaskFormPriority(e.target.value as TaskPriority)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-lavender-400 bg-white"
                  >
                    <option value="low">Low (Gentle pace)</option>
                    <option value="medium">Medium (Standard)</option>
                    <option value="high">High (Key priority)</option>
                  </select>
                </div>
              </div>

              {/* Reminder Alarm Setting */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alarm & Notification Reminder
                </label>
                <select
                  value={taskFormReminder}
                  onChange={e => setTaskFormReminder(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-lavender-400 bg-white"
                >
                  <option value={0}>At task start time</option>
                  <option value={5}>5 minutes before</option>
                  <option value={10}>10 minutes before (Recommended)</option>
                  <option value={15}>15 minutes before</option>
                  <option value={30}>30 minutes before</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Plays an audible chime and shows a notification alert before the task begins.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-lavender-600 hover:bg-lavender-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: RESCHEDULE MODAL                                    */}
      {/* ============================================================ */}
      {reschedulingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full border border-lavender-200 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-lavender-600" />
                <span>Reschedule Task</span>
              </h3>
              <button
                onClick={() => setReschedulingTask(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium truncate">
              "{reschedulingTask.title}"
            </p>

            {/* Quick date shortcuts */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRescheduleDate(todayStr)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                  rescheduleDate === todayStr ? 'bg-lavender-50 border-lavender-300 text-lavender-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setRescheduleDate(tomorrowStr)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                  rescheduleDate === tomorrowStr ? 'bg-sky-50 border-sky-300 text-sky-800' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                Tomorrow
              </button>
            </div>

            {/* Custom Date Picker */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Pick a specific date:</label>
              <input
                type="date"
                value={rescheduleDate}
                onChange={e => setRescheduleDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-lavender-300 bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReschedulingTask(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReschedule}
                className="px-4 py-1.5 rounded-xl bg-lavender-600 hover:bg-lavender-700 text-white text-xs font-bold shadow-sm"
              >
                Confirm Date
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* IN-APP REMINDER ALERT MODAL / TOAST                          */}
      {/* ============================================================ */}
      {activeReminderTask && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white rounded-3xl p-5 border-2 border-lavender-400 shadow-2xl animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lavender-100 text-lavender-700 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-lavender-700">
                  Task Reminder
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {formatTime(activeReminderTask.startTime)}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 mt-0.5 truncate">
                {activeReminderTask.title}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {activeReminderTask.category} &bull; Priority: {activeReminderTask.priority.toUpperCase()}
              </p>

              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    handleToggleTask(activeReminderTask.id);
                    setActiveReminderTask(null);
                  }}
                  className="flex-1 py-1.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs transition-colors"
                >
                  Mark Done
                </button>
                <button
                  onClick={() => setActiveReminderTask(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};