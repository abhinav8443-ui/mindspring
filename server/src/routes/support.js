import express from 'express';
import { COUNSELLORS, CONSULTATION_REQUESTS, USERS, AUDIT_LOGS } from '../db/store.js';
import { CRISIS_HELPLINES } from '../services/safetyService.js';

const router = express.Router();

function getStudentKey(req) {
  return req.query.studentId || 'student-1';
}

router.get('/trusted-adult', (req, res) => {
  const key = getStudentKey(req);
  const user = USERS.find(u => u.id === key);
  res.json({
    trustedAdult: user?.emergencyContact || null,
    info: 'Your trusted adult contact is notified only if you explicitly choose to connect or in situations of severe, immediate life-safety emergencies in accordance with our transparent safeguarding protocol.'
  });
});

router.post('/trusted-adult', (req, res) => {
  const key = getStudentKey(req);
  const { name, relation, phone, email, notifyOnCrisis } = req.body;
  const user = USERS.find(u => u.id === key);
  if (user) {
    user.emergencyContact = {
      name,
      relation,
      phone,
      email,
      notifyOnCrisis: !!notifyOnCrisis
    };
    AUDIT_LOGS.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorRole: 'student',
      actorName: user.name,
      action: 'TRUSTED_ADULT_UPDATED',
      details: `Designated ${relation} (${name}) as emergency trusted adult.`
    });
    return res.json({ success: true, emergencyContact: user.emergencyContact });
  }
  res.status(404).json({ error: 'User not found' });
});

router.get('/counsellors', (req, res) => {
  res.json({
    counsellors: COUNSELLORS,
    notice: 'All MindSpring counsellors are qualified mental health professionals registered with relevant professional councils (e.g., Rehabilitation Council of India / Indian Association of Clinical Psychologists).'
  });
});

router.get('/requests', (req, res) => {
  const key = getStudentKey(req);
  const studentRequests = CONSULTATION_REQUESTS.filter(r => r.studentId === key);
  res.json({ requests: studentRequests });
});

router.post('/book-session', (req, res) => {
  const { studentId, counsellorId, reason, preferredSlot } = req.body;
  const counsellor = COUNSELLORS.find(c => c.id === counsellorId) || COUNSELLORS[0];
  const student = USERS.find(u => u.id === (studentId || 'student-1')) || USERS[0];

  const newRequest = {
    id: `req-${Date.now()}`,
    studentId: student.id,
    studentName: student.name,
    counsellorId: counsellor.id,
    counsellorName: counsellor.name,
    reason: reason || 'Exam anxiety and study balance discussion.',
    preferredSlot: preferredSlot || 'Next available weekday evening',
    status: 'Pending Review',
    createdAt: new Date().toISOString(),
    confidentialNotes: 'Confidential request submitted by student.'
  };

  CONSULTATION_REQUESTS.unshift(newRequest);

  AUDIT_LOGS.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorRole: 'student',
    actorName: student.name,
    action: 'COUNSELLOR_SESSION_REQUESTED',
    details: `Session requested with ${counsellor.name}`
  });

  res.json({ success: true, request: newRequest });
});

router.get('/crisis-helplines', (req, res) => {
  res.json({
    helplines: CRISIS_HELPLINES,
    safeguardingDisclaimer: 'MindSpring is a non-clinical digital platform. In cases of acute crisis, please contact Tele-MANAS (14416) or emergency services (112) immediately.'
  });
});

export default router;
