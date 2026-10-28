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

let TEACHERS = [
  {
    id: 'tch-1',
    name: 'Prof. Vikram Sen',
    subject: 'Physics & Mechanics',
    schoolOrCoaching: 'Apex Institute / Super-30 Cohort',
    phone: '+91 98234 56789',
    email: 'vikram.sen@faculty.demo',
    availableHours: 'Mon-Fri 4:30 PM - 6:00 PM',
    notes: 'Approachable for pacing fears and conceptual doubt clearing. Always reminds students to sleep 7 hours.',
    isTrustedMentor: true
  },
  {
    id: 'tch-2',
    name: 'Mrs. Geeta Krishnan',
    subject: 'Mathematics & Calculus',
    schoolOrCoaching: 'Delhi Public School / Advanced Batch',
    phone: '+91 98345 67890',
    email: 'geeta.krishnan@faculty.demo',
    availableHours: 'Tue & Thu 5:00 PM - 7:00 PM',
    notes: 'Patient mentor who helps untangle test panic and formula slips without criticism.',
    isTrustedMentor: true
  }
];

router.get('/teachers', (req, res) => {
  res.json({ teachers: TEACHERS });
});

router.post('/teachers', (req, res) => {
  const { name, subject, schoolOrCoaching, phone, email, availableHours, notes } = req.body;
  const newTch = {
    id: `tch-${Date.now()}`,
    name: name || 'Teacher',
    subject: subject || 'Subject Guide',
    schoolOrCoaching: schoolOrCoaching || '',
    phone: phone || '',
    email: email || '',
    availableHours: availableHours || 'By appointment',
    notes: notes || '',
    isTrustedMentor: true
  };
  TEACHERS.push(newTch);
  res.json({ success: true, teacher: newTch });
});

router.delete('/teachers/:id', (req, res) => {
  const idx = TEACHERS.findIndex(t => t.id === req.params.id);
  if (idx >= 0) {
    TEACHERS.splice(idx, 1);
    return res.json({ success: true });
  }
  res.status(404).json({ error: 'Teacher contact not found' });
});

export default router;
