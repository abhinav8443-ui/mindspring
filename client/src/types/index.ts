export type Role = 'student' | 'parent' | 'counsellor' | 'admin';

export interface TeacherContact {
  id: string;
  name: string;
  subject: string;
  schoolOrCoaching: string;
  phone: string;
  email: string;
  availableHours?: string;
  notes?: string;
  isTrustedMentor?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  ageGroup?: string;
  examGoal?: string;
  targetScore?: string;
  subjects?: string[];
  dailyTargetHours?: number;
  consentGiven?: boolean;
  emergencyContact?: {
    name: string;
    relation: string;
    phone: string;
    email: string;
    notifyOnCrisis: boolean;
  } | null;
  specialization?: string;
  subject?: string;
  studentName?: string;
}

export interface SubjectProgress {
  id: string;
  name: string;
  progress: number;
  totalChapters: number;
  completedChapters: number;
  color?: string;
}

export interface StudyTask {
  id: string;
  subject: string;
  task: string;
  durationMin: number;
  completed: boolean;
  scheduledTime: string;
}

export interface MockTest {
  id: string;
  title: string;
  date: string;
  score: number;
  totalMarks: number;
  percentile: number;
  rank: number;
  physics?: number;
  chemistry?: number;
  maths?: number;
  notes?: string;
}

export interface MistakeEntry {
  id: string;
  subject: string;
  topic: string;
  errorType: 'Calculation Mistake' | 'Conceptual Error' | 'Silly Error' | 'Time Crunch' | 'Formula Slip';
  description: string;
  solutionKey: string;
  date: string;
  reviewed: boolean;
}

export interface BacklogItem {
  id: string;
  subject: string;
  chapter: string;
  urgency: 'High' | 'Medium' | 'Low';
  estimatedHours: number;
  notes: string;
  completed: boolean;
}

export interface RevisionItem {
  id: string;
  subject: string;
  topic: string;
  interval: string;
  dueDate: string;
  status: string;
}

export interface MoodLog {
  date: string;
  mood: 'Great' | 'Good' | 'Okay' | 'Stressed' | 'Overwhelmed' | 'Exhausted';
  level: number;
  energy: number;
  note: string;
  tags: string[];
}

export interface WellbeingAssessment {
  id: string;
  date: string;
  scores: {
    mood: number;
    stress: number;
    sleep: number;
    energy: number;
    socialConnection: number;
    academicPressure: number;
    supportAccess: number;
  };
  overallIndex: number;
  summaryFeedback: string;
  recommendation: string;
  consultationSuggested: boolean;
  reflectionNotes?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  tags: string[];
  mood: string;
}

export interface CompanionCharacter {
  id: string;
  name: string;
  tagline: string;
  avatar: string;
  color: string;
  greeting: string;
  systemPrompt: string;
}

export interface ConversationGoal {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isCrisis?: boolean;
  helplines?: Array<{
    name: string;
    number: string;
    hours: string;
    description: string;
  }>;
}

export interface Counsellor {
  id: string;
  name: string;
  title: string;
  experience: string;
  avatar: string;
  languages: string[];
  availability: string;
  rating: number;
  reviewsCount: number;
  badges: string[];
}

export interface ConsultationRequest {
  id: string;
  studentId: string;
  studentName: string;
  counsellorId: string;
  counsellorName: string;
  reason: string;
  preferredSlot: string;
  status: string;
  createdAt: string;
  confidentialNotes: string;
}
