import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();
const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Backend running!' });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: message }],
      model: 'llama-3.3-70b-versatile',
    });
    res.json({ success: true, response: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log('Server on port 5000');
  console.log('API ' + (process.env.GROQ_API_KEY ? '✅' : '❌'));
});