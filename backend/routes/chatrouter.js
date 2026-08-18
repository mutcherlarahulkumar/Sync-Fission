import express from 'express';
import { authMiddleware } from './auth/authmiddleware.js';
import { ask, clearHistory } from '../services/agent.js';
import { rateLimit, byUserOrIp } from '../middleware/ratelimit.js';

// Each assistant message can fan out into several LLM calls, so this limit is
// tighter than the global one and keyed per user (it runs after auth).
const chatLimit = rateLimit({
    name: 'chat',
    limit: 20,
    windowSeconds: 60,
    identify: byUserOrIp,
});

export const app = express.Router();

// The assistant is authenticated: it reads the caller's classes, their tutor's
// contact details, and can book sessions in their name. None of that can be
// exposed to an anonymous request.

app.post('/send', authMiddleware, chatLimit, async (req, res) => {
    const userInput = req.body?.userInput;
    if (typeof userInput !== 'string' || !userInput.trim()) {
        return res.status(400).json({ error: 'userInput is required' });
    }
    if (userInput.length > 4000) {
        return res.status(400).json({ error: 'Message is too long (4000 characters max)' });
    }

    try {
        const { text, toolsUsed } = await ask(userInput.trim(), { id: req.id, role: req.role });
        res.json({ response: text, tools_used: toolsUsed });
    } catch (error) {
        if (error.code === 'NO_API_KEY') {
            return res.status(503).json({ error: 'AI Assistant is not configured. Set GEMINI_API_KEY.' });
        }
        console.error('Error in chat endpoint:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// "Start over" — drops the multi-turn context held in Redis.
app.delete('/history', authMiddleware, async (req, res) => {
    await clearHistory({ id: req.id, role: req.role });
    res.json({ message: 'Conversation cleared' });
});
