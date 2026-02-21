import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Backend running!' });
});
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] })
    });
    const data = await response.json();
    if (data.candidates?.[0]) {
      res.json({ success: true, response: data.candidates[0].content.parts[0].text });
    } else {
      res.status(500).json({ success: false, error: 'No response' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.listen(PORT, () => {
  console.log('Server on port 5000');
  console.log('API ' + (GEMINI_API_KEY ? '✅' : '❌'));
});
