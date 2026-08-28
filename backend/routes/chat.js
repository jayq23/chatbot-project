import express from 'express';
import groq, { AI_BEHAVIOR } from '../config/ai.js';

const router = express.Router();

router.post('/chat', async (req, res) => {
  try {
    if (!groq) {
      return res.status(500).json({
        success: false,
        error: 'Missing GROQ_API_KEY. Add it to .env and restart.'
      });
    }

    const { message, userName, history = [] } = req.body;

    // Convert frontend history into Groq message format
    const conversationHistory = history
      .slice(-7)
      .map((item) => ({
        role: item.sender === 'user' ? 'user' : 'assistant',
        content: item.text
      }));

    const completion = await groq.chat.completions.create({
      model: AI_BEHAVIOR.model,
      messages: [
        {
          role: 'system',
          content: AI_BEHAVIOR.systemPrompt(userName)
        },

        // Previous 7 messages
        ...conversationHistory,

        // Current message
        {
          role: 'user',
          content: message
        }
      ],
    });

    res.json({
      success: true,
      response: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('Chat API error:', error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
