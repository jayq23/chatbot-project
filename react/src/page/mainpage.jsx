import { useState, useRef, useEffect } from 'react';
import '../styles/main.css';
import { useNavigate } from 'react-router-dom';

function Chatbot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { text: "Hello! I'm Renz Chatbot. How can I help you today?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Backend API URL
  const API_URL = 'https://chatbot-project-159z.onrender.com/api/chat';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Strip markdown formatting from AI response
  const cleanMarkdown = (text) => {
    return text
      .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/~~(.*?)~~/g, '$1')
      .replace(/`{3}[\s\S]*?`{3}/g, '')
      .replace(/`(.*?)`/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^\s*[-*+]\s+/gm, '• ')
      .replace(/^\s*\d+\.\s+/gm, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^>\s+/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  // Keep only the first 3 sentences of a response
  const shortenResponse = (text) => {
    const sentences = text.match(/[^.!?]+[.!?]+/g);
    if (!sentences) return text;
    return sentences.slice(0, 3).join(' ').trim();
  };

  // Function to call backend API
  const getAIResponse = async (userMessage) => {
    try {
      // Wrap the user message to instruct the AI to be concise
      const wrappedMessage = `Answer in 2-3 sentences max, no bullet points, keep it casual and short: ${userMessage}`;

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: wrappedMessage
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.response) {
        const cleaned = cleanMarkdown(data.response);
        return shortenResponse(cleaned);
      }
      else {
        return "I'm sorry, I couldn't process that request. Please try again.";
      }
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
    const botResponse = { text: botResponseText, sender: 'bot' };

    setMessages(prev => [...prev, botResponse]);
    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleLogout = () => {
    if(window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('currentUser');
      navigate('/');
    } else {
      return;
    }
  }
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
            <div className="message-content">
              {message.text}
            </div>
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