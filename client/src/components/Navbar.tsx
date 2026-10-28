import React, { useState } from 'react';
import { ShieldAlert, Sparkles, UserCheck, HeartHandshake, PhoneCall, ChevronDown } from 'lucide-react';
import { User, Role } from '../types';

interface NavbarProps {
  currentUser: User | null;
  onRoleSwitch: (role: Role, userId?: string) => void;
  onOpenCrisisModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onRoleSwitch, onOpenCrisisModal }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const demoAccounts = [
    { role: 'student', userId: 'student-1', label: 'Aarav Sharma (JEE Aspirant)', badge: 'Student' },
    { role: 'student', userId: 'student-2', label: 'Priya Patel (NEET Aspirant)', badge: 'Student' },
    { role: 'parent', userId: 'parent-1', label: 'Mrs. Sunita Sharma (Parent)', badge: 'Parent' },
    { role: 'counsellor', userId: 'counsellor-1', label: 'Dr. Ananya Roy (Counsellor)', badge: 'Counsellor' },
    { role: 'admin', userId: 'admin-1', label: 'Safeguarding Desk (Admin)', badge: 'Admin' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-lavender-100 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-lavender-500 to-sage-400 flex items-center justify-center text-white shadow-md shadow-lavender-200">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-lavender-700 via-purple-700 to-sage-600 bg-clip-text text-transparent">
                MindSpring
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-sage-50 text-sage-700 rounded-full border border-sage-200">
                Free for Students
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Where academic focus meets emotional wellbeing</p>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          
          {/* Quick 24x7 Crisis Support SOS Button */}
          <button
            onClick={onOpenCrisisModal}
            className="flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 transition-all shadow-sm active:scale-95"
            title="Immediate Crisis Resources & Verified Helplines (Tele-MANAS 14416)"
          >
            <PhoneCall className="w-4 h-4 text-rose-600 animate-bounce" />
            <span className="hidden md:inline font-bold">Crisis Support 24x7</span>
            <span className="md:hidden font-bold">SOS Help</span>
          </button>

          {/* Demo Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-lavender-200 bg-lavender-50/70 hover:bg-lavender-100 text-slate-700 text-xs sm:text-sm font-medium transition-all shadow-sm"
            >
              <div className="w-6 h-6 rounded-full bg-lavender-500 text-white flex items-center justify-center text-xs font-bold">
                {currentUser?.name ? currentUser.name[0] : 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser?.name || 'Guest'}</p>
                <p className="text-[10px] text-lavender-600 font-semibold uppercase">{currentUser?.role || 'Role'}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-lavender-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Switch Demo Role</p>
                  <p className="text-xs text-slate-500">Test every user experience instantly</p>
                </div>
                <div className="space-y-1">
                  {demoAccounts.map(account => (
                    <button
                      key={account.userId}
                      onClick={() => {
                        onRoleSwitch(account.role as Role, account.userId);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        currentUser?.id === account.userId
                          ? 'bg-lavender-100 text-lavender-900 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="truncate pr-2">{account.label}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-medium shrink-0">
                        {account.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
