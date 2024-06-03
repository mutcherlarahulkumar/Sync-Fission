// node --version # Should be >= 18

import express from 'express';
import {GoogleGenerativeAI, HarmCategory, HarmBlockThreshold} from '@google/generative-ai';
// const dotenv = require('dotenv').config()

export const app = express();
const MODEL_NAME = "gemini-pro";
const API_KEY = "Generate Your Own API Key from Google Cloud Console";

async function runChat(userInput) {
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
        parts: [{ text: "You are Devika, a friendly assistant who works for Sync Fission. Sync Fission is a website that connects tutor and students online in an efficient manner. You are here to help students and tutors to help with their own queries anything related to education and all so be careful and give accurate results to them"}],
      },
      {
        role: "model",
        parts: [{ text: "Let me help with your query"}],
      },
    ],
  });

  const result = await chat.sendMessage(userInput);
  const response = result.response;
  return response.text();
}

app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/index.html');
});
app.get('/loader.gif', (req, res) => {
//   res.sendFile(__dirname + '/loader.gif');
});
app.post('/send', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    console.log('incoming /chat req', userInput)
    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
