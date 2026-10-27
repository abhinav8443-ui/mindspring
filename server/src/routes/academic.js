import express from 'express';
import { SYLLABUS_DATA, STUDY_PLAN, MOCK_TESTS, MISTAKE_NOTEBOOK, BACKLOG_ITEMS, REVISION_SCHEDULE } from '../db/store.js';

const router = express.Router();

function getStudentKey(req) {
  return req.query.studentId || 'student-1';
}

// Syllabus
router.get('/syllabus', (req, res) => {
  const key = getStudentKey(req);
  const data = SYLLABUS_DATA[key] || SYLLABUS_DATA['student-1'];
  res.json({ syllabus: data });
});

router.post('/syllabus/:subjectId/increment', (req, res) => {
  const key = getStudentKey(req);
  const data = SYLLABUS_DATA[key] || SYLLABUS_DATA['student-1'];
  const subject = data.find(s => s.id === req.params.subjectId);
  if (subject) {
    if (subject.completedChapters < subject.totalChapters) {
      subject.completedChapters += 1;
      subject.progress = Math.round((subject.completedChapters / subject.totalChapters) * 100);
    }
    return res.json({ success: true, subject });
  }
  res.status(404).json({ error: 'Subject not found' });
});

// Tasks / Daily Planner
router.get('/tasks', (req, res) => {
  const key = getStudentKey(req);
  const tasks = STUDY_PLAN[key] || STUDY_PLAN['student-1'];
  res.json({ tasks });
});

router.post('/tasks/toggle', (req, res) => {
  const { taskId } = req.body;
  const key = getStudentKey(req);
  const tasks = STUDY_PLAN[key] || STUDY_PLAN['student-1'];
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    return res.json({ success: true, task });
  }
  res.status(404).json({ error: 'Task not found' });
});

router.post('/tasks', (req, res) => {
  const { subject, task, durationMin, scheduledTime } = req.body;
  const key = getStudentKey(req);
  if (!STUDY_PLAN[key]) STUDY_PLAN[key] = [];

  const newTask = {
    id: `plan-${Date.now()}`,
    subject: subject || 'General',
    task: task || 'Study session',
    durationMin: Number(durationMin) || 45,
    completed: false,
    scheduledTime: scheduledTime || '04:00 PM'
  };
  STUDY_PLAN[key].push(newTask);
  res.json({ success: true, task: newTask });
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
