import { createContext, useContext, useState, useEffect } from 'react';
import { qa } from '../api/client';
import { useAuth } from './AuthContext';
import { useBook } from './BookContext';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const { activeBook } = useBook();
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(localStorage.getItem('medquiz_session_id') || null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load session from MongoDB if we have an ID
  useEffect(() => {
    if (user && sessionId) {
      qa.getSession(sessionId)
        .then(res => {
          setMessages(res.data.messages || []);
        })
        .catch(err => {
          console.error("Failed to load chat history", err);
          if (err.response?.status === 404) {
            setSessionId(null);
            localStorage.removeItem('medquiz_session_id');
            setMessages([]);
          }
        });
    } else if (!user) {
      setMessages([]);
      setSessionId(null);
    }
  }, [user, sessionId]);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);
  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const sendMessage = async (question, useAutoRetrieve, manualPages) => {
    if (!question.trim()) return;
    
    // Optimistic UI
    const newUserMsg = { role: 'user', content: question };
    setMessages(prev => [...prev, newUserMsg]);
    setLoading(true);

    try {
      const payload = { question, book_id: activeBook };
      if (sessionId) payload.session_id = sessionId;
      if (useAutoRetrieve) {
        payload.auto_retrieve = true;
      } else if (manualPages && manualPages.trim()) {
        payload.pages = manualPages.trim();
      } else {
        payload.auto_retrieve = true;
      }

      const res = await qa.ask(payload);
      
      if (res.data.session_id && res.data.session_id !== sessionId) {
        setSessionId(res.data.session_id);
        localStorage.setItem('medquiz_session_id', res.data.session_id);
      }

      setMessages(prev => [...prev, {
        role: 'ai',
        content: res.data.answer,
        source_pages: res.data.source_pages
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: `❌ Error: ${err.response?.data?.detail || 'Failed to get answer.'}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  const summarize = async (manualPages) => {
    if (!manualPages || !manualPages.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: `📋 Summarize pages ${manualPages}` }]);
    setLoading(true);

    try {
      const res = await qa.summarize({ pages: manualPages.trim(), book_id: activeBook });
      setMessages(prev => [...prev, {
        role: 'ai',
        content: res.data.summary,
        source_pages: res.data.source_pages
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: `❌ Error summarizing.` }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setSessionId(null);
    localStorage.removeItem('medquiz_session_id');
    setMessages([]);
  };

  return (
    <ChatContext.Provider value={{
      messages,
      sessionId,
      loading,
      sendMessage,
      summarize,
      clearChat,
      isDrawerOpen,
      toggleDrawer,
      openDrawer,
      closeDrawer
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
