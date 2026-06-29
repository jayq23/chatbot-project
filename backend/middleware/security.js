import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  'http://localhost:5173',
  'http://localhost:5174',
  'https://chatbot-project-nyd8.vercel.app',
  'https://renz-chatbot.vercel.app'
].filter(Boolean);

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`));
  }
});

export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, try again later.'
});

export const helmetMiddleware = helmet();