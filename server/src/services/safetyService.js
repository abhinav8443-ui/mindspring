// Safety and safeguarding service for MindSpring
import { AUDIT_LOGS } from '../db/store.js';

const CRISIS_PATTERNS = [
  /kill\s*(myself|me)/i,
  /suicid(e|al)/i,
  /end\s*(my\s*)?life/i,
  /want\s*to\s*die/i,
  /better\s*off\s*dead/i,
  /can'?t\s*go\s*on\s*anymore/i,
  /no\s*reason\s*to\s*live/i,
  /harm(ing)?\s*myself/i,
  /cut(ting)?\s*my\s*(wrists|arms)/i,
  /end\s*it\s*all/i,
  /give\s*up\s*on\s*life/i
];

const HIGH_STRESS_PATTERNS = [
  /panic\s*attack/i,
  /cannot\s*breathe/i,
  /hyperventilat/i,
  /everything\s*is\s*falling\s*apart/i,
  /feel\s*completely\s*worthless/i,
  /terrified\s*of\s*failing/i,
  /crying\s*uncontrollably/i
];

export const CRISIS_HELPLINES = [
  {
    name: 'Tele-MANAS (Govt of India)',
    number: '14416 / 1800-891-4416',
    hours: '24x7, Toll-Free, 20+ Languages',
    description: 'National Tele Mental Health Programme of India offering free, confidential psychological support.'
  },
  {
    name: 'KIRAN Mental Health Helpline',
    number: '1800-599-0019',
    hours: '24x7, Toll-Free',
    description: 'Government of India helpline for psychological first-aid, stress management & crisis intervention.'
  },
  {
    name: 'Vandrevala Foundation',
    number: '+91 9999 666 555',
    hours: '24x7 Free & Confidential',
    description: 'Experienced mental health counsellors available on phone and WhatsApp chat.'
  },
  {
    name: 'AASRA Suicide Prevention',
    number: '+91 98204 66726',
    hours: '24x7 Crisis Support',
    description: 'Non-judgmental, confidential listening service for anyone in severe emotional distress.'
  },
  {
    name: 'National Emergency Support',
    number: '112',
    hours: 'Immediate All-India Emergency',
    description: 'For urgent medical or emergency safety assistance.'
  }
];

export function evaluateMessageSafety(text) {
  if (!text || typeof text !== 'string') {
    return { isCrisis: false, isHighStress: false };
  }

  const isCrisis = CRISIS_PATTERNS.some(regex => regex.test(text));
  if (isCrisis) {
    // Record safeguarding event
    AUDIT_LOGS.unshift({
      id: `safe-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorRole: 'system',
      actorName: 'Safeguard Guardrail',
      action: 'CRISIS_TRIGGER_DETECTED',
      details: 'Immediate safety protocol activated. Crisis helplines and human escalation surfaced.'
    });
    return {
      isCrisis: true,
      isHighStress: true,
      helplines: CRISIS_HELPLINES,
      safetyMessage: `I hear how overwhelmingly painful and heavy things feel right now. Please know this: your life and your safety matter far beyond any test, score, or expectation. You do not have to carry this immense weight alone.\n\nPlease reach out right now to a trusted adult, family member, or contact Tele-MANAS immediately at 14416 (toll-free, 24x7). Caring, trained human counsellors are ready to support you without judgment.`
    };
  }

  const isHighStress = HIGH_STRESS_PATTERNS.some(regex => regex.test(text));
  return {
    isCrisis: false,
    isHighStress,
    helplines: isHighStress ? CRISIS_HELPLINES.slice(0, 2) : []
  };
}
