import { useState, useRef, useEffect } from 'react';
import '../styles/main.css';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { cleanMarkdown, shortenResponse } from '../utils/helpers';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/chat';

function Chatbot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { text: "Hello! I'm Renz Chatbot. How can I help you today?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) navigate('/login');
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getAIResponse = async (userMessage) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      if (!response.ok) {
        let backendError = `API Error: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData?.error) backendError = errorData.error;
        } catch { }
        throw new Error(backendError);
      }

      const data = await response.json();

      if (data.success && data.response) {
        return shortenResponse(cleanMarkdown(data.response));
      }
      return "I'm sorry, I couldn't process that request. Please try again.";
    } catch (error) {
      console.error('Error calling backend API:', error);
      return "I'm experiencing technical difficulties. Error: " + error.message;
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

    const botResponseText = await getAIResponse(currentInput);
    setMessages(prev => [...prev, { text: botResponseText, sender: 'bot' }]);
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
            <h2>Renz Chatbot</h2>
          </div>
          <button className="logoutbtn" onClick={handleLogout}>Log Out</button>
        </div>
      </div>

      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
          >
            <div className="message-content">{message.text}</div>
          </div>
        ))}

        {isTyping && (
          <div className="message bot-message">
            <div className="message-content typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chatbot-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="chatbot-input"
          disabled={isTyping}
        />
        <button type="submit" className="send-button" disabled={isTyping}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </form>
    </div>
  );
}

export default Chatbot;