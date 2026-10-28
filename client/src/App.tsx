import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { CrisisModal } from './components/CrisisModal';
import { StudentDashboard } from './pages/StudentDashboard';
import { AcademicHub } from './pages/AcademicHub';
import { WellbeingCenter } from './pages/WellbeingCenter';
import { AICompanion } from './pages/AICompanion';
import { WellbeingGames } from './pages/WellbeingGames';
import { SupportDirectory } from './pages/SupportDirectory';
import { ParentDashboard } from './pages/ParentDashboard';
import { ProfileSettings } from './pages/ProfileSettings';
import { User, Role } from './types';
import { api } from './services/api';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const res = await api.getCurrentUser();
      if (res.user) {
        setCurrentUser(res.user);
      }
    } catch (err) {
      console.warn('Backend loading, using initial student profile:', err);
      // fallback initial student profile
      setCurrentUser({
        id: 'student-1',
        name: 'Aarav Sharma',
        email: 'aarav@mindspring.demo',
        role: 'student',
        ageGroup: '16-18',
        examGoal: 'JEE Main & Advanced 2027',
        targetScore: 'Rank < 1500 / 99.5 %ile',
        subjects: ['Physics', 'Chemistry', 'Mathematics'],
        dailyTargetHours: 6.5,
        consentGiven: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSwitch = async (role: Role, userId?: string) => {
    try {
      const res = await api.switchRole(role, userId);
      if (res.success) {
        setCurrentUser(res.user);
        if (role === 'parent') {
          setCurrentTab('parent-view');
        } else {
          setCurrentTab('dashboard');
        }
      }
    } catch (err) {
      console.error('Role switch error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-lavender-600 animate-spin flex items-center justify-center text-white font-bold">
            🌸
          </div>
          <p className="text-sm font-bold text-slate-700">Loading MindSpring...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800">
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        onRoleSwitch={handleRoleSwitch}
        onOpenCrisisModal={() => setIsCrisisModalOpen(true)}
      />

      {/* Main Layout */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          userRole={currentUser?.role}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <StudentDashboard
              currentUser={currentUser}
              onNavigateTab={setCurrentTab}
              onOpenCrisisModal={() => setIsCrisisModalOpen(true)}
            />
          )}

          {currentTab === 'academic' && (
            <AcademicHub currentUser={currentUser} />
          )}

          {currentTab === 'wellbeing' && (
            <WellbeingCenter
              currentUser={currentUser}
              onOpenCrisisModal={() => setIsCrisisModalOpen(true)}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'companion' && (
            <AICompanion
              currentUser={currentUser}
              onOpenCrisisModal={() => setIsCrisisModalOpen(true)}
            />
          )}

          {currentTab === 'games' && (
            <WellbeingGames />
          )}

          {currentTab === 'support' && (
            <SupportDirectory
              currentUser={currentUser}
              onOpenCrisisModal={() => setIsCrisisModalOpen(true)}
            />
          )}

          {currentTab === 'parent-view' && (
            <ParentDashboard />
          )}

          {currentTab === 'settings' && (
            <ProfileSettings
              currentUser={currentUser}
              onUpdateUser={setCurrentUser}
            />
          )}
        </main>

      </div>

      {/* 24x7 Verified Crisis Helpline Modal */}
      <CrisisModal
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)}
      />

    </div>
  );
}

export default App;
