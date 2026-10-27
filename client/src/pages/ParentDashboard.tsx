import React, { useState, useEffect } from 'react';
import { Users, Heart, BookOpen, Lock, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export const ParentDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.getParentDashboard().then(res => setData(res)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-lavender-700 font-semibold text-xs mb-1">
            <Users className="w-4 h-4" />
            <span>Family Support & Authorized Overview</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">Parent & Guardian Dashboard</h1>
          <p className="text-xs text-slate-500">
            Authorized academic milestones and gentle guidance for supporting your child's emotional wellbeing.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-800">{data?.parentName || 'Mrs. Sunita Sharma'}</p>
          <p className="text-[11px] text-slate-500">Child: {data?.student?.name || 'Aarav Sharma'}</p>
        </div>
      </div>

      {/* Privacy Notice Card */}
      <div className="p-4 rounded-2xl bg-lavender-50 border border-lavender-100 flex items-start gap-3 text-xs text-lavender-900 leading-relaxed">
        <Lock className="w-4 h-4 text-lavender-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Adolescent Privacy Assurance: </span>
          {data?.privacyNotice}
        </div>
      </div>

      {/* Authorized Academic Progress Overview */}
      <div className="bg-white rounded-3xl p-6 border border-lavender-100 shadow-card space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Academic Study Habits & Consistency</h2>
            <p className="text-xs text-slate-500">Goal: {data?.student?.examGoal}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {data?.student?.studyConsistencyStreak}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {data?.student?.syllabusOverview?.map((sub: any, idx: number) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-800">{sub.subject}</span>
                <span className="font-extrabold text-xs text-lavender-600">{sub.progress}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                <div className="bg-lavender-600 h-full rounded-full" style={{ width: `${sub.progress}%` }} />
              </div>
              <p className="text-[11px] text-slate-500">{sub.completedChapters} of {sub.totalChapters} chapters completed</p>
            </div>
          ))}
        </div>
      </div>

      {/* Parent Guide to Exam Stress */}
      <div className="bg-white rounded-3xl p-6 border border-lavender-100 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          <h2 className="text-base font-bold text-slate-800">Parent Guide to Exam Stress & Conversations</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data?.parentSupportGuide?.map((g: any, idx: number) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-xs text-slate-800 mb-2">{g.heading}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{g.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
