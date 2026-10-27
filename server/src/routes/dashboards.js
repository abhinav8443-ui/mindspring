import express from 'express';
import { USERS, SYLLABUS_DATA, MOCK_TESTS, CONSULTATION_REQUESTS, AUDIT_LOGS } from '../db/store.js';

const router = express.Router();

// Teacher Dashboard
router.get('/teacher', (req, res) => {
  const teacherStudents = USERS.filter(u => u.role === 'student');
  const studentSummaries = teacherStudents.map(student => {
    const syllabus = SYLLABUS_DATA[student.id] || [];
    const avgProgress = syllabus.length 
      ? Math.round(syllabus.reduce((acc, s) => acc + s.progress, 0) / syllabus.length)
      : 0;
    const tests = MOCK_TESTS[student.id] || [];
    const latestTest = tests[0] || null;

    return {
      id: student.id,
      name: student.name,
      examGoal: student.examGoal,
      avgProgress,
      latestTestScore: latestTest ? `${latestTest.score} / ${latestTest.totalMarks}` : 'N/A',
      latestPercentile: latestTest ? latestTest.percentile : null,
      supportReferralStatus: student.id === 'student-1' ? 'Human-Reviewed Support Initiated' : 'Stable'
    };
  });

  res.json({
    teacher: {
      name: 'Prof. Vikram Sen',
      subject: 'Physics & Mechanics',
      batches: ['JEE Advanced 2027 Super-30', 'Class 12 Advanced Scholars']
    },
    students: studentSummaries,
    pedagogicalGuidance: [
      {
        title: 'Constructive Mock Review',
        tip: 'Focus on question-selection strategy and mistake categorization rather than overall marks.'
      },
      {
        title: 'Spotting Silent Burnout',
        tip: 'If a high-performing student suddenly stops asking questions or misses homework, check in with care rather than reprimand.'
      }
    ],
    authorizedReferrals: [
      {
        studentName: 'Aarav Sharma',
        date: '2026-10-26',
        topic: 'Pacing anxiety in timed 3-hour tests',
        status: 'Referred to Dr. Ananya Roy (Counsellor)'
      }
    ]
  });
});

// Parent Dashboard
router.get('/parent', (req, res) => {
  const student = USERS.find(u => u.id === 'student-1');
  const syllabus = SYLLABUS_DATA['student-1'] || [];
  const tests = MOCK_TESTS['student-1'] || [];

  res.json({
    parentName: 'Mrs. Sunita Sharma',
    student: {
      name: student.name,
      examGoal: student.examGoal,
      studyConsistencyStreak: '14 consecutive days',
      weeklyStudyHours: '42.5 hrs logged',
      syllabusOverview: syllabus.map(s => ({
        subject: s.name,
        progress: s.progress,
        completedChapters: s.completedChapters,
        totalChapters: s.totalChapters
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
