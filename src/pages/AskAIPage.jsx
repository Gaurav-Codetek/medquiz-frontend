import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useBook } from '../context/BookContext';
import { useChat } from '../context/ChatContext';
import { FiSend } from 'react-icons/fi';

export default function AskAIPage() {
  const location = useLocation();
  const preselected = location.state || {};
  const { books, activeBook } = useBook();
  const activeBookInfo = books?.find(b => b.id === activeBook);

  const { messages, loading, sendMessage, summarize, clearChat } = useChat();
  const [input, setInput] = useState('');
  const [useAutoRetrieve, setUseAutoRetrieve] = useState(!preselected.pages);
  const [manualPages, setManualPages] = useState(preselected.pages || '');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const question = input.trim();
    setInput('');
    // Automatically uses context
    await sendMessage(question, useAutoRetrieve, manualPages);
  };

  const handleSummarize = async () => {
    if (!manualPages.trim()) return;
    await summarize(manualPages);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Simple markdown-like rendering
  const renderContent = (text) => {
    if (!text) return null;
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^### (.*$)/gm, '<h4>$1</h4>')
      .replace(/^## (.*$)/gm, '<h3>$1</h3>')
      .replace(/^# (.*$)/gm, '<h2>$1</h2>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
      .replace(/\n/g, '<br/>');
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="page" style={{ paddingBottom: 0 }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1>💬 Ask AI</h1>
          <p>Ask anything about {activeBookInfo?.title || 'the selected book'} — history is synced with your drawer</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={clearChat} style={{borderColor: 'var(--accent-red)', color: 'var(--accent-red)'}}>
          Clear Chat
        </button>
      </div>

      {/* Controls bar */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
          <input
            type="checkbox"
            checked={useAutoRetrieve}
            onChange={(e) => setUseAutoRetrieve(e.target.checked)}
            style={{ accentColor: 'var(--accent-teal)' }}
          />
          <span style={{ color: 'var(--text-secondary)' }}>🤖 Auto-find relevant pages</span>
        </label>

        {!useAutoRetrieve && (
          <>
            <input
              type="text"
              className="input"
              placeholder="Pages: e.g., 100-115"
              value={manualPages}
              onChange={(e) => setManualPages(e.target.value)}
              style={{ width: '180px', fontSize: '0.85rem', padding: '8px 12px' }}
            />
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleSummarize}
              disabled={!manualPages.trim() || loading}
            >
              📋 Summarize
            </button>
          </>
        )}

        {preselected.title && (
          <span className="badge badge-teal">📖 {preselected.title}</span>
        )}
      </div>

      {/* Chat Container */}
      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="empty-state" style={{ paddingTop: '60px' }}>
              <div className="empty-icon">🔬</div>
              <h3>Ask anything about {activeBookInfo?.title || 'this book'}</h3>
              <p style={{ maxWidth: '400px' }}>
                Your chat is synced! You can open this in a new tab or use the side drawer.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role}`}>
              {msg.role !== 'user' && <div style={{ fontSize: '0.7rem', color: 'var(--primary-light)', marginBottom: '4px', textTransform:'uppercase', letterSpacing: '1px'}}>AI Tutor</div>}
              {msg.role === 'ai' || msg.role === 'assistant' ? renderContent(msg.content) : msg.content}
              {msg.source_pages && (
                <div className="page-refs">
                  <span className="badge badge-teal">📄 Pages {msg.source_pages}</span>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="typing-indicator">
              <span /><span /><span />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-area">
          <input
            type="text"
            className="input"
            placeholder={`Ask a question about ${activeBookInfo?.title || 'the book'}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={!input.trim() || loading}
          >
            <FiSend size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
