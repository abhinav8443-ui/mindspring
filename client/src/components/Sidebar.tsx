import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Heart, 
  Bot, 
  Gamepad2, 
  ShieldCheck, 
  GraduationCap, 
  Users, 
  Settings, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { Role } from '../types';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  userRole?: Role;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, userRole = 'student' }) => {
  const mainNavItems = [
    { id: 'dashboard', label: 'Student Dashboard', icon: LayoutDashboard },
    { id: 'academic', label: 'Academic Prep Hub', icon: BookOpen },
    { id: 'wellbeing', label: 'Wellbeing Assessment', icon: Heart },
    { id: 'companion', label: 'AI Wellbeing Companion', icon: Bot, badge: 'Popular' },
    { id: 'games', label: 'Wellbeing Games (4)', icon: Gamepad2 },
    { id: 'support', label: 'Trusted Adult & Support', icon: ShieldCheck },
  ];

  const roleNavItems = [
    { id: 'teacher-view', label: 'Teacher Dashboard', icon: GraduationCap, visible: true },
    { id: 'parent-view', label: 'Parent Dashboard', icon: Users, visible: true },
    { id: 'settings', label: 'Consent & Privacy', icon: Settings, visible: true }
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-r border-lavender-100 p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-65px)]">
      
      <div className="space-y-6">
        {/* Main Section */}
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Student Core
          </p>
          <nav className="space-y-1">
            {mainNavItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-lavender-600 text-white shadow-md shadow-lavender-300'
                      : 'text-slate-600 hover:bg-lavender-50 hover:text-lavender-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sage-100 text-sage-800 font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Roles & Supervision Section */}
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Community & Portals
          </p>
          <nav className="space-y-1">
            {roleNavItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sage-600 text-white shadow-md shadow-sage-200'
                      : 'text-slate-600 hover:bg-sage-50 hover:text-sage-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Gentle Wellbeing Reminder Card */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-lavender-50 via-white to-sage-50 border border-lavender-100/80 text-left shadow-sm">
          <div className="flex items-center gap-1.5 text-lavender-700 font-bold text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mindful Reminder</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            "Your worth is not measured by a single mock score. Progress is built on self-kindness, good sleep, and daily patience."
          </p>
        </div>
      </div>

    </aside>
  );
};
