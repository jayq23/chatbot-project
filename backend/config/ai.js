import Groq from 'groq-sdk';

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

export const AI_BEHAVIOR = {
  model: 'llama-3.3-70b-versatile',
  systemPrompt: `You are Renz Chatbot, a friendly and casual assistant. 
    Answer in 2-3 sentences max. No bullet points. Keep it short and conversational.`,
};

export default groq;