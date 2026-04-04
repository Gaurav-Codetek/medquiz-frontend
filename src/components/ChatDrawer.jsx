import { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import ReactMarkdown from 'react-markdown';

export default function ChatDrawer() {
  const { 
    messages, loading, sendMessage, summarize, clearChat, 
    isDrawerOpen, closeDrawer, sessionId 
  } = useChat();
  
  const [inputMsg, setInputMsg] = useState('');
  const [manualPages, setManualPages] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isDrawerOpen]);

  if (!isDrawerOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    sendMessage(inputMsg, true, manualPages);
    setInputMsg('');
  };

  return (
    <>
      <div className="drawer-overlay" onClick={closeDrawer} />
      
      <div className="drawer-content animate-scaleIn">
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-header-left">
            <div className="drawer-avatar">
              AI
            </div>
            <div>
              <h2 className="drawer-title">Ask AI Assistant</h2>
              <p className="drawer-subtitle">MedQuiz Context</p>
            </div>
          </div>
          <div className="drawer-actions">
            <a 
              href="/ask" 
              target="_blank" 
              className="drawer-btn tooltip"
              title="Open in new tab"
            >
              ⧉
            </a>
            <button onClick={clearChat} className="drawer-btn drawer-btn-danger tooltip" title="Clear Chat">
              🗑️
            </button>
            <button onClick={closeDrawer} className="drawer-btn tooltip" title="Close Drawer">
              ❌
            </button>
          </div>
        </div>

        {/* Message List */}
        <div className="drawer-messages">
          {messages.length === 0 ? (
            <div className="drawer-empty-state">
              <div className="text-4xl">🧬</div>
              <p>Ask me anything about medical physiology or Guyton & Hall.</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`drawer-msg-wrapper ${msg.role === 'user' ? 'drawer-msg-user' : 'drawer-msg-ai'}`}>
                <div className={`drawer-msg-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}>
                  {msg.role !== 'user' && <div className="drawer-msg-label">MedQuiz AI</div>}
                  <div className="drawer-msg-content">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  {msg.source_pages && (
                    <div className="drawer-msg-sources">
                      📄 Sources: p.{msg.source_pages}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="drawer-msg-wrapper drawer-msg-ai">
              <div className="drawer-msg-bubble ai typing-bubble">
                <div className="dot"></div>
                <div className="dot delay-1"></div>
                <div className="dot delay-2"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="drawer-input-area">
          <form onSubmit={handleSubmit} className="drawer-form">
            <input
              type="text"
              placeholder="E.g., 24-25"
              title="Specific pages (optional)"
              className="input drawer-page-input"
              value={manualPages}
              onChange={(e) => setManualPages(e.target.value)}
            />
            <input
              type="text"
              placeholder="Ask a question..."
              className="input drawer-text-input"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputMsg.trim()}
              className="btn btn-primary"
            >
              Ask
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
