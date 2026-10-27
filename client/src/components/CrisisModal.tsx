import React from 'react';
import { X, PhoneCall, HeartHandshake, ShieldAlert, AlertCircle, ExternalLink } from 'lucide-react';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const helplines = [
    {
      name: 'Tele-MANAS (Govt. of India)',
      number: '14416',
      altNumber: '1800-891-4416',
      hours: '24x7 Toll-Free, 20+ Regional Languages',
      desc: 'National Tele Mental Health Programme providing free, compassionate psychiatric & psychological support.'
    },
    {
      name: 'KIRAN Helpline',
      number: '1800-599-0019',
      hours: '24x7 Toll-Free, Govt. of India',
      desc: 'Dedicated psychological first-aid, crisis intervention & adolescent anxiety support.'
    },
    {
      name: 'Vandrevala Foundation',
      number: '+91 9999 666 555',
      hours: '24x7 Free Calling & WhatsApp',
      desc: 'Trained mental health counsellors providing crisis de-escalation & non-judgmental listening.'
    },
    {
      name: 'AASRA Suicide Prevention',
      number: '+91 98204 66726',
      hours: '24x7 Confidential',
      desc: 'Volunteer-driven suicide prevention and emotional crisis assistance.'
    },
    {
      name: 'All-India National Emergency',
      number: '112',
      hours: 'Immediate Emergency Dispatch',
      desc: 'For immediate medical, police, or physical safety emergencies.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-rose-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">You Are Not Alone</h2>
              <p className="text-xs text-rose-600 font-semibold">Immediate, Confidential Human Support Available 24x7</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compassionate Message */}
        <div className="my-5 p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-rose-900 text-xs sm:text-sm leading-relaxed">
          <p className="font-semibold mb-1">Please take a slow, gentle breath.</p>
          <p>
            No examination, rank, or expectation is worth your life or your emotional destruction. If feelings feel heavy or dark right now, trained, compassionate people want to listen and stand by you without judgment.
          </p>
        </div>

        {/* Helplines List */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Crisis Helplines</p>
          {helplines.map((line, idx) => (
            <div key={idx} className="p-4 rounded-2xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-800">{line.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                    {line.hours}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{line.desc}</p>
              </div>
              <a
                href={`tel:${line.number.replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-200 shrink-0"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call {line.number}</span>
              </a>
            </div>
          ))}
        </div>

        {/* Ethical Disclaimer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-start gap-2.5 text-[11px] text-slate-500">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p>
            MindSpring is an educational and wellbeing accompaniment tool, not a clinical psychiatric hospital or emergency response system. If someone is in immediate physical danger, contact 112 or your local emergency department immediately.
          </p>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            I am safe now — return to MindSpring
          </button>
        </div>

      </div>
    </div>
  );
};
