import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Sparkles, 
  Flower2, 
  BookOpenCheck, 
  Wind, 
  Play, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Droplet,
  Layers
} from 'lucide-react';
import { soundscapes } from '../utils/audioSynthesis';
import confetti from 'canvas-confetti';

export const WellbeingGames: React.FC = () => {
  const [activeGame, setActiveGame] = useState<'pattern' | 'garden' | 'stories' | 'calm'>('pattern');

  // ===================== GAME 1: PATTERN & FOCUS =====================
  const [patternSequence, setPatternSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPatternPlaying, setIsPatternPlaying] = useState<boolean>(false);
  const [activePetal, setActivePetal] = useState<number | null>(null);
  const [patternScore, setPatternScore] = useState<number>(0);
  const [patternStatus, setPatternStatus] = useState<string>('Press Start to begin a gentle focus sequence');

  const petals = [
    { id: 0, label: 'Amethyst', color: 'bg-purple-500', activeColor: 'bg-purple-300 ring-4 ring-purple-400', freq: 440 },
    { id: 1, label: 'Emerald', color: 'bg-emerald-500', activeColor: 'bg-emerald-300 ring-4 ring-emerald-400', freq: 528 },
    { id: 2, label: 'Amber', color: 'bg-amber-500', activeColor: 'bg-amber-300 ring-4 ring-amber-400', freq: 660 },
    { id: 3, label: 'Sapphire', color: 'bg-sky-500', activeColor: 'bg-sky-300 ring-4 ring-sky-400', freq: 792 },
  ];

  const startPatternGame = () => {
    setPatternScore(0);
    const initialSeq = [Math.floor(Math.random() * 4), Math.floor(Math.random() * 4)];
    setPatternSequence(initialSeq);
    setPlayerSequence([]);
    setPatternStatus('Watch and listen to the lotus petals...');
    playSequence(initialSeq);
  };

  const playSequence = async (seq: number[]) => {
    setIsPatternPlaying(true);
    for (let i = 0; i < seq.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      const petalId = seq[i];
      setActivePetal(petalId);
      soundscapes.playChime(petals[petalId].freq, 0.5);
      await new Promise(r => setTimeout(r, 500));
      setActivePetal(null);
    }
    setIsPatternPlaying(false);
    setPatternStatus('Your turn: tap the petals in order with steady calm.');
  };

  const handlePetalClick = (petalId: number) => {
    if (isPatternPlaying || patternSequence.length === 0) return;

    soundscapes.playChime(petals[petalId].freq, 0.4);
    setActivePetal(petalId);
    setTimeout(() => setActivePetal(null), 300);

    const nextPlayerSeq = [...playerSequence, petalId];
    setPlayerSequence(nextPlayerSeq);

    const currentIndex = nextPlayerSeq.length - 1;
    if (nextPlayerSeq[currentIndex] !== patternSequence[currentIndex]) {
      setPatternStatus('Gently reset. Focus is a muscle that grows with every calm attempt.');
      setPatternSequence([]);
      setPlayerSequence([]);
      return;
    }

    if (nextPlayerSeq.length === patternSequence.length) {
      const newScore = patternScore + 1;
      setPatternScore(newScore);
      setPatternStatus(`Wonderful focus! Completed round ${newScore}. Taking a deep breath...`);
      try {
        confetti({ particleCount: 30, spread: 45, origin: { y: 0.8 } });
      } catch (e) {}

      setTimeout(() => {
        const nextSeq = [...patternSequence, Math.floor(Math.random() * 4)];
        setPatternSequence(nextSeq);
        setPlayerSequence([]);
        playSequence(nextSeq);
      }, 1200);
    }
  };

  // ===================== GAME 2: EMOTION GARDEN =====================
  const [gardenFlowers, setGardenFlowers] = useState<Array<{
    id: string;
    emotion: string;
    thought: string;
    flowerType: string;
    growth: number;
  }>>([
    { id: 'fl-1', emotion: 'Anxious about Mock #4', thought: 'I prepared faithfully and I will take one problem at a time.', flowerType: 'Lavender of Peace', growth: 100 },
    { id: 'fl-2', emotion: 'Grateful for Family', thought: 'Mom made tea when I was struggling with Calculus.', flowerType: 'Golden Sunflower of Courage', growth: 90 }
  ]);
  const [selectedEmotion, setSelectedEmotion] = useState('Exhausted from late study');
  const [seedThought, setSeedThought] = useState('');
  const [selectedFlower, setSelectedFlower] = useState('Lavender of Peace');

  const handlePlantFlower = (e: React.FormEvent) => {
    e.preventDefault();
    if (!seedThought) return;
    const newFlower = {
      id: `fl-${Date.now()}`,
      emotion: selectedEmotion,
      thought: seedThought,
      flowerType: selectedFlower,
      growth: 60
    };
    setGardenFlowers(prev => [newFlower, ...prev]);
    setSeedThought('');
    soundscapes.playChime(600, 1.2);
    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    } catch (e) {}
  };

  const handleWaterGarden = () => {
    soundscapes.playAmbient('rain');
    setTimeout(() => soundscapes.stopAmbient(), 2000);
    setGardenFlowers(prev => prev.map(f => ({ ...f, growth: 100 })));
  };

  // ===================== GAME 3: CHOICES & STORIES =====================
  const scenarios = [
    {
      id: 'sc-1',
      title: 'Scenario 1: The Midnight Clock Before Mock Test #4',
      context: 'It is 12:45 AM. You have a full 3-hour mock test tomorrow morning at 9:00 AM. You still have 2 chapters of Organic Chemistry you wanted to re-read. Your eyes burn and your heartbeat feels fast.',
      choices: [
        {
          label: 'Option A: Stay awake until 3:30 AM cramming the reactions',
          outcome: 'You force yourself through the reactions with coffee. Next morning, sleep deprivation impairs executive memory recall in physics, leading to 6 silly calculation errors. Cortisol spikes.',
          insight: 'Neuroscience Insight: Slow-wave sleep is essential to synthesize memory. Depriving sleep under exam pressure usually drops scores more than missing a single topic.',
          isHealthy: false
        },
        {
          label: 'Option B: Write down a quick 5-min formula list, drink water, and sleep 7 hours',
          outcome: 'You prioritize brain recovery. You wake up alert, your calculation speed in Physics is sharp, and you calmly tackle Organic with whatever you already mastered.',
          insight: 'Resilience Insight: Accepting limits and trusting your rested intellect is the hallmark of top-percentile test takers.',
          isHealthy: true
        }
      ]
    },
    {
      id: 'sc-2',
      title: 'Scenario 2: The Comparison Trap at the Family Dinner',
      context: 'A relative mentions that your cousin scored in the 99.8th percentile in their coaching series and asks how you are performing. You feel a knot in your chest.',
      choices: [
        {
          label: 'Option A: Go to your room, feel deeply inadequate, and blame yourself',
          outcome: 'You spiral into comparison paralysis and lose the next 2 days of productive revision.',
          insight: 'Comparison Trap: Everyone has a different starting line, different advantages, and different cognitive rhythms. Self-reproach burns energy without teaching any concepts.',
          isHealthy: false
        },
        {
          label: 'Option B: Smile politely, say "I am working steadily on my personal goals", and refocus',
          outcome: 'You protect your peace. You open your mistake notebook and review your personal progress from last month.',
          insight: 'Cognitive Reframing: Measuring against your own past self is the only metric that produces mastery.',
          isHealthy: true
        }
      ]
    }
  ];
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState(0);
  const [chosenOutcome, setChosenOutcome] = useState<any>(null);

  // ===================== GAME 4: CALM BREAK =====================
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathingSeconds, setBreathingSeconds] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [activeSoundscape, setActiveSoundscape] = useState<string | null>(null);

  // 5-4-3-2-1 Sensory Grounding
  const [sensoryCheck, setSensoryCheck] = useState({
    see: false,
    feel: false,
    hear: false,
    smell: false,
    taste: false
  });

  useEffect(() => {
    let timer: any = null;
    if (isBreathingActive) {
      timer = setInterval(() => {
        setBreathingSeconds(prev => {
          if (prev <= 1) {
            setBreathingPhase(current => {
              if (current === 'Inhale') return 'Hold';
              if (current === 'Hold') return 'Exhale';
              if (current === 'Exhale') return 'Rest';
              return 'Inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBreathingActive]);

  const toggleSoundscape = (type: 'rain' | 'bowl' | 'waves' | 'breeze') => {
    if (activeSoundscape === type) {
      soundscapes.stopAmbient();
      setActiveSoundscape(null);
    } else {
      soundscapes.playAmbient(type);
      setActiveSoundscape(type);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-lavender-700 font-semibold text-xs mb-1">
            <Gamepad2 className="w-4 h-4" />
            <span>Interactive Mental Wellbeing Suite</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">Mindful Games & Reset Activities</h1>
          <p className="text-xs text-slate-500">
            Four interactive activities designed to soothe test anxiety, train attention, and nurture emotional awareness.
          </p>
        </div>
      </div>

      {/* Ethical Guardrail Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 leading-relaxed">
        <span className="font-bold text-slate-800">Ethical Notice: </span>
        These games are interactive self-care tools for relaxation and emotional reflection. Game scores or reaction speeds are never used to diagnose clinical depression or assess suicide risk.
      </div>

      {/* Game Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { id: 'pattern', title: '1. Pattern & Focus', desc: 'Working-memory & calm sequencing', icon: '🌸' },
          { id: 'garden', title: '2. Emotion Garden', desc: 'Planting self-compassion blooms', icon: '🌿' },
          { id: 'stories', title: '3. Choices & Stories', desc: 'Exam dilemma branching scenarios', icon: '📖' },
          { id: 'calm', title: '4. Calm Break', desc: 'Box breathing & ambient soundscapes', icon: '🧘' }
        ].map(g => {
          const isActive = activeGame === g.id;
          return (
            <button
              key={g.id}
              onClick={() => {
                setActiveGame(g.id as any);
                setChosenOutcome(null);
              }}
              className={`p-4 rounded-3xl text-left border transition-all ${
                isActive
                  ? 'bg-lavender-50 border-2 border-lavender-600 shadow-md scale-[1.02]'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="text-2xl block mb-1">{g.icon}</span>
              <h3 className="font-bold text-xs sm:text-sm text-slate-800">{g.title}</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-tight">{g.desc}</p>
            </button>
          );
        })}
      </div>

      {/* GAME 1: PATTERN & FOCUS */}
      {activeGame === 'pattern' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-lavender-100 shadow-card text-center max-w-xl mx-auto space-y-6">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
              Cognitive Working Memory
            </span>
            <h2 className="text-lg font-bold text-slate-800 mt-2">Harmonic Lotus Focus</h2>
            <p className="text-xs text-slate-500 mt-1">
              Listen to the soothing harmonic chimes and repeat the pattern to re-center scattered thoughts.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 text-xs font-semibold text-slate-600">
            {patternStatus}
          </div>

          {/* Interactive Petals */}
          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            {petals.map(p => {
              const isActive = activePetal === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePetalClick(p.id)}
                  disabled={isPatternPlaying}
                  className={`h-28 rounded-3xl transition-all transform active:scale-95 flex flex-col items-center justify-center text-white font-bold text-xs shadow-lg ${
                    isActive ? p.activeColor : p.color
                  }`}
                >
                  <Sparkles className="w-5 h-5 mb-1 opacity-80" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between max-w-xs mx-auto pt-2">
            <span className="text-xs font-bold text-slate-600">Streak: {patternScore} rounds</span>
            <button
              onClick={startPatternGame}
              className="px-4 py-2 rounded-xl bg-lavender-600 hover:bg-lavender-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              {patternSequence.length === 0 ? 'Start Sequence' : 'Restart Sequence'}
            </button>
          </div>
        </div>
      )}

      {/* GAME 2: EMOTION GARDEN */}
      {activeGame === 'garden' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-lavender-100 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                Emotional Reflection & Compassion
              </span>
              <h2 className="text-lg font-bold text-slate-800 mt-1">Virtual Emotion Garden</h2>
              <p className="text-xs text-slate-500">Transform anxieties or fatigue into blossoms of self-compassion.</p>
            </div>
            <button
              onClick={handleWaterGarden}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 font-bold text-xs transition-colors shrink-0"
            >
              <Droplet className="w-4 h-4 text-sky-600" />
              <span>Water All Blooms (Play Rain)</span>
            </button>
          </div>

          {/* Plant Seed Form */}
          <form onSubmit={handlePlantFlower} className="p-5 rounded-3xl bg-sage-50/70 border border-sage-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sage-900">Plant a Thought Bloom</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={selectedEmotion}
                onChange={e => setSelectedEmotion(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="Overwhelmed by syllabus">Emotion: Overwhelmed</option>
                <option value="Anxious about mock scores">Emotion: Test Anxiety</option>
                <option value="Exhausted from late study">Emotion: Exhaustion</option>
                <option value="Fear of letting parents down">Emotion: Fear of Letting Family Down</option>
                <option value="Hopeful about improvement">Emotion: Quiet Hope</option>
              </select>
              <input
                type="text"
                placeholder="Write a compassionate counter-thought or affirmation..."
                value={seedThought}
                onChange={e => setSeedThought(e.target.value)}
                className="sm:col-span-2 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                required
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <select
                value={selectedFlower}
                onChange={e => setSelectedFlower(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="Lavender of Peace">Lavender of Peace 🪻</option>
                <option value="Golden Sunflower of Courage">Golden Sunflower of Courage 🌻</option>
                <option value="White Lotus of Clarity">White Lotus of Clarity 🪷</option>
                <option value="Blue Iris of Patience">Blue Iris of Patience 🪻</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                Plant Blossom
              </button>
            </div>
          </form>

          {/* Placed Flowers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {gardenFlowers.map(flower => (
              <div key={flower.id} className="p-5 rounded-3xl bg-gradient-to-b from-white to-sage-50/50 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">
                      {flower.flowerType.includes('Sunflower') ? '🌻' : flower.flowerType.includes('Lotus') ? '🪷' : '🪻'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sage-100 text-sage-800">
                      {flower.growth}% Bloomed
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">{flower.flowerType}</h4>
                  <p className="text-[11px] text-slate-500 italic mt-0.5">Holding: "{flower.emotion}"</p>
                  <p className="text-xs text-slate-700 font-medium mt-2 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100">
                    "{flower.thought}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GAME 3: CHOICES & STORIES */}
      {activeGame === 'stories' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-lavender-100 shadow-card space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                Branching Narrative Coping Stories
              </span>
              <h2 className="text-lg font-bold text-slate-800 mt-1">{scenarios[selectedScenarioIdx].title}</h2>
            </div>
            <div className="flex gap-2">
              {scenarios.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedScenarioIdx(idx);
                    setChosenOutcome(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedScenarioIdx === idx ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Story {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs sm:text-sm text-slate-800 leading-relaxed">
            {scenarios[selectedScenarioIdx].context}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">What do you choose?</p>
            {scenarios[selectedScenarioIdx].choices.map((choice, cIdx) => (
              <button
                key={cIdx}
                onClick={() => {
                  setChosenOutcome(choice);
                  if (choice.isHealthy) {
                    try {
                      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
                    } catch (e) {}
                  }
                }}
                className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all ${
                  chosenOutcome?.label === choice.label
                    ? 'border-2 border-lavender-600 bg-lavender-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                {choice.label}
              </button>
            ))}
          </div>

          {chosenOutcome && (
            <div className={`p-5 rounded-2xl border animate-in fade-in space-y-2 text-xs sm:text-sm leading-relaxed ${
              chosenOutcome.isHealthy
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}>
              <p className="font-bold">{chosenOutcome.outcome}</p>
              <p className="text-slate-600 text-xs mt-1">{chosenOutcome.insight}</p>
            </div>
          )}
        </div>
      )}

      {/* GAME 4: CALM BREAK */}
      {activeGame === 'calm' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Box Breathing Studio */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-lavender-100 shadow-card text-center space-y-6">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-sky-100 text-sky-800">
                Parasympathetic Nervous System Reset
              </span>
              <h2 className="text-lg font-bold text-slate-800 mt-1">Box Breathing Guide</h2>
              <p className="text-xs text-slate-500">4s Inhale • 4s Hold • 4s Exhale • 4s Hold</p>
            </div>

            {/* Glowing Breathing Circle */}
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-500 opacity-20 transition-all duration-1000 ${
                  isBreathingActive && breathingPhase === 'Inhale'
                    ? 'scale-125 duration-[4000ms]'
                    : isBreathingActive && breathingPhase === 'Exhale'
                    ? 'scale-75 duration-[4000ms]'
                    : 'scale-100'
                }`}
              />
              <div className="relative z-10">
                <span className="text-2xl font-extrabold text-slate-800 block">
                  {breathingPhase}
                </span>
                <span className="text-4xl font-black text-sky-600 font-mono mt-1 block">
                  {breathingSeconds}s
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsBreathingActive(!isBreathingActive)}
              className="px-6 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-200 transition-all"
            >
              {isBreathingActive ? 'Pause Breathing' : 'Start Guided Breathing'}
            </button>
          </div>

          {/* 5-4-3-2-1 Sensory Grounding & Ambient Soundscapes */}
          <div className="space-y-6">
            
            {/* Ambient Soundscapes Synthesizer */}
            <div className="bg-white rounded-3xl p-6 border border-lavender-100 shadow-card space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Synthesized Ambient Soundscapes
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'rain', label: 'Gentle Rain', desc: 'Calming brown noise', icon: '🌧️' },
                  { id: 'bowl', label: 'Tibetan Bowl', desc: 'Harmonic resonance', icon: '🧘' },
                  { id: 'waves', label: 'Ocean Waves', desc: 'Rhythmic breath pace', icon: '🌊' },
                  { id: 'breeze', label: 'Forest Breeze', desc: 'Restful whispers', icon: '🍃' }
                ].map(s => {
                  const isPlaying = activeSoundscape === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleSoundscape(s.id as any)}
                      className={`p-3 rounded-2xl text-left border transition-all flex items-center justify-between ${
                        isPlaying
                          ? 'bg-sky-50 border-sky-400 shadow-sm'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div>
                        <span className="text-lg block">{s.icon}</span>
                        <p className="text-xs font-bold text-slate-800 mt-1">{s.label}</p>
                        <p className="text-[10px] text-slate-400">{s.desc}</p>
                      </div>
                      {isPlaying ? (
                        <Volume2 className="w-4 h-4 text-sky-600 animate-pulse" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5-4-3-2-1 Sensory Checklist */}
            <div className="bg-white rounded-3xl p-6 border border-lavender-100 shadow-card space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                5-4-3-2-1 Grounding Checklist
              </h3>
              <p className="text-xs text-slate-500">Notice your surroundings right now to break test-anxiety panic:</p>
              <div className="space-y-2 text-xs">
                {[
                  { key: 'see', text: '5 things you can see (e.g., your desk lamp, your notes, the window)' },
                  { key: 'feel', text: '4 things you can physically feel (e.g., chair under you, feet on floor)' },
                  { key: 'hear', text: '3 things you can hear (e.g., ceiling fan, clock tick, distant birds)' },
                  { key: 'smell', text: '2 things you can smell (e.g., fresh air, tea, paper)' },
                  { key: 'taste', text: '1 thing you can taste (e.g., water, mint, simple breath)' }
                ].map(item => (
                  <label
                    key={item.key}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={(sensoryCheck as any)[item.key]}
                      onChange={e => setSensoryCheck(prev => ({ ...prev, [item.key]: e.target.checked }))}
                      className="accent-sky-600 w-4 h-4 rounded"
                    />
                    <span className="text-slate-700">{item.text}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
