import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  RotateCcw, 
  ShieldCheck, 
  PhoneCall, 
  HeartHandshake, 
  Flame, 
  Compass, 
  ChevronRight,
  Smile,
  Edit3
} from 'lucide-react';
import { User, CompanionCharacter, ConversationGoal, ChatMessage } from '../types';
import { api } from '../services/api';

interface AICompanionProps {
  currentUser: User | null;
  onOpenCrisisModal: () => void;
}

export const AICompanion: React.FC<AICompanionProps> = ({ currentUser, onOpenCrisisModal }) => {
  const [characters, setCharacters] = useState<CompanionCharacter[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('champion_ronaldo');
  const [goals, setGoals] = useState<ConversationGoal[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('exam_stress');
  const [starters, setStarters] = useState<string[]>([]);
  
  // Custom character state
  const [customName, setCustomName] = useState<string>('Sherlock Holmes');
  const [customStyle, setCustomStyle] = useState<string>('Analytical, deducing study habits like clues, calm and observant');
  const [customDesc, setCustomDesc] = useState<string>('Speaks with deductive flair and encourages methodical investigation of tough exam concepts');

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [poweredBy, setPoweredBy] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCompanionData();
  }, []);

  useEffect(() => {
    loadStarters(selectedGoalId);
  }, [selectedGoalId]);

  useEffect(() => {
    // When character changes, add initial greeting if chat is empty
    const char = characters.find(c => c.id === selectedCharacterId);
    if (char && messages.length === 0) {
      setMessages([
        {
          id: 'welcome-1',
          role: 'assistant',
          content: char.greeting,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [selectedCharacterId, characters]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const loadCompanionData = async () => {
    try {
      const [charsRes, goalsRes] = await Promise.all([
        api.getCharacters(),
        api.getGoals()
      ]);
      setCharacters(charsRes.characters || []);
      setGoals(goalsRes.goals || []);
      if (charsRes.characters?.length > 0) {
        // default initial greeting
        const defaultChar = charsRes.characters.find(c => c.id === 'champion_ronaldo') || charsRes.characters[0];
        setMessages([
          {
            id: 'welcome-init',
            role: 'assistant',
            content: defaultChar.greeting,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to load companion settings:', err);
    }
  };

  const loadStarters = async (goal: string) => {
    try {
      const res = await api.getStarters(goal);
      if (res.starters && Array.isArray(res.starters)) {
        setStarters(res.starters);
      } else if (res.starters && res.starters[goal]) {
        setStarters(res.starters[goal]);
      }
    } catch (err) {
      console.error('Failed to load starters:', err);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await api.sendCompanionChat({
        characterId: selectedCharacterId,
        customDetails: selectedCharacterId === 'custom' ? {
          name: customName,
          style: customStyle,
          description: customDesc
        } : undefined,
        goal: selectedGoalId,
        message: text,
        history: messages.map(m => ({ role: m.role, content: m.content }))
      });

      if (res.poweredBy) {
        setPoweredBy(res.poweredBy);
      }

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: res.reply || "I'm right here with you. Take a slow breath.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCrisis: res.isCrisis,
        helplines: res.helplines
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: "I'm right here with you. It seems there was a temporary network glitch, but please take a steady breath. You are doing great.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    const char = characters.find(c => c.id === selectedCharacterId);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: char ? char.greeting : "Welcome! I'm here to listen. How are you feeling today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const activeChar = characters.find(c => c.id === selectedCharacterId) || characters[0];
  const activeGoal = goals.find(g => g.id === selectedGoalId);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-lavender-700 font-semibold text-xs mb-1">
            <Bot className="w-4 h-4" />
            <span>AI Student Wellbeing Companion</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">Support & Counselling Chat</h1>
          <p className="text-xs text-slate-500">
            Choose your companion persona, set your conversation goal, and share whatever is weighing on your mind.
          </p>
        </div>

        <button
          onClick={handleResetChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Conversation</span>
        </button>
      </div>

      {/* 1. Character Selection Carousel / Grid */}
      <div className="bg-white rounded-3xl p-5 border border-lavender-100 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-lavender-600" />
            <h2 className="text-sm font-bold text-slate-800">1. Select Character Personality</h2>
          </div>
          <span className="text-[11px] text-slate-400">Personalities adapt tone; safety rules never bend</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {characters.map(char => {
            const isSelected = selectedCharacterId === char.id;
            return (
              <button
                key={char.id}
                type="button"
                onClick={() => {
                  setSelectedCharacterId(char.id);
                  // refresh greeting
                  setMessages([
                    {
                      id: `sw-${Date.now()}`,
                      role: 'assistant',
                      content: char.greeting,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  ]);
                }}
                className={`p-3 rounded-2xl text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-lavender-50 border-2 border-lavender-600 shadow-sm'
                    : 'bg-slate-50/70 border border-slate-200 hover:bg-lavender-50/50'
                }`}
              >
                <div>
                  <span className="text-2xl block mb-1">{char.avatar}</span>
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate">{char.name}</p>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 line-clamp-2 leading-tight">{char.tagline}</p>
              </button>
            );
          })}
        </div>

        {/* Custom Character Creator Form if "custom" selected */}
        {selectedCharacterId === 'custom' && (
          <div className="mt-4 p-4 rounded-2xl bg-lavender-50/80 border border-lavender-200 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-lavender-900 font-bold text-xs">
              <Edit3 className="w-3.5 h-3.5" />
              <span>Define Your Custom Companion</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Character Name / Figure</label>
                <input
                  type="text"
                  placeholder="e.g. Iron Man, Sherlock, Gentle Dadi"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-bold text-slate-600 block mb-1">Speaking Style & Persona Inspiration</label>
                <input
                  type="text"
                  placeholder="e.g. Tech enthusiasm, jokes about quantum mechanics, highly motivating"
                  value={customStyle}
                  onChange={e => setCustomStyle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Conversation Goal Selection */}
      <div className="bg-white rounded-3xl p-5 border border-lavender-100 shadow-card space-y-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-sage-600" />
          <h2 className="text-sm font-bold text-slate-800">2. Select Conversation Focus / Goal</h2>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {goals.map(goal => {
            const isSelected = selectedGoalId === goal.id;
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => setSelectedGoalId(goal.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-sage-600 text-white shadow-sm'
                    : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{goal.icon}</span>
                <span>{goal.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Interactive Chat Interface */}
      <div className="bg-white rounded-3xl border border-lavender-100 shadow-card flex flex-col h-[520px] overflow-hidden">
        
        {/* Chat Top Banner */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lavender-100 flex items-center justify-center text-xl">
              {activeChar?.avatar || '🤖'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-800">
                  {selectedCharacterId === 'custom' ? customName : activeChar?.name}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  Active Companion
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Focus: {activeGoal?.label || 'General Wellbeing'}</p>
            </div>
          </div>

          {poweredBy && (
            <span className="text-[10px] px-2 py-1 rounded-md bg-lavender-50 text-lavender-700 font-mono hidden sm:inline">
              {poweredBy}
            </span>
          )}
        </div>

        {/* Message Bubble Container */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-lavender-600 text-white rounded-tr-none'
                    : msg.isCrisis
                    ? 'bg-rose-50 text-rose-950 border border-rose-300 rounded-tl-none'
                    : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-line">{msg.content}</p>

                {/* If Crisis Detected, render prominent verified Indian helpline card */}
                {msg.isCrisis && (
                  <div className="mt-4 pt-4 border-t border-rose-200 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-rose-800 text-xs">
                      <HeartHandshake className="w-4 h-4 text-rose-600" />
                      <span>Immediate Verified Helplines (Govt. of India)</span>
                    </div>
                    <div className="space-y-2">
                      <a
                        href="tel:14416"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-rose-200 hover:bg-rose-100/50 text-rose-900 font-bold text-xs"
                      >
                        <span>Tele-MANAS (Toll-Free, 24x7)</span>
                        <span className="px-2 py-0.5 rounded bg-rose-600 text-white">Call 14416</span>
                      </a>
                      <a
                        href="tel:18005990019"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-rose-200 hover:bg-rose-100/50 text-rose-900 font-bold text-xs"
                      >
                        <span>KIRAN Mental Health Helpline</span>
                        <span className="px-2 py-0.5 rounded bg-rose-600 text-white">1800-599-0019</span>
                      </a>
                    </div>
                    <button
                      onClick={onOpenCrisisModal}
                      className="w-full text-center text-[11px] font-bold text-rose-700 underline"
                    >
                      View all crisis resources & emergency details →
                    </button>
                  </div>
                )}
              </div>

              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs p-3 rounded-2xl bg-slate-50 max-w-[120px]">
              <div className="w-2 h-2 rounded-full bg-lavender-500 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-lavender-500 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-lavender-500 animate-bounce [animation-delay:0.4s]" />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Starters Bar */}
        {starters.length > 0 && (
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Try Asking:</span>
            {starters.map((starter, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(starter)}
                className="px-3 py-1 rounded-full bg-white border border-slate-200 hover:border-lavender-300 hover:bg-lavender-50 text-[11px] text-slate-600 whitespace-nowrap transition-colors shrink-0"
              >
                {starter}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Talk to ${selectedCharacterId === 'custom' ? customName : activeChar?.name}...`}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-lavender-400 bg-slate-50/50"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-3 rounded-2xl bg-lavender-600 hover:bg-lavender-700 text-white font-bold disabled:opacity-40 transition-transform active:scale-95 shadow-md shadow-lavender-200"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Ethical Disclaimer */}
          <div className="mt-2 text-center text-[10px] text-slate-400">
            MindSpring AI Companion is a supportive peer listener, not a licensed psychiatrist or medical doctor. Never used for clinical diagnosis.
          </div>
        </div>

      </div>

    </div>
  );
};
