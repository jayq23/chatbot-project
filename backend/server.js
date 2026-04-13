import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
const app = express();
const PORT = 5000;
app.use(express.json());

app.use(helmet()); // Use Helmet to set secure HTTP headers

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  'http://localhost:5173',
  'http://localhost:5174',
  'https://chatbot-project-nyd8.vercel.app',
  'https://renz-chatbot.vercel.app'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests without Origin header.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  }
}))
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter); // Apply the rate limiting middleware to all requests

const groqApiKey = process.env.GROQ_API_KEY;
const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Backend running!' });
});

app.post('/api/chat', async (req, res) => {
  try {
    if (!groq) {
      return res.status(500).json({
        success: false,
        error: 'Missing GROQ_API_KEY in backend/.env. Add GROQ_API_KEY and restart backend.'
      });
    }

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
  if (groqApiKey) {
    console.log('API ✅');
  } else {
    console.warn('API ❌ Missing GROQ_API_KEY in backend/.env (chat endpoint will return a config error)');
  }
});