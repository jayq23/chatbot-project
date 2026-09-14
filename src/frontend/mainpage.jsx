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
   "https://embed.music.apple.com/ph/album/end-of-beginning/1632447652?i=1632448108",
   "https://embed.music.apple.com/ph/album/photograph/1728406717?i=1728406718",
   "https://embed.music.apple.com/ph/album/happier/1728406717?i=1728407376",
   "https://embed.music.apple.com/ph/album/iraya/1458737492?i=1458737499",
   "https://embed.music.apple.com/ph/album/somebody-else/1440840422?i=1440841304",
   "https://embed.music.apple.com/ph/album/all-i-need-to-hear/1850018862?i=1850019034"
  ],
  Healing: [
   "https://embed.music.apple.com/ph/album/youre-on-your-own-kid/1649434004?i=1649434298",
   "https://embed.music.apple.com/ph/album/in-the-stars/1728406717?i=1728406725",
  ],
  Love: [
   "https://embed.music.apple.com/ph/album/love-story-taylors-version/1552791073?i=1552791427",
   "https://embed.music.apple.com/ph/album/i-knew-it-i-knew-you-from-toy-story-5/6775527442?i=6775527443",
   "https://embed.music.apple.com/ph/album/libu-libong-buwan-uuwian/1833479414?i=1833479419",
   "https://embed.music.apple.com/ph/album/thinking-out-loud/1728406717?i=1728407151",
   "https://embed.music.apple.com/ph/album/yellow/1728406717?i=1728407168",
   "https://embed.music.apple.com/ph/album/still-into-you/1728406717?i=1728407176",
   "https://embed.music.apple.com/ph/album/drop-dead/1889992111?i=1889992113",
   "https://embed.music.apple.com/ph/album/maikees-letters/1458777479?i=1458777482",
   "https://embed.music.apple.com/ph/album/co-pilot-feat-jolo-rjay-ty/1458737492?i=1458737495"
  ],
  brokenhearted: [
   "https://embed.music.apple.com/ph/album/the-1/1524801260?i=1524801274",
   "https://embed.music.apple.com/ph/album/youre-losing-me-from-the-vault/1718576580?i=1718576584",
   "https://embed.music.apple.com/ph/album/indecision-feat-daniel-caesar-single/6797490125",
   "https://embed.music.apple.com/ph/album/backburner/1766383174?i=1766383338",
   "https://embed.music.apple.com/ph/album/oceans-engines/1766383174?i=1766383800",
   "https://embed.music.apple.com/ph/album/all-i-wanted/1728406717?i=1728406722",
   "https://embed.music.apple.com/ph/album/dawns-feat-maggie-rogers/1728406717?i=1728407385",
   "https://embed.music.apple.com/ph/album/super-far/1440893646?i=1440894151",
  ],
  Motivation: [
   "https://embed.music.apple.com/ph/album/cheerleader-felix-jaehn-remix-radio-edit/1033360002?i=1033360497",
   "https://embed.music.apple.com/ph/album/safe-and-sound/1766005775?i=1766005776",
   "https://embed.music.apple.com/ph/album/shinobi/1229585918?i=1229585919",
   "https://embed.music.apple.com/ph/album/stop-crying-your-heart-out/821026276?i=821026309",
  ],
  Comeback: [
   "https://embed.music.apple.com/ph/album/rosas-feat-skusta-clee/1862444504?i=1862445191",
   "https://embed.music.apple.com/ph/album/wouldve-been-you/1716618620?i=1716618621",
   "https://embed.music.apple.com/ph/album/a-sky-full-of-stars/1728406717?i=1728406719",
   "https://embed.music.apple.com/ph/album/happiest-year/1728406717?i=1728407170",
   "https://embed.music.apple.com/ph/album/the-scientist/1728406717?i=1728407361",
   "https://embed.music.apple.com/ph/album/di-ako-f-y-feat-agsunta/1243634221?i=1243634230",
   "https://embed.music.apple.com/ph/album/party-4-u/1513162098?i=1513162746"
  ],
  Vibes: [
   "https://embed.music.apple.com/ph/album/pauwi-nako/1420486990?i=1420487203",
   "https://embed.music.apple.com/ph/album/sa-susunod-na-lang/1438142527?i=1438142923",
   "https://embed.music.apple.com/ph/album/dyosa-live/1780496650?i=1780496654",
   "https://embed.music.apple.com/ph/album/blinding-lights/1488408555?i=1488408568",
   "https://embed.music.apple.com/ph/album/no-broke-boys/1818761033?i=1818761158",
   "https://embed.music.apple.com/ph/album/alam-ko-na-feat-just-hush-third-flo/1666464930?i=1666464938",
  ]
};

function getSongByIndex(mood, songNumber) {
  const choices = SONG_CHOICES[mood];
  if (!choices || choices.length === 0) return null;

  const index = songNumber - 1; 
  if (Number.isNaN(index) || index < 0 || index >= choices.length) {

    return choices[Math.floor(Math.random() * choices.length)];
  }
  return choices[index];
}

function getRandomSong(mood) {
  const choices = SONG_CHOICES[mood];
  if (!choices || choices.length === 0) return null;
  return choices[Math.floor(Math.random() * choices.length)];
}

function parseMood(text) {

  const moodMatch = text.match(/\[MOOD:(\w+)(?::(\d+))?\]/);
  const mood = moodMatch ? moodMatch[1] : null;
  const songNumber = moodMatch && moodMatch[2] ? parseInt(moodMatch[2], 10) : null;
  const cleanText = text.replace(/\[MOOD:\w+(?::\d+)?\]/, '').trim();
  return { cleanText, mood, songNumber };
}


function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}


function getDailySong(mood, songNumber, uid) {
  if (!mood || !uid) return null;

  const storageKey = `talktojay_song_${uid}_${mood}`;
  const todayKey = getTodayKey();

  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');

    if (stored && stored.date === todayKey && stored.url) {

      return stored.url;
    }

    const chosenUrl = songNumber ? getSongByIndex(mood, songNumber) : getRandomSong(mood);
    if (!chosenUrl) return null;

    localStorage.setItem(storageKey, JSON.stringify({ date: todayKey, url: chosenUrl }));
    return chosenUrl;
  } catch {
    return songNumber ? getSongByIndex(mood, songNumber) : getRandomSong(mood);
  }
}

function Chatbot() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you today?", sender: 'bot' }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      const name = user.displayName || user.email?.split('@')[0] || 'User';
      setUserName(name);
      setUserId(user.uid);


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
  const songUrl = getDailySong(mood, songNumber, userId);

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