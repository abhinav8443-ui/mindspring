import express from 'express';
import { USERS, TODO_TASKS, MOCK_TESTS, CONSULTATION_REQUESTS, AUDIT_LOGS } from '../db/store.js';

const router = express.Router();

// Parent Dashboard
router.get('/parent', (req, res) => {
  const student = USERS.find(u => u.id === 'student-1');
  const tasks = TODO_TASKS['student-1'] || [];
  const completedCount = tasks.filter(t => t.completed).length;
  const tests = MOCK_TESTS['student-1'] || [];

  res.json({
    parentName: 'Mrs. Sunita Sharma',
    student: {
      name: student.name,
      examGoal: student.examGoal,
      studyConsistencyStreak: '14 consecutive days',
      weeklyStudyHours: '42.5 hrs logged',
      taskCompletionRate: `${Math.round((completedCount / (tasks.length || 1)) * 100)}% (${completedCount} of ${tasks.length} tasks completed)`,
      recentTasks: tasks.slice(0, 4).map(t => ({
        title: t.title,
        category: t.category,
        completed: t.completed,
        date: t.date
      })),
      recentMockProgress: tests.slice(0, 3).map(t => ({
        title: t.title,
        date: t.date,
        score: `${t.score}/${t.totalMarks}`,
        percentile: t.percentile
      }))
    },
    privacyNotice: 'In alignment with adolescent privacy guidelines and consent regulations, personal journal entries and confidential counsellor dialogues remain strictly between the student and certified mental health professionals.',
    parentSupportGuide: [
      {
        heading: 'How to ask about mock scores',
        recommendation: 'Ask: "How did you feel about the pacing and difficulty?" instead of "What was your rank compared to others?"'
      },
      {
        heading: 'Prioritizing sleep over midnight cramming',
        recommendation: 'A 7-hour rested brain solves complex Physics problems with 30% fewer errors than a sleep-deprived brain.'
      },
      {
        heading: 'Creating an exam-free dinner table',
        recommendation: 'Dedicate meal times to casual topics, jokes, and family warmth with zero academic pressure.'
      }
    ]
  });
});

// Counsellor Dashboard
router.get('/counsellor', (req, res) => {
  res.json({
    counsellor: {
      name: 'Dr. Ananya Roy',
      license: 'RCI-CLIN-2021-9844',
      activeCaseload: 8
    },
    triageQueue: CONSULTATION_REQUESTS,
    guidelines: [
      'Conduct human-in-the-loop clinical assessments.',
      'Maintain end-to-end client confidentiality under Mental Healthcare Act 2017.',
      'Establish clear crisis response workflows with parents/guardians when safety criteria are met.'
    ]
  });
});

// Admin Dashboard
router.get('/admin', (req, res) => {
  res.json({
    systemHealth: 'Optimal',
    activeUsersCount: USERS.length,
    auditLogs: AUDIT_LOGS.slice(0, 15),
    compliance: {
      dpdpActCompliant: true,
      encryptionInTransit: 'TLS 1.3',
      zeroKnowledgeJournaling: true,
      nonClinicalDisclaimerAcknowledged: true
    }
  });
});

export default router;
