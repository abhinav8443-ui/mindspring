import { User, SubjectProgress, StudyTask, MockTest, MistakeEntry, BacklogItem, RevisionItem, MoodLog, WellbeingAssessment, JournalEntry, CompanionCharacter, ConversationGoal, Counsellor, ConsultationRequest } from '../types';

const API_BASE = '/api';

export const api = {
  // Auth & Roles
  async getDemoUsers(): Promise<{ users: User[] }> {
    const res = await fetch(`${API_BASE}/auth/demo-users`);
    return res.json();
  },

  async getCurrentUser(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`);
    return res.json();
  },

  async switchRole(role: string, userId?: string): Promise<{ success: boolean; user: User }> {
    const res = await fetch(`${API_BASE}/auth/switch-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, userId })
    });
    return res.json();
  },

  async updateConsent(consentGiven: boolean, emergencyContact: any): Promise<{ success: boolean; user: User }> {
    const res = await fetch(`${API_BASE}/auth/consent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consentGiven, emergencyContact })
    });
    return res.json();
  },

  // Academic
  async getSyllabus(studentId?: string): Promise<{ syllabus: SubjectProgress[] }> {
    const res = await fetch(`${API_BASE}/academic/syllabus${studentId ? `?studentId=${studentId}` : ''}`);
    return res.json();
  },

  async incrementSubject(subjectId: string, studentId?: string): Promise<{ success: boolean; subject: SubjectProgress }> {
    const res = await fetch(`${API_BASE}/academic/syllabus/${subjectId}/increment${studentId ? `?studentId=${studentId}` : ''}`, {
      method: 'POST'
    });
    return res.json();
  },

  async getTasks(studentId?: string): Promise<{ tasks: StudyTask[] }> {
    const res = await fetch(`${API_BASE}/academic/tasks${studentId ? `?studentId=${studentId}` : ''}`);
    return res.json();
  },

  async toggleTask(taskId: string, studentId?: string): Promise<{ success: boolean; task: StudyTask }> {
    const res = await fetch(`${API_BASE}/academic/tasks/toggle${studentId ? `?studentId=${studentId}` : ''}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId })
    });
    return res.json();
  },

  async addTask(data: { subject: string; task: string; durationMin: number; scheduledTime: string }, studentId?: string): Promise<{ success: boolean; task: StudyTask }> {
    const res = await fetch(`${API_BASE}/academic/tasks${studentId ? `?studentId=${studentId}` : ''}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getMockTests(studentId?: string): Promise<{ tests: MockTest[] }> {
    const res = await fetch(`${API_BASE}/academic/mock-tests${studentId ? `?studentId=${studentId}` : ''}`);
    return res.json();
  },

  async addMockTest(testData: Partial<MockTest>, studentId?: string): Promise<{ success: boolean; test: MockTest }> {
    const res = await fetch(`${API_BASE}/academic/mock-tests${studentId ? `?studentId=${studentId}` : ''}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    return res.json();
  },

  async getMistakes(studentId?: string): Promise<{ mistakes: MistakeEntry[] }> {
    const res = await fetch(`${API_BASE}/academic/mistakes${studentId ? `?studentId=${studentId}` : ''}`);
    return res.json();
  },

  async addMistake(mistakeData: Partial<MistakeEntry>, studentId?: string): Promise<{ success: boolean; mistake: MistakeEntry }> {
    const res = await fetch(`${API_BASE}/academic/mistakes${studentId ? `?studentId=${studentId}` : ''}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mistakeData)
    });
    return res.json();
  },

  async toggleMistake(mistakeId: string, studentId?: string): Promise<{ success: boolean; item: MistakeEntry }> {
    const res = await fetch(`${API_BASE}/academic/mistakes/toggle${studentId ? `?studentId=${studentId}` : ''}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mistakeId })
    });
    return res.json();
  },

  async getBacklogs(studentId?: string): Promise<{ backlogs: BacklogItem[] }> {
    const res = await fetch(`${API_BASE}/academic/backlogs${studentId ? `?studentId=${studentId}` : ''}`);
    return res.json();
  },

  async addBacklog(backlogData: Partial<BacklogItem>, studentId?: string): Promise<{ success: boolean; backlog: BacklogItem }> {
    const res = await fetch(`${API_BASE}/academic/backlogs${studentId ? `?studentId=${studentId}` : ''}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backlogData)
    });
    return res.json();
  },

  async toggleBacklog(backlogId: string, studentId?: string): Promise<{ success: boolean; item: BacklogItem }> {
    const res = await fetch(`${API_BASE}/academic/backlogs/toggle${studentId ? `?studentId=${studentId}` : ''}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ backlogId })
    });
    return res.json();
  },

  async getRevision(studentId?: string): Promise<{ revisionSchedule: RevisionItem[] }> {
    const res = await fetch(`${API_BASE}/academic/revision${studentId ? `?studentId=${studentId}` : ''}`);
    return res.json();
  },

  // Wellbeing
  async getAssessments(studentId?: string): Promise<{ assessments: WellbeingAssessment[]; disclaimer: string }> {
    const res = await fetch(`${API_BASE}/wellbeing/assessment${studentId ? `?studentId=${studentId}` : ''}`);
    return res.json();
  },

  async submitAssessment(data: any, studentId?: string): Promise<{ success: boolean; assessment: WellbeingAssessment }> {
    const res = await fetch(`${API_BASE}/wellbeing/assessment${studentId ? `?studentId=${studentId}` : ''}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getMoods(studentId?: string): Promise<{ moodHistory: MoodLog[] }> {
    const res = await fetch(`${API_BASE}/wellbeing/mood${studentId ? `?studentId=${studentId}` : ''}`);
    return res.json();
  },

  async logMood(data: Partial<MoodLog>, studentId?: string): Promise<{ success: boolean; mood: MoodLog }> {
    const res = await fetch(`${API_BASE}/wellbeing/mood${studentId ? `?studentId=${studentId}` : ''}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getJournal(studentId?: string): Promise<{ entries: JournalEntry[]; privacyNotice: string }> {
    const res = await fetch(`${API_BASE}/wellbeing/journal${studentId ? `?studentId=${studentId}` : ''}`);
    return res.json();
  },

  async addJournal(data: Partial<JournalEntry>, studentId?: string): Promise<{ success: boolean; entry: JournalEntry }> {
    const res = await fetch(`${API_BASE}/wellbeing/journal${studentId ? `?studentId=${studentId}` : ''}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteJournal(id: string, studentId?: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/wellbeing/journal/${id}${studentId ? `?studentId=${studentId}` : ''}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // AI Companion
  async getCharacters(): Promise<{ characters: CompanionCharacter[] }> {
    const res = await fetch(`${API_BASE}/companion/characters`);
    return res.json();
  },

  async getGoals(): Promise<{ goals: ConversationGoal[] }> {
    const res = await fetch(`${API_BASE}/companion/goals`);
    return res.json();
  },

  async getStarters(goal?: string): Promise<{ starters: any }> {
    const res = await fetch(`${API_BASE}/companion/starters${goal ? `?goal=${goal}` : ''}`);
    return res.json();
  },

  async sendCompanionChat(data: {
    characterId: string;
    customDetails?: { name?: string; style?: string; description?: string };
    goal: string;
    message: string;
    history: any[];
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/companion/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Support & Safeguarding
  async getTrustedAdult(studentId?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/support/trusted-adult${studentId ? `?studentId=${studentId}` : ''}`);
    return res.json();
  },

  async updateTrustedAdult(data: any, studentId?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/support/trusted-adult${studentId ? `?studentId=${studentId}` : ''}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getCounsellors(): Promise<{ counsellors: Counsellor[]; notice: string }> {
    const res = await fetch(`${API_BASE}/support/counsellors`);
    return res.json();
  },

  async getRequests(studentId?: string): Promise<{ requests: ConsultationRequest[] }> {
    const res = await fetch(`${API_BASE}/support/requests${studentId ? `?studentId=${studentId}` : ''}`);
    return res.json();
  },

  async bookSession(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/support/book-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getCrisisHelplines(): Promise<any> {
    const res = await fetch(`${API_BASE}/support/crisis-helplines`);
    return res.json();
  },

  // Dashboards
  async getTeacherDashboard(): Promise<any> {
    const res = await fetch(`${API_BASE}/dashboards/teacher`);
    return res.json();
  },

  async getParentDashboard(): Promise<any> {
    const res = await fetch(`${API_BASE}/dashboards/parent`);
    return res.json();
  },

  async getCounsellorDashboard(): Promise<any> {
    const res = await fetch(`${API_BASE}/dashboards/counsellor`);
    return res.json();
  },

  async getAdminDashboard(): Promise<any> {
    const res = await fetch(`${API_BASE}/dashboards/admin`);
    return res.json();
  }
};
