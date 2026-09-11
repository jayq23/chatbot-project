import { useState, useRef, useEffect } from 'react';
import '../styles/main.css';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { cleanMarkdown, shortenResponse } from '../utils/helpers';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/chat';

const SONG_CHOICES = {
  Relapse: [
   "https://embed.music.apple.com/ph/album/what-if-i-call/6788172076?i=6788172077",
   "https://embed.music.apple.com/ph/album/merry-christmas-i-miss-you/6784789928?i=6784789929",
   "https://embed.music.apple.com/ph/album/merry-christmas-please-dont-call/1775877095?i=1775877096",
   "https://embed.music.apple.com/ph/album/loml/1742057774?i=1742058103",
   "https://embed.music.apple.com/ph/album/lifetime-reimagined/1887316728?i=1887316735",
   "https://embed.music.apple.com/ph/album/panaginip/1821585683?i=1821585685",
   "https://embed.music.apple.com/ph/album/end-of-beginning/1632447652?i=1632448108"
  ],
  Healing: [
   "https://embed.music.apple.com/ph/album/youre-on-your-own-kid/1649434004?i=1649434298",
  ],
  Love: [
   "https://embed.music.apple.com/ph/album/love-story-taylors-version/1552791073?i=1552791427",
   "https://embed.music.apple.com/ph/album/i-knew-it-i-knew-you-from-toy-story-5/6775527442?i=6775527443",
   "https://embed.music.apple.com/ph/album/libu-libong-buwan-uuwian/1833479414?i=1833479419",
  ],
  brokenhearted: [
   "https://embed.music.apple.com/ph/album/the-1/1524801260?i=1524801274",
   "https://embed.music.apple.com/ph/album/youre-losing-me-from-the-vault/1718576580?i=1718576584",
   "https://embed.music.apple.com/ph/album/indecision-feat-daniel-caesar-single/6797490125"
  ],
  Motivation: [
   
  ],
  Comeback: [
   "https://embed.music.apple.com/ph/album/rosas-feat-skusta-clee/1862444504?i=1862445191",
  ],
  Vibes: [
   "https://embed.music.apple.com/ph/album/pauwi-nako/1420486990?i=1420487203",
   "https://embed.music.apple.com/ph/album/sa-susunod-na-lang/1438142527?i=1438142923",
   "https://embed.music.apple.com/ph/album/dyosa-live/1780496650?i=1780496654"
  ]
};

// Kunin ang exact na kanta base sa number na ibinigay ng LLM (1-based index sa prompt list)
function getSongByIndex(mood, songNumber) {
  const choices = SONG_CHOICES[mood];
  if (!choices || choices.length === 0) return null;

  const index = songNumber - 1; // convert 1-based (prompt) -> 0-based (array)
  if (Number.isNaN(index) || index < 0 || index >= choices.length) {
    // fallback: kung invalid/out-of-range yung number, random na lang
    return choices[Math.floor(Math.random() * choices.length)];
  }
  return choices[index];
}

// Fallback lang ito kung walang songNumber na ibinigay (e.g. Motivation na walang songs)
function getRandomSong(mood) {
  const choices = SONG_CHOICES[mood];
  if (!choices || choices.length === 0) return null;
  return choices[Math.floor(Math.random() * choices.length)];
}

function parseMood(text) {
  // bagong format: [MOOD:Category:Number] o [MOOD:Category] (walang song number, e.g. Motivation)
  const moodMatch = text.match(/\[MOOD:(\w+)(?::(\d+))?\]/);
  const mood = moodMatch ? moodMatch[1] : null;
  const songNumber = moodMatch && moodMatch[2] ? parseInt(moodMatch[2], 10) : null;
  const cleanText = text.replace(/\[MOOD:\w+(?::\d+)?\]/, '').trim();
  return { cleanText, mood, songNumber };
}

function Chatbot() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you today?", sender: 'bot' }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [userName, setUserName] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Get currently logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      const name = user.displayName || user.email?.split('@')[0] || 'User';
      setUserName(name);

      // Personalize the greeting once we know who they are
      setMessages(prev => {
        if (prev.length === 1 && prev[0].sender === 'bot') {
          return [{ text: `Hello, ${name}!`, sender: 'bot' }];
        }
        return prev;
      });
    });

    return () => unsubscribe();
  }, [navigate]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getAIResponse = async (userMessage) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        userName: userName,
        history: messages.map(msg => ({ text: msg.text, sender: msg.sender }))
      })
    });

    if (!response.ok) {
      let backendError = `API Error: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData?.error) backendError = errorData.error;
      } catch {}
      throw new Error(backendError);
    }

    const data = await response.json();

    if (data.success && data.response) {
  const { cleanText, mood, songNumber } = parseMood(data.response);
  const finalText = shortenResponse(cleanMarkdown(cleanText));
  return { text: finalText, mood, songNumber };
}

    return { text: "I'm sorry, I couldn't process that request. Please try again.", mood: null, songNumber: null };

  } catch (error) {
    console.error('Error calling backend API:', error);
    return { text: "I'm experiencing technical difficulties. Error: " + error.message, isSad: false };
  }
};

  const handleSendMessage = async (e) => {
  e.preventDefault();
  if (inputValue.trim() === '') return;

  const userMessage = { text: inputValue, sender: 'user' };
  setMessages(prev => [...prev, userMessage]);

  const currentInput = inputValue;
  setInputValue('');
  setIsTyping(true);

  const { text, mood, songNumber } = await getAIResponse(currentInput);
  const songUrl = mood
    ? (songNumber ? getSongByIndex(mood, songNumber) : getRandomSong(mood))
    : null;

  setMessages(prev => [
    ...prev,
    { text, sender: 'bot', mood, songUrl }
  ]);

  setIsTyping(false);
};

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      await signOut(auth);
      navigate('/login');
    }
  };

  return (
    <div className="chatbot-container">

      <div className="chatbot-header">
        <div className="header-content">

          <div className="header-text">
            <h2>TalkToJay</h2>
          </div>

          <button
            className="logoutbtn"
            onClick={handleLogout}
          >
            Log Out
          </button>

        </div>
      </div>

      <div className="chatbot-messages">

      {messages.map((message, index) => (
  <div key={index} className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}>
    <div className="message-content">
      {message.text}
    </div>

    {message.songUrl && (
      <iframe
        style={{
          borderRadius: '12px',
          marginTop: '8px',
          width: '100%',
          maxWidth: '320px',
          display: 'block'
        }}
        src={message.songUrl}
        width="100%"
        height="150"
        frameBorder="0"
        allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
        sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
        loading="lazy"
      />
    )}
  </div>
))}

        {isTyping && (
          <div className="message bot-message">
            <div className="message-content typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />

      </div>

      <form
        className="chatbot-input-form"
        onSubmit={handleSendMessage}
      >

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="chatbot-input"
          disabled={isTyping}
        />

        <button
          type="submit"
          className="send-button"
          disabled={isTyping}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M22 2L11 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M22 2L15 22L11 13L2 9L22 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

      </form>

    </div>
  );
}

export default Chatbot;