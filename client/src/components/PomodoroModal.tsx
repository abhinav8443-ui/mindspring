import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Coffee, Sparkles, CheckCircle2 } from 'lucide-react';
import { soundscapes } from '../utils/audioSynthesis';
import confetti from 'canvas-confetti';

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskTitle?: string;
  onCompleteTask?: () => void;
}

export const PomodoroModal: React.FC<PomodoroModalProps> = ({ isOpen, onClose, taskTitle, onCompleteTask }) => {
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      soundscapes.playChime(528, 2);
      setIsActive(false);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      } catch (e) {}

      if (mode === 'study') {
        if (onCompleteTask) onCompleteTask();
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('study');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, onCompleteTask]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const switchMode = (newMode: 'study' | 'break') => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(newMode === 'study' ? 25 * 60 : 5 * 60);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'study' ? 25 * 60 : 5 * 60);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-lavender-100 text-center relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mode Selector */}
        <div className="inline-flex p-1 rounded-2xl bg-lavender-50 border border-lavender-100 mb-6">
          <button
            onClick={() => switchMode('study')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'study' ? 'bg-lavender-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            25m Focus Block
          </button>
          <button
            onClick={() => switchMode('break')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              mode === 'break' ? 'bg-sage-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            5m Mindful Break
          </button>
        </div>

        {/* Task Title if provided */}
        <h3 className="text-base font-bold text-slate-800 mb-1 truncate px-4">
          {mode === 'study' ? (taskTitle || 'Deep Study Session') : 'Mindful Rest & Re-centering'}
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          {mode === 'study'
            ? 'One concept at a time. Put your phone in another room and focus on mastery.'
            : 'Unclench your jaw, drink some water, look at a distant green object.'}
        </p>

        {/* Big Animated Circular Display */}
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center mb-8">
          <div className={`absolute inset-0 rounded-full border-4 ${mode === 'study' ? 'border-lavender-100' : 'border-sage-100'} transition-all`} />
          <div 
            className={`absolute inset-0 rounded-full border-4 ${
              mode === 'study' ? 'border-lavender-500' : 'border-sage-500'
            } border-t-transparent ${isActive ? 'animate-spin' : ''}`}
            style={{ animationDuration: '8s' }}
          />
          <div className="z-10">
            <span className="text-5xl font-black tracking-tight text-slate-800 font-mono">
              {formattedTime}
            </span>
            <p className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
              {isActive ? 'In Progress' : 'Paused'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={resetTimer}
            className="p-3 rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsActive(!isActive)}
            className={`px-8 py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg flex items-center gap-2 transition-transform active:scale-95 ${
              mode === 'study'
                ? 'bg-gradient-to-r from-lavender-600 to-purple-600 hover:from-lavender-700 hover:to-purple-700 shadow-lavender-200'
                : 'bg-gradient-to-r from-sage-500 to-emerald-600 hover:from-sage-600 hover:to-emerald-700 shadow-sage-200'
            }`}
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isActive ? 'Pause' : 'Start Timer'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
