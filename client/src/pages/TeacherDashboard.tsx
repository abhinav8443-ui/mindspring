import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, BookOpen, AlertCircle, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import { api } from '../services/api';

export const TeacherDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.getTeacherDashboard().then(res => setData(res)).catch(console.error);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-sage-700 font-semibold text-xs mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>Faculty & Academic Mentorship Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">Teacher & Mentor Dashboard</h1>
          <p className="text-xs text-slate-500">
            Monitor academic completion, track authorized guidance referrals, and support students with pedagogical care.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-slate-800">{data?.teacher?.name || 'Prof. Vikram Sen'}</p>
          <p className="text-[11px] text-slate-500">{data?.teacher?.subject || 'Physics Mentor'}</p>
        </div>
      </div>

      {/* Assigned Students Roster */}
      <div className="bg-white rounded-3xl p-6 border border-lavender-100 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Assigned Batches & Student Progress</h2>
          <span className="text-xs text-slate-400">Class 12 / JEE Super-30 Cohort</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Exam Goal</th>
                <th className="py-3 px-4">Syllabus Completion</th>
                <th className="py-3 px-4">Latest Mock Result</th>
                <th className="py-3 px-4">Authorized Referral Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {data?.students?.map((s: any) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-800">{s.name}</td>
                  <td className="py-3.5 px-4 text-slate-600">{s.examGoal}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${s.avgProgress}%` }} />
                      </div>
                      <span className="font-semibold text-slate-700">{s.avgProgress}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{s.latestTestScore}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      s.supportReferralStatus.includes('Initiated')
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-800'
                    }`}>
                      {s.supportReferralStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pedagogical Guidance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-lavender-100 shadow-card space-y-3">
          <h3 className="text-sm font-bold text-slate-800">Pedagogical Insights on Test Anxiety</h3>
          {data?.pedagogicalGuidance?.map((g: any, idx: number) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
              <p className="font-bold text-slate-800">{g.title}</p>
              <p className="text-slate-600 leading-relaxed">{g.tip}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-6 border border-lavender-100 shadow-card space-y-3">
          <h3 className="text-sm font-bold text-slate-800">Authorized Human-Reviewed Referrals</h3>
          {data?.authorizedReferrals?.map((ref: any, idx: number) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-lavender-50/60 border border-lavender-100 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>{ref.studentName}</span>
                <span className="text-[10px] text-lavender-700 bg-white px-2 py-0.5 rounded-md border border-lavender-200">
                  {ref.date}
                </span>
              </div>
              <p className="text-slate-600">Concern: {ref.topic}</p>
              <p className="text-emerald-700 font-semibold">{ref.status}</p>
            </div>
          ))}
          <p className="text-[11px] text-slate-400 italic">
            * In accordance with DPDP compliance, student private journals remain strictly shielded.
          </p>
        </div>
      </div>

    </div>
  );
};
