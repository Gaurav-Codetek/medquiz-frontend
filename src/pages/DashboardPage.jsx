import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { document as docApi } from '../api/client';
import { FiBookOpen, FiHelpCircle } from 'react-icons/fi';
import { HiOutlineAcademicCap } from 'react-icons/hi';

export default function DashboardPage() {
  const { user } = useAuth();
  const [docInfo, setDocInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await docApi.getInfo();
        setDocInfo(res.data);
      } catch (err) {
        console.error('Failed to fetch doc info:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
    // Poll if still indexing
    const interval = setInterval(async () => {
      try {
        const res = await docApi.getStatus();
        if (res.data.status === 'ready') {
          const info = await docApi.getInfo();
          setDocInfo(info.data);
          clearInterval(interval);
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Welcome back, {user?.name} 👋</h1>
        <p>Ready to study medical physiology? Choose an activity below.</p>
      </div>

      {/* Stats */}
      <div className="dashboard-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon teal">📄</div>
          <div>
            <div className="stat-value">
              {loading ? '...' : docInfo?.page_count || '—'}
            </div>
            <div className="stat-label">Total Pages</div>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon amber">📑</div>
          <div>
            <div className="stat-value">
              {loading ? '...' : docInfo?.section_count || '—'}
            </div>
            <div className="stat-label">Chapters / Sections</div>
          </div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-icon blue">🔬</div>
          <div>
            <div className="stat-value">
              {docInfo?.status === 'ready' ? '✅' : '⏳'}
            </div>
            <div className="stat-label">
              {docInfo?.status === 'ready' ? 'Index Ready' : 'Indexing...'}
            </div>
          </div>
        </div>
      </div>

      {/* Document Description */}
      {docInfo?.doc_description && (
        <div className="glass-card" style={{ marginBottom: 'var(--space-xl)' }}>
          <h3 style={{ marginBottom: '8px', color: 'var(--accent-teal)' }}>📚 {docInfo.doc_name}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
            {docInfo.doc_description}
          </p>
        </div>
      )}

      {/* Quick Actions */}
      <h2 style={{ marginBottom: 'var(--space-lg)' }}>Quick Actions</h2>
      <div className="action-cards">
        <Link to="/browse" className="glass-card action-card">
          <div className="action-icon">📚</div>
          <h3>Browse Contents</h3>
          <p>Navigate the textbook structure using the table of contents tree</p>
        </Link>
        <Link to="/quiz" className="glass-card action-card">
          <div className="action-icon">🧠</div>
          <h3>Generate Quiz</h3>
          <p>Create MCQ quizzes from any chapter or page range</p>
        </Link>
        <Link to="/ask" className="glass-card action-card">
          <div className="action-icon">💬</div>
          <h3>Ask AI</h3>
          <p>Get detailed answers to any physiology question with page references</p>
        </Link>
      </div>
    </div>
  );
}
