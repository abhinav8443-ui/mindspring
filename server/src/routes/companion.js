import express from 'express';
import { CHARACTER_PROFILES, CONVERSATION_GOALS, SUGGESTED_STARTERS, processCompanionChat } from '../services/aiCompanion.js';

const router = express.Router();

router.get('/characters', (req, res) => {
  res.json({
    characters: Object.values(CHARACTER_PROFILES)
  });
});

router.get('/goals', (req, res) => {
  res.json({
    goals: CONVERSATION_GOALS
  });
});

router.get('/starters', (req, res) => {
  const { goal } = req.query;
  if (goal && SUGGESTED_STARTERS[goal]) {
    return res.json({ starters: SUGGESTED_STARTERS[goal] });
  }
  res.json({ starters: SUGGESTED_STARTERS });
});

router.post('/chat', async (req, res) => {
  try {
    const { characterId, customDetails, goal, message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const response = await processCompanionChat({
      characterId: characterId || 'supportive_mentor',
      customDetails,
      goal: goal || 'exam_stress',
      message: message.trim(),
      history: Array.isArray(history) ? history : []
    });

    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'An unexpected issue occurred. Please take a pause or connect with support.',
      details: error.message
    });
  }
});

export default router;
