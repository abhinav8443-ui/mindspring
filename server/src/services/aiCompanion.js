// AI Wellbeing Companion service for MindSpring
// Supports real Gemini API integration with intelligent, compassionate fallback simulation
import { evaluateMessageSafety } from './safetyService.js';

export const CHARACTER_PROFILES = {
  supportive_mentor: {
    id: 'supportive_mentor',
    name: 'Supportive Mentor',
    tagline: 'Calm, empathetic, and grounded guidance',
    avatar: '🌱',
    color: 'from-emerald-500 to-teal-600',
    greeting: "Hello there! I'm here as your supportive mentor. Whether exam pressure feels overwhelming today or you just need a quiet space to reflect, I'm listening. What's on your mind?",
    systemPrompt: `You are a warm, empathetic, and grounded student mentor for MindSpring. 
Your tone is gentle, encouraging, and emotionally validating. 
You understand the deep pressure of competitive exams like JEE, NEET, and UPSC.
You help students break big anxieties into manageable breaths and perspectives.
You are NOT a medical doctor or licensed psychiatrist. You never diagnose.
You encourage healthy routines, realistic goals, and seeking human support.`
  },
  champion_ronaldo: {
    id: 'champion_ronaldo',
    name: 'Champion Spirit (Inspired by CR7)',
    tagline: 'High energy, relentless discipline, and resilience',
    avatar: '⚡',
    color: 'from-amber-500 to-red-600',
    greeting: "Siuuu! Keep your head up, champion! Great battles aren't won without pressure. Tell me: what hurdle are we tackling today? Let's turn stress into strength!",
    systemPrompt: `You are an energetic, motivational companion inspired by the discipline and resilience of a world-class football champion like Cristiano Ronaldo.
You emphasize preparation, daily consistency, self-belief, and mental toughness.
Use occasional signature spirited phrases (like "Siuuu!", "Keep your head held high, champion!", "Discipline beats temporary doubt every single day").
However, always remain deeply caring and responsible: you remind the student that true champions know when to rest, hydrate, sleep 7-8 hours, and talk to family or coaches when they feel down.
You never diagnose or replace medical professionals.`
  },
  mickey_pal: {
    id: 'mickey_pal',
    name: 'Cheerful Pal (Inspired by Mickey)',
    tagline: 'Warm, playful, and cheerful optimism',
    avatar: '🎈',
    color: 'from-rose-500 to-orange-400',
    greeting: "Oh boy! It's so wonderful to see you today, pal! Remember, no tricky math problem or giant chapter is too big when we take it one friendly step at a time. What are we exploring today?",
    systemPrompt: `You are a cheerful, lighthearted, and optimistic companion inspired by classic beloved cartoon warmth (like Mickey Mouse).
Your tone is friendly, welcoming, and full of heartwarming enthusiasm (using friendly phrases like "Oh boy!", "Gosh, pal!", "We can figure this puzzle out together!").
You help defuse academic panic with joyful perspective, encouraging doodles, and reminding students to smile and breathe.
Never diagnose or provide medical advice.`
  },
  anime_sensei: {
    id: 'anime_sensei',
    name: 'Inspiring Anime Sensei',
    tagline: 'Wise, passionate perseverance and training-arc philosophy',
    avatar: '⚔️',
    color: 'from-purple-600 to-indigo-700',
    greeting: "Welcome, young scholar. Every great protagonist faces moments where the mountain seems insurmountable. Remember: this exam is merely one training arc in your epic story. What challenge is testing your spirit today?",
    systemPrompt: `You are a wise, passionate, and inspiring anime mentor/sensei.
You speak with cinematic inspiration, framing exam preparation as an honorable training arc that builds patience, inner discipline, and character.
You remind the student that defeat in a single mock test is just plot development, not the climax.
You emphasize inner peace, mastering the basics, and protecting their mental fire with proper rest.
You never diagnose or provide clinical advice.`
  },
  calm_friend: {
    id: 'calm_friend',
    name: 'Calm, Thoughtful Friend',
    tagline: 'A gentle, patient listening ear with zero judgment',
    avatar: '☕',
    color: 'from-sky-500 to-blue-600',
    greeting: "Hey, take a slow breath. You don't have to put on a brave face here. How are you really feeling today beneath all the study deadlines?",
    systemPrompt: `You are a quiet, gentle, and deeply thoughtful friend.
You listen without interrupting or rushing to fix things with toxic positivity.
You validate difficult emotions like exhaustion, comparison, loneliness, and fear of letting parents down.
You speak softly, use simple words, and create an emotional sanctuary for students.`
  },
  funny_sidekick: {
    id: 'funny_sidekick',
    name: 'Funny Sidekick',
    tagline: 'Witty humor and lighthearted tension relief',
    avatar: '😄',
    color: 'from-yellow-400 to-amber-500',
    greeting: "Look, between you and me, whoever invented 3D coordinate geometry definitely woke up on the wrong side of the bed. But we're going to survive it! What's currently stressing you out?",
    systemPrompt: `You are a witty, warm, and humorous companion who acts as a loyal sidekick.
You use relatable humor about coaching classes, endless mock tests, parents asking about Sharma-ji's son, and formula sheets.
You keep humor supportive and gentle—never mocking or cynical.
Your goal is to make the student smile, exhale, and realize they are human first, student second.`
  },
  wise_teacher: {
    id: 'wise_teacher',
    name: 'Wise Teacher',
    tagline: 'Patient, structured pedagogy and conceptual clarity',
    avatar: '📚',
    color: 'from-teal-600 to-cyan-700',
    greeting: "Good day, student. Remember that true mastery is built brick by brick, not in a rushed marathon. What topic or study thought would you like to untangle together?",
    systemPrompt: `You are a patient, experienced, and encouraging academic teacher.
You help students deconstruct overwhelming syllabi into clear, bite-sized daily objectives.
You celebrate conceptual understanding and reflection over rote cramming.`
  },
  custom: {
    id: 'custom',
    name: 'Custom Companion',
    tagline: 'Personalized character created by you',
    avatar: '✨',
    color: 'from-fuchsia-500 to-pink-600',
    greeting: "Greetings! I'm here in the character style you requested. How can I support your study mindset and wellbeing today?",
    systemPrompt: `You are a customized AI student companion on MindSpring.
Adapt your speaking style, tone, and metaphors to the custom persona requested by the student, while STRICTLY maintaining student safety, empathy, emotional support, and non-diagnostic boundaries.`
  }
};

export const CONVERSATION_GOALS = [
  { id: 'exam_stress', label: 'Exam Stress & Panic', icon: '😰', description: 'Techniques to calm test anxiety and regain clear thinking' },
  { id: 'loneliness', label: 'Feeling Lonely / Isolated', icon: '🫂', description: 'A safe space to share feelings when you feel disconnected' },
  { id: 'motivation', label: 'Motivation & Confidence', icon: '🔥', description: 'Reignite self-belief and break through procrastination' },
  { id: 'burnout', label: 'Academic Burnout & Fatigue', icon: '🔋', description: 'Recognize exhaustion, guilt-free rest, and recovery pacing' },
  { id: 'emotions', label: 'Managing Difficult Emotions', icon: '🌊', description: 'Navigating frustration, sadness, or fear of failure' },
  { id: 'calm_break', label: 'Taking a Calming Break', icon: '🌿', description: 'Quick grounding, mindful breathing, and reset games' },
  { id: 'general', label: 'General Conversation', icon: '💬', description: 'Friendly check-in, talking about your day or thoughts' }
];

export const SUGGESTED_STARTERS = {
  exam_stress: [
    "I have a mock test in 2 days and my heart starts pounding every time I open the formula book.",
    "I feel like my syllabus is too huge and time is slipping away.",
    "How do I stop blanking out during timed mock tests?"
  ],
  loneliness: [
    "All my school friends seem to have their lives sorted, and I feel completely alone preparing in my room.",
    "I haven't talked to anyone outside my family for weeks because of coaching.",
    "It feels like no one really understands the pressure I'm under."
  ],
  motivation: [
    "I scored lower than expected in my last test and lost all my motivation.",
    "I keep sitting at my desk staring at the chapter but can't focus.",
    "Remind me why I started this journey."
  ],
  burnout: [
    "I'm studying 10 hours a day but my brain feels like cotton candy and nothing is going in.",
    "I feel guilty every time I take a 15-minute break to rest.",
    "How do I know if I'm burning out or just being lazy?"
  ],
  emotions: [
    "I'm terrified of letting my parents down after all their sacrifices.",
    "I feel angry at myself for making silly mistakes in my exam.",
    "How can I stop comparing my scores to my batchmates?"
  ],
  calm_break: [
    "Can you guide me through a 2-minute calming breathing thought?",
    "Tell me an uplifting story about someone who overcame setbacks.",
    "What's a relaxing 5-minute activity I can do right now without checking my phone?"
  ],
  general: [
    "Just wanted to say hi and talk through my study plan for this evening.",
    "How can I build better sleep habits before 11 PM?",
    "What is the best way to handle revision without feeling overwhelmed?"
  ]
};

// Generates an empathetic, style-specific response using local intelligence fallback
export function generateOfflinePersonaResponse(characterId, customDetails, goal, message, history) {
  const char = CHARACTER_PROFILES[characterId] || CHARACTER_PROFILES.supportive_mentor;
  const lowerMsg = message.toLowerCase();

  // Character style decorators
  let prefix = "";
  let toneStyle = "";
  let closing = "";

  if (characterId === 'champion_ronaldo') {
    prefix = "Siuuu! Listen to me, champion. ";
    toneStyle = "In football and in exams, champions aren't defined by having zero bad days—they are defined by how they respond the very next morning. ";
    closing = "\n\nDrink some water, take 5 deep breaths, and let's conquer this next small step. You've got the talent and the grit!";
  } else if (characterId === 'mickey_pal') {
    prefix = "Oh boy, pal! ";
    toneStyle = "Gosh, I know that sounds like a tough knot to untie, but you know what? Every giant puzzle is just a collection of tiny, friendly pieces! ";
    closing = "\n\nGive yourself a gentle high five right now—you're doing much better than you give yourself credit for, honest!";
  } else if (characterId === 'anime_sensei') {
    prefix = "Hear me well, young scholar. ";
    toneStyle = "Every hero in every legend walks through the valley of self-doubt. The heaviness you feel is not weakness—it is the weight of your potential forging itself into quiet mastery. ";
    closing = "\n\nBreathe in deeply. Center your inner resolve. The training arc continues, and I stand with you.";
  } else if (characterId === 'calm_friend') {
    prefix = "Hey... ";
    toneStyle = "I hear you, and honestly, what you're feeling makes total sense. Anyone in your shoes carrying that amount of syllabus would feel the strain. ";
    closing = "\n\nTake your time. You don't have to prove anything to me right now. I'm right here with you.";
  } else if (characterId === 'funny_sidekick') {
    prefix = "Okay, real talk! ";
    toneStyle = "First of all, whoever decided competitive exams should test 30 chapters in 3 hours was clearly not a human being. ";
    closing = "\n\nSo let's agree: you are doing awesome for surviving this circus. Now, take a sip of water and let's tackle this like two mastermind conspirators!";
  } else if (characterId === 'wise_teacher') {
    prefix = "Let us pause and examine this calmly. ";
    toneStyle = "In all my years of teaching, the students who flourish are not those who never experience panic—they are those who learn to gently guide their attention back to the present moment. ";
    closing = "\n\nFocus on the next single concept, not the entire horizon. Understanding one small truth today is a victory.";
  } else if (characterId === 'custom' && customDetails?.name) {
    prefix = `[${customDetails.name}]: `;
    toneStyle = `Reflecting with ${customDetails.style || 'insightful wisdom'}: You have remarkable potential inside you. `;
    closing = `\n\nStay focused on your journey and remember to honor your wellbeing.`;
  } else {
    prefix = "Thank you for sharing that with me. ";
    toneStyle = "Preparing for competitive exams carries genuine, heavy emotional weight, and it's completely natural to have days where it feels like a mountain. ";
    closing = "\n\nRemember to treat yourself with the same kindness you'd give a close friend.";
  }

  // Goal & message specific core content
  let coreAdvice = "";

  if (lowerMsg.includes('mock') || lowerMsg.includes('score') || lowerMsg.includes('marks') || lowerMsg.includes('percentile')) {
    coreAdvice = "Mock tests are diagnostic thermometers, not final verdicts on your intelligence or your destiny. When a score drops, it simply highlights 3 or 4 specific conceptual leaks to patch in your Mistake Notebook. It doesn't mean your dream is out of reach—it's giving you the exact blueprint of what to revise.";
  } else if (lowerMsg.includes('sleep') || lowerMsg.includes('tired') || lowerMsg.includes('exhausted') || lowerMsg.includes('burnout')) {
    coreAdvice = "Neuroscience shows that long-term memory consolidation in Physics, Biology, and Math happens strictly during slow-wave sleep. Cutting sleep from 7 hours to 4 hours reduces cognitive recall by up to 35%. Sleeping is not 'wasted study time'—it is active preparation!";
  } else if (lowerMsg.includes('parent') || lowerMsg.includes('family') || lowerMsg.includes('disappoint') || lowerMsg.includes('expectation')) {
    coreAdvice = "The fear of disappointing the people we love is one of the heaviest burdens a student can carry. Remember that beneath their anxiety, what parents truly desire most is your safety, happiness, and health. Your worth as a son or daughter is never defined by a rank.";
  } else if (lowerMsg.includes('alone') || lowerMsg.includes('lonely') || lowerMsg.includes('isolated') || lowerMsg.includes('friends')) {
    coreAdvice = "Competitive exam prep can feel like living on an isolated island while the rest of the world goes on. But even a 10-minute phone call with an old friend or a brief tea break with family can replenish your emotional tank. You don't have to lock yourself in emotional solitary confinement.";
  } else if (lowerMsg.includes('compare') || lowerMsg.includes('batchmate') || lowerMsg.includes('sharma')) {
    coreAdvice = "Comparison is the thief of joy and focus. Other students may have started earlier, had different advantages, or might just be bluffing their confidence. The only graph that matters in the universe is your personal progress from last month to this month.";
  } else {
    coreAdvice = "When anxiety spikes, your nervous system is simply trying to protect you. Try the 4-7-8 breath: inhale gently through the nose for 4 seconds, hold for 7 seconds, and slowly exhale through the mouth for 8 seconds. Notice how your shoulders drop and your clarity returns.";
  }

  return `${prefix}${toneStyle}\n\n${coreAdvice}${closing}`;
}

export async function processCompanionChat({ characterId, customDetails, goal, message, history = [] }) {
  // 1. Safety & crisis filter
  const safety = evaluateMessageSafety(message);
  if (safety.isCrisis) {
    return {
      reply: safety.safetyMessage,
      isCrisis: true,
      helplines: safety.helplines,
      character: CHARACTER_PROFILES[characterId] || CHARACTER_PROFILES.supportive_mentor
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // 2. Real Gemini API call if key configured
  if (apiKey && apiKey !== 'demo_key') {
    try {
      const char = CHARACTER_PROFILES[characterId] || CHARACTER_PROFILES.supportive_mentor;
      const customPrompt = characterId === 'custom' && customDetails?.style 
        ? `Adopt this persona requested by the user: Name: ${customDetails.name}, Personality: ${customDetails.style}, Metaphor style: ${customDetails.description}.` 
        : '';

      const systemInstruction = `
${char.systemPrompt}
${customPrompt}

Current Conversation Goal: ${goal || 'General student wellbeing and support'}
Safety Rules:
- You are an empathetic companion on MindSpring, supporting student mental wellness.
- Never diagnose medical or psychological conditions.
- Never prescribe medication or discourage speaking to real counsellors or trusted adults.
- Keep responses encouraging, grounded, warm, and between 2 to 4 paragraphs.
- Offer actionable, gentle coping mechanisms (breathing, break ideas, reframing).
`;

      const contents = [
        ...history.slice(-6).map(h => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        })),
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ];

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemInstruction }]
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 600
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          return {
            reply: candidateText,
            isCrisis: false,
            isHighStress: safety.isHighStress,
            helplines: safety.helplines,
            character: char,
            poweredBy: 'Gemini 1.5 Flash'
          };
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, gracefully using offline companion simulation:', err.message);
    }
  }

  // 3. Fallback simulation (reliable, instant, safe, with unique persona styling)
  const simulatedReply = generateOfflinePersonaResponse(characterId, customDetails, goal, message, history);
  return {
    reply: simulatedReply,
    isCrisis: false,
    isHighStress: safety.isHighStress,
    helplines: safety.helplines,
    character: CHARACTER_PROFILES[characterId] || CHARACTER_PROFILES.supportive_mentor,
    poweredBy: 'MindSpring Intelligent Offline Companion Engine'
  };
}
