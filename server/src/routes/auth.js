import express from 'express';
import { USERS, AUDIT_LOGS } from '../db/store.js';

const router = express.Router();

let currentUser = USERS[0]; // default to Aarav Sharma (JEE student)

router.get('/demo-users', (req, res) => {
  res.json({
    users: USERS.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      examGoal: u.examGoal,
      specialization: u.specialization,
      studentName: u.studentName
    }))
  });
});

router.get('/me', (req, res) => {
  res.json({ user: currentUser });
});

router.post('/login', (req, res) => {
  const { userId, email } = req.body;
  const found = USERS.find(u => u.id === userId || u.email === email);
  if (found) {
    currentUser = found;
    AUDIT_LOGS.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorRole: found.role,
      actorName: found.name,
      action: 'USER_LOGIN',
      details: `User logged in under role: ${found.role}`
    });
    return res.json({ success: true, user: currentUser });
  }
  return res.status(404).json({ error: 'User not found' });
});

router.post('/register', (req, res) => {
  const { name, email, ageGroup, examGoal, subjects, dailyTargetHours, parentConsent } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  const newUser = {
    id: `student-${Date.now()}`,
    name,
    email,
    role: 'student',
    ageGroup: ageGroup || '16-18',
    examGoal: examGoal || 'JEE Main',
    targetScore: 'Aiming for dream rank',
    subjects: subjects || ['Physics', 'Chemistry', 'Mathematics'],
    dailyTargetHours: dailyTargetHours || 6,
    consentGiven: !!parentConsent,
    emergencyContact: null
  };

  USERS.push(newUser);
  currentUser = newUser;

  AUDIT_LOGS.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorRole: 'student',
    actorName: name,
    action: 'STUDENT_REGISTERED',
    details: `Registered for exam goal: ${examGoal}`
  });

  res.json({ success: true, user: newUser });
});

router.post('/switch-role', (req, res) => {
  const { role, userId } = req.body;
  let target = null;
  if (userId) {
    target = USERS.find(u => u.id === userId);
  } else if (role) {
    target = USERS.find(u => u.role === role);
  }

  if (target) {
    currentUser = target;
    return res.json({ success: true, user: currentUser });
  }
  res.status(404).json({ error: 'Target role/user not found' });
});

router.post('/consent', (req, res) => {
  const { consentGiven, emergencyContact } = req.body;
  if (currentUser) {
    currentUser.consentGiven = !!consentGiven;
    if (emergencyContact) {
      currentUser.emergencyContact = emergencyContact;
    }
    AUDIT_LOGS.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorRole: currentUser.role,
      actorName: currentUser.name,
      action: 'PRIVACY_CONSENT_UPDATED',
      details: `Consent flag set to ${currentUser.consentGiven}`
    });
    return res.json({ success: true, user: currentUser });
  }
  res.status(401).json({ error: 'Not authenticated' });
});

export default router;
