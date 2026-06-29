import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { corsMiddleware, limiter, helmetMiddleware } from './middleware/security.js';
import chatRoute from './routes/chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(limiter);

app.get('/', (req, res) => res.json({ status: 'ok', message: 'Backend running!' }));
app.use('/api', chatRoute);

app.listen(PORT, () => {
  console.log(`Server on port ${PORT}`);
  if (process.env.GROQ_API_KEY) {
    console.log('API is ready to use with GROQ API key.');
  } else {
    console.warn('Missing GROQ_API_KEY in backend/.env');
  }
});