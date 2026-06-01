import express from 'express';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

export const app = express.Router();
const MODEL_NAME = "gemini-1.5-flash";

async function runChat(userInput) {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
    }
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 1000,
    };

    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ];

    const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [
            {
                role: "user",
                parts: [{ text: "You are Devika, a friendly assistant who works for Sync Fission. Sync Fission is a website that connects tutors and students online in an efficient manner. Help students and tutors with education-related queries and provide accurate, helpful responses." }],
            },
            {
                role: "model",
                parts: [{ text: "Hello! I'm Devika, your AI teaching assistant at Sync Fission. I'm here to help you with any education-related questions. How can I assist you today?" }],
            },
        ],
    });

    const result = await chat.sendMessage(userInput);
    return result.response.text();
}

app.post('/send', async (req, res) => {
    try {
        const userInput = req.body?.userInput;
        if (!userInput) {
            return res.status(400).json({ error: 'Invalid request body' });
        }
        const response = await runChat(userInput);
        res.json({ response });
    } catch (error) {
        console.error('Error in chat endpoint:', error);
        if (error.message === "GEMINI_API_KEY is not configured") {
            return res.status(503).json({ error: 'AI Assistant is not configured. Please set GEMINI_API_KEY.' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
