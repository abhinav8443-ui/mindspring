import express from 'express';
import { WELLBEING_ASSESSMENTS, MOOD_LOGS, PRIVATE_JOURNAL, AUDIT_LOGS } from '../db/store.js';

const router = express.Router();

function getStudentKey(req) {
  return req.query.studentId || 'student-1';
}

// Weekly Assessment
router.get('/assessment', (req, res) => {
  const key = getStudentKey(req);
  const assessments = WELLBEING_ASSESSMENTS[key] || WELLBEING_ASSESSMENTS['student-1'];
  res.json({
    assessments,
    disclaimer: 'The MindSpring Wellbeing Reflection is a self-care check-in tool designed to help you notice personal trends. It is strictly non-diagnostic and does not replace evaluation by a qualified medical professional.'
  });
});

router.post('/assessment', (req, res) => {
  const key = getStudentKey(req);
  const { mood, stress, sleep, energy, socialConnection, academicPressure, supportAccess, reflectionNotes } = req.body;

  // Compute non-diagnostic reflection index (scale 0-100)
  // Positive factors: mood, sleep, energy, socialConnection, supportAccess (each 1-5)
  // Inverse factors: stress, academicPressure (each 1-5, where 1 is low stress, 5 is high stress)
  const posScore = (Number(mood) || 3) + (Number(sleep) || 3) + (Number(energy) || 3) + (Number(socialConnection) || 3) + (Number(supportAccess) || 3);
  const negScore = (Number(stress) || 3) + (Number(academicPressure) || 3);
  
  // normalized to ~100
  const normalizedIndex = Math.round(Math.min(100, Math.max(10, ((posScore * 2) + (12 - negScore) * 3))));

  let summaryFeedback = "";
  let recommendation = "";
  let consultationSuggested = false;

  if (normalizedIndex >= 75) {
    summaryFeedback = "Your emotional balance and recovery rhythms look strong this week. Your sleep and energy reserves are supporting healthy academic stamina.";
    recommendation = "Keep honoring your rest intervals and protecting your positive study mindset.";
  } else if (normalizedIndex >= 50) {
    summaryFeedback = "You are carrying significant exam responsibilities with perseverance, but signs of tension and fatigue are starting to emerge. Notice where you might be cutting into sleep or hydration.";
    recommendation = "Try scheduling one guilt-free 30-minute relaxation block every evening without any exam books or screens.";
  } else {
    summaryFeedback = "Your responses reflect substantial emotional fatigue and academic pressure right now. It is completely understandable to feel overwhelmed when preparing for high-stakes exams.";
    recommendation = "We warmly suggest having a calm conversation with a trusted adult, family member, or scheduling a confidential session with a school/college counsellor. You do not have to carry this alone.";
    consultationSuggested = true;
  }

  const newAssessment = {
    id: `wb-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    scores: {
      mood: Number(mood) || 3,
      stress: Number(stress) || 3,
      sleep: Number(sleep) || 3,
      energy: Number(energy) || 3,
      socialConnection: Number(socialConnection) || 3,
      academicPressure: Number(academicPressure) || 3,
      supportAccess: Number(supportAccess) || 3
    },
    overallIndex: normalizedIndex,
    summaryFeedback,
    recommendation,
    consultationSuggested,
    reflectionNotes: reflectionNotes || ''
  };

  if (!WELLBEING_ASSESSMENTS[key]) WELLBEING_ASSESSMENTS[key] = [];
  WELLBEING_ASSESSMENTS[key].unshift(newAssessment);

  AUDIT_LOGS.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorRole: 'student',
    actorName: 'Student Check-in',
    action: 'WELLBEING_ASSESSMENT_COMPLETED',
    details: `Weekly reflection saved. Consultation suggested: ${consultationSuggested}`
  });

  res.json({ success: true, assessment: newAssessment });
});

// Daily Mood
router.get('/mood', (req, res) => {
  const key = getStudentKey(req);
  const moods = MOOD_LOGS[key] || MOOD_LOGS['student-1'];
  res.json({ moodHistory: moods });
});

router.post('/mood', (req, res) => {
  const key = getStudentKey(req);
  const { mood, level, energy, note, tags } = req.body;
  if (!MOOD_LOGS[key]) MOOD_LOGS[key] = [];

  const newLog = {
    date: new Date().toISOString().split('T')[0],
    mood: mood || 'Okay',
    level: Number(level) || 3,
    energy: Number(energy) || 3,
    note: note || '',
    tags: tags || []
  };

  // replace if today already logged or unshift
  const today = newLog.date;
  const existingIdx = MOOD_LOGS[key].findIndex(m => m.date === today);
  if (existingIdx >= 0) {
    MOOD_LOGS[key][existingIdx] = newLog;
  } else {
    MOOD_LOGS[key].unshift(newLog);
  }

  res.json({ success: true, mood: newLog });
});

// Private Journal
router.get('/journal', (req, res) => {
  const key = getStudentKey(req);
  const entries = PRIVATE_JOURNAL[key] || PRIVATE_JOURNAL['student-1'];
  res.json({
    entries,
    privacyNotice: 'Your journal is strictly private to you. MindSpring never shares journal text with teachers or parents without your explicit directive.'
  });
});

router.post('/journal', (req, res) => {
  const key = getStudentKey(req);
  const { title, content, tags, mood } = req.body;
  if (!PRIVATE_JOURNAL[key]) PRIVATE_JOURNAL[key] = [];

  const newEntry = {
    id: `jr-${Date.now()}`,
    date: new Date().toISOString(),
    title: title || 'Evening reflection',
    content: content || '',
    tags: tags || ['Reflection'],
    mood: mood || 'Calm'
  };

  PRIVATE_JOURNAL[key].unshift(newEntry);
  res.json({ success: true, entry: newEntry });
});

router.delete('/journal/:id', (req, res) => {
  const key = getStudentKey(req);
  const list = PRIVATE_JOURNAL[key] || PRIVATE_JOURNAL['student-1'];
  const index = list.findIndex(e => e.id === req.params.id);
  if (index >= 0) {
    list.splice(index, 1);
    return res.json({ success: true, message: 'Journal entry removed.' });
  }
  res.status(404).json({ error: 'Entry not found' });
});

export default router;
