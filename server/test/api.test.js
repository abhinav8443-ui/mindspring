import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateMessageSafety } from '../src/services/safetyService.js';
import { generateOfflinePersonaResponse, processCompanionChat } from '../src/services/aiCompanion.js';
import { TODO_TASKS } from '../src/db/store.js';

test('Safety Service detects crisis keywords and provides verified helplines', () => {
  const crisisResult = evaluateMessageSafety('I feel so hopeless that I just want to end my life');
  assert.equal(crisisResult.isCrisis, true);
  assert.ok(crisisResult.safetyMessage.includes('Tele-MANAS'));
  assert.ok(crisisResult.helplines.length > 0);

  const safeResult = evaluateMessageSafety('How can I revise organic chemistry reactions effectively?');
  assert.equal(safeResult.isCrisis, false);
});

test('AI Companion generates personality-specific responses for Ronaldo inspired character', () => {
  const reply = generateOfflinePersonaResponse('champion_ronaldo', null, 'motivation', 'I feel like giving up on mock tests', []);
  assert.ok(reply.includes('champion') || reply.includes('Siuuu'));
  assert.ok(reply.includes('Mock tests are diagnostic thermometers'));
});

test('AI Companion generates cheerful Mickey Mouse inspired responses', () => {
  const reply = generateOfflinePersonaResponse('mickey_pal', null, 'exam_stress', 'I am stressed about my tasks', []);
  assert.ok(reply.includes('pal') || reply.includes('Oh boy'));
});

test('AI Companion processes chat end-to-end safely', async () => {
  const response = await processCompanionChat({
    characterId: 'anime_sensei',
    goal: 'burnout',
    message: 'I am studying 12 hours a day and feel burned out',
    history: []
  });

  assert.ok(response.reply);
  assert.equal(response.isCrisis, false);
  assert.equal(response.character.id, 'anime_sensei');
});

test('AI Companion triggers immediate crisis override on self-harm message', async () => {
  const response = await processCompanionChat({
    characterId: 'champion_ronaldo',
    goal: 'exam_stress',
    message: 'I am going to kill myself tonight because of my marks',
    history: []
  });

  assert.equal(response.isCrisis, true);
  assert.ok(response.reply.includes('Tele-MANAS'));
  assert.ok(response.helplines.length > 0);
});

test('To-Do Planner store supports daily and monthly tasks with reminders and categories', () => {
  const tasks = TODO_TASKS['student-1'];
  assert.ok(Array.isArray(tasks));
  assert.ok(tasks.length > 0);
  const sample = tasks[0];
  assert.ok(sample.id);
  assert.ok(sample.title);
  assert.ok(sample.date);
  assert.ok(sample.priority);
  assert.ok(sample.category);
  assert.equal(typeof sample.completed, 'boolean');
});
