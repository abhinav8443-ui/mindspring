import express from 'express';
import { TODO_TASKS, MOCK_TESTS, MISTAKE_NOTEBOOK, BACKLOG_ITEMS, REVISION_SCHEDULE } from '../db/store.js';

const router = express.Router();

function getStudentKey(req) {
  return req.query.studentId || req.body?.studentId || 'student-1';
}

// To-Do Planner: Tasks Endpoints
router.get('/tasks', (req, res) => {
  const key = getStudentKey(req);
  const tasks = TODO_TASKS[key] || TODO_TASKS['student-1'] || [];
  
  const { date, month } = req.query;
  let filtered = [...tasks];
  if (date) {
    filtered = filtered.filter(t => t.date === date);
  } else if (month) {
    // month formatted as 'YYYY-MM'
    filtered = filtered.filter(t => t.date.startsWith(month));
  }
  
  res.json({ tasks: filtered });
});

router.post('/tasks', (req, res) => {
  const { title, description, date, startTime, priority, category, reminderMinutesBefore } = req.body;
  const key = getStudentKey(req);
  if (!TODO_TASKS[key]) TODO_TASKS[key] = [];

  const newTask = {
    id: `task-${Date.now()}`,
    studentId: key,
    title: title || 'Untitled Task',
    description: description || '',
    date: date || new Date().toISOString().split('T')[0],
    startTime: startTime || '10:00',
    priority: priority || 'medium',
    category: category || 'Study',
    reminderMinutesBefore: reminderMinutesBefore !== undefined ? Number(reminderMinutesBefore) : 10,
    completed: false,
    createdAt: new Date().toISOString(),
    notified: false
  };

  TODO_TASKS[key].unshift(newTask);
  res.json({ success: true, task: newTask });
});

router.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const key = getStudentKey(req);
  const tasks = TODO_TASKS[key] || TODO_TASKS['student-1'] || [];
  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex !== -1) {
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...req.body,
      id // preserve ID
    };
    return res.json({ success: true, task: tasks[taskIndex] });
  }

  res.status(404).json({ error: 'Task not found' });
});

router.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const key = getStudentKey(req);
  if (TODO_TASKS[key]) {
    TODO_TASKS[key] = TODO_TASKS[key].filter(t => t.id !== id);
  }
  res.json({ success: true });
});

router.post('/tasks/toggle', (req, res) => {
  const { taskId } = req.body;
  const key = getStudentKey(req);
  const tasks = TODO_TASKS[key] || TODO_TASKS['student-1'] || [];
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    return res.json({ success: true, task });
  }
  res.status(404).json({ error: 'Task not found' });
});

router.post('/tasks/:id/reschedule', (req, res) => {
  const { id } = req.params;
  const { date } = req.body;
  const key = getStudentKey(req);
  const tasks = TODO_TASKS[key] || TODO_TASKS['student-1'] || [];
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.date = date;
    task.notified = false; // reset notification for rescheduled date
    return res.json({ success: true, task });
  }
  res.status(404).json({ error: 'Task not found' });
});

// Mock Tests
router.get('/mock-tests', (req, res) => {
  const key = getStudentKey(req);
  const tests = MOCK_TESTS[key] || MOCK_TESTS['student-1'];
  res.json({ tests });
});

router.post('/mock-tests', (req, res) => {
  const { title, score, totalMarks, percentile, rank, physics, chemistry, maths, notes } = req.body;
  const key = getStudentKey(req);
  if (!MOCK_TESTS[key]) MOCK_TESTS[key] = [];

  const newTest = {
    id: `mt-${Date.now()}`,
    title: title || 'Full Mock Test',
    date: new Date().toISOString().split('T')[0],
    score: Number(score) || 0,
    totalMarks: Number(totalMarks) || 300,
    percentile: Number(percentile) || 95,
    rank: Number(rank) || 250,
    physics: Number(physics) || 0,
    chemistry: Number(chemistry) || 0,
    maths: Number(maths) || 0,
    notes: notes || ''
  };
  MOCK_TESTS[key].unshift(newTest);
  res.json({ success: true, test: newTest });
});

// Mistake Notebook
router.get('/mistakes', (req, res) => {
  const key = getStudentKey(req);
  const mistakes = MISTAKE_NOTEBOOK[key] || MISTAKE_NOTEBOOK['student-1'];
  res.json({ mistakes });
});

router.post('/mistakes', (req, res) => {
  const { subject, topic, errorType, description, solutionKey } = req.body;
  const key = getStudentKey(req);
  if (!MISTAKE_NOTEBOOK[key]) MISTAKE_NOTEBOOK[key] = [];

  const newMistake = {
    id: `err-${Date.now()}`,
    subject: subject || 'Physics',
    topic: topic || 'General Concept',
    errorType: errorType || 'Conceptual Error',
    description: description || '',
    solutionKey: solutionKey || '',
    date: new Date().toISOString().split('T')[0],
    reviewed: false
  };
  MISTAKE_NOTEBOOK[key].unshift(newMistake);
  res.json({ success: true, mistake: newMistake });
});

router.post('/mistakes/toggle', (req, res) => {
  const { mistakeId } = req.body;
  const key = getStudentKey(req);
  const list = MISTAKE_NOTEBOOK[key] || MISTAKE_NOTEBOOK['student-1'];
  const item = list.find(m => m.id === mistakeId);
  if (item) {
    item.reviewed = !item.reviewed;
    return res.json({ success: true, item });
  }
  res.status(404).json({ error: 'Mistake item not found' });
});

// Backlogs
router.get('/backlogs', (req, res) => {
  const key = getStudentKey(req);
  const backlogs = BACKLOG_ITEMS[key] || BACKLOG_ITEMS['student-1'];
  res.json({ backlogs });
});

router.post('/backlogs', (req, res) => {
  const { subject, chapter, urgency, estimatedHours, notes } = req.body;
  const key = getStudentKey(req);
  if (!BACKLOG_ITEMS[key]) BACKLOG_ITEMS[key] = [];

  const newBacklog = {
    id: `bg-${Date.now()}`,
    subject: subject || 'Physics',
    chapter: chapter || 'Untitled Chapter',
    urgency: urgency || 'Medium',
    estimatedHours: Number(estimatedHours) || 2,
    notes: notes || '',
    completed: false
  };
  BACKLOG_ITEMS[key].push(newBacklog);
  res.json({ success: true, backlog: newBacklog });
});

router.post('/backlogs/toggle', (req, res) => {
  const { backlogId } = req.body;
  const key = getStudentKey(req);
  const list = BACKLOG_ITEMS[key] || BACKLOG_ITEMS['student-1'];
  const item = list.find(b => b.id === backlogId);
  if (item) {
    item.completed = !item.completed;
    return res.json({ success: true, item });
  }
  res.status(404).json({ error: 'Backlog item not found' });
});

// Revision Schedule
router.get('/revision', (req, res) => {
  const key = getStudentKey(req);
  const schedule = REVISION_SCHEDULE[key] || REVISION_SCHEDULE['student-1'];
  res.json({ revisionSchedule: schedule });
});

export default router;
