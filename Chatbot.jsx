import React, { useState, useRef, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, onSnapshot, doc, getDoc, setDoc } from "firebase/firestore";
import axios from 'axios';

// Main App component for the chatbot
export default function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userId, setUserId] = useState(null);
  const [speakingMessageId, setSpeakingMessageId] = useState(null); // Tracks the ID of the message being spoken
  const messagesEndRef = useRef(null);

  // You must provide your own API key here.
  // Obtain one from https://makersuite.google.com/
  const API_KEY = "AIzaSyBf7ipgrAPp-Lr70Ask8fCxCdbXSlCKUtU"; 
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;
  
  // Firebase initialization
  useEffect(() => {
    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
    
    if (Object.keys(firebaseConfig).length > 0) {
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const db = getFirestore(app);

      const authStateListener = onAuthStateChanged(auth, async (user) => {
        if (!user && initialAuthToken) {
          try {
            await signInWithCustomToken(auth, initialAuthToken);
          } catch (error) {
            console.error("Custom token sign-in failed:", error);
            await signInAnonymously(auth);
          }
        } else if (!user) {
          await signInAnonymously(auth);
        }
        setUserId(auth.currentUser?.uid || crypto.randomUUID());
        setIsAuthReady(true);
      });

      return () => authStateListener();
    } else {
      console.warn("Firebase configuration not found. Running in standalone mode.");
      setIsAuthReady(true);
      setUserId(crypto.randomUUID());
    }
  }, []);

  // Function to scroll to the bottom of the chat window
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // **(FEATURE): TEXT-TO-SPEECH (TTS)**
  const speakMessage = (text, messageId) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(messageId);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setSpeakingMessageId(null);
      utterance.onerror = () => setSpeakingMessageId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      console.error("Text-to-Speech is not supported by this browser.");
      setSpeakingMessageId(null);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }
  };

  // Function to handle Speech-to-Text (STT)
  const startListening = () => {
    stopSpeaking();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech-to-Text is not supported by your browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      handleSendMessage(transcript);
    };
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // Asynchronous function to get a medical response from the Gemini API
  const getMedisortResponse = async (userMessage) => {
    const systemPrompt = "You are Medisort, a kind, friendly, and highly knowledgeable female medical assistant. Your purpose is to provide helpful, concise, and accurate medical information. Always remind the user that you are an AI and not a substitute for professional medical advice from a doctor. Use Google Search to find relevant, up-to-date information to answer the user's questions about medical topics, conditions, treatments, and general health. Keep your responses conversational and easy to understand.";

    const payload = {
        contents: [{ parts: [{ text: userMessage }] }],
        tools: [{ "google_search": {} }],
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
    };

    const fetchWithRetry = async (url, options, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          const response = await fetch(url, options);
          if (response.ok) return response;
          if (response.status === 401) throw new Error(`API error: ${response.status} Invalid API Key`);
          console.error(`API error: ${response.status} ${response.statusText}. Retrying...`);
        } catch (error) {
          console.error(`Network or fetch error: ${error.message}. Retrying...`);
        }
        await new Promise(res => setTimeout(res, 2 ** i * 1000));
      }
      throw new Error("Failed to fetch from API after multiple retries.");
    };

    try {
      const response = await fetchWithRetry(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });
      const result = await response.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return "I'm sorry, I couldn't find a clear answer for that. Could you please rephrase your question?";
      return text;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return "I'm sorry, I am currently unable to connect with my knowledge base. Please try again later. Make sure your API key is correctly entered.";
    }
  };

  // Function to send a message and get a response
  const handleSendMessage = async (messageToSend = inputMessage) => {
    const trimmedMessage = messageToSend.trim();
    if (trimmedMessage === '') return;

    const newUserMessage = { text: trimmedMessage, sender: 'user', id: Date.now() };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInputMessage('');
    setIsLoading(true);

    const botResponseText = await getMedisortResponse(trimmedMessage);
    const newBotMessage = { text: botResponseText, sender: 'bot', id: Date.now() + 1 };
    
    setMessages(prevMessages => [...prevMessages, newBotMessage]);
    setIsLoading(false);
    
    // Call the TTS function for the new bot message
    speakMessage(botResponseText, newBotMessage.id);
  };
  
  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-slate-300">
        <p className="text-xl animate-pulse">Initializing app...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-8 font-sans text-slate-100">
      <div className="flex flex-col w-full max-w-2xl h-[80vh] bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-700">
        
        {/* Chat Header */}
        <div className="bg-slate-700 p-6 text-center text-2xl font-bold rounded-t-3xl">
          Medisort AI Chatbot 👩🏻‍⚕️
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div 
              key={msg.id || index} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`flex items-start gap-2 p-4 rounded-xl max-w-[85%] break-words transition-all duration-300 ease-in-out ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none hover:bg-blue-700' 
                    : 'bg-slate-700 text-slate-200 rounded-bl-none hover:bg-slate-600'
                }`}
              >
                {msg.sender === 'bot' && (
                  <button onClick={() => speakingMessageId === msg.id ? stopSpeaking() : speakMessage(msg.text, msg.id)} className="flex-shrink-0 mt-0.5">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-5 w-5 ${speakingMessageId === msg.id ? 'text-green-400 animate-pulse' : 'text-slate-400 hover:text-green-400'}`} 
                      viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C10.895 2 10 2.895 10 4V12C10 13.105 10.895 14 12 14C13.105 14 14 13.105 14 12V4C14 2.895 13.105 2 12 2ZM8 12C8 14.761 10.239 17 13 17V21H11V23H15V21H13V17C15.761 17 18 14.761 18 12H16C16 13.657 14.657 15 13 15C11.343 15 10 13.657 10 12H8ZM12 4C12 3.447 12.447 3 13 3H11C11.553 3 12 3.447 12 4V12C12 12.553 11.553 13 11 13H13C13.553 13 14 12.553 14 12V4Z" />
                    </svg>
                  </button>
                )}
                <p className="flex-grow">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-700 p-4 rounded-xl rounded-bl-none text-slate-400 animate-pulse">
                Typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Area */}
        <div className="p-6 bg-slate-900 rounded-b-3xl flex items-center space-x-4 border-t border-slate-700">
          <input
            type="text"
            className="flex-1 p-4 rounded-full bg-slate-800 text-white placeholder-slate-500 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isListening ? "Listening..." : "Ask a medical question..."}
            disabled={isListening || isLoading}
          />
          <button
            onClick={startListening}
            className={`p-4 rounded-full transition-all duration-300 transform ${
              isListening ? 'bg-red-600 hover:bg-red-700 scale-110' : 'bg-slate-700 hover:bg-slate-600'
            }`}
            disabled={isLoading}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-6 w-6 text-white ${isListening ? 'animate-pulse' : ''}`} 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 2C10.895 2 10 2.895 10 4V12C10 13.105 10.895 14 12 14C13.105 14 14 13.105 14 12V4C14 2.895 13.105 2 12 2ZM8 12C8 14.761 10.239 17 13 17V21H11V23H15V21H13V17C15.761 17 18 14.761 18 12H16C16 13.657 14.657 15 13 15C11.343 15 10 13.657 10 12H8ZM12 4C12 3.447 12.447 3 13 3H11C11.553 3 12 3.447 12 4V12C12 12.553 11.553 13 11 13H13C13.553 13 14 12.553 14 12V4Z" />
            </svg>
          </button>
          <button
            onClick={() => handleSendMessage()}
            className="p-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-200"
            disabled={!inputMessage.trim() || isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}