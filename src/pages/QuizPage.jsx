import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useBook } from '../context/BookContext';
import { quiz as quizApi } from '../api/client';
import QuizCard from '../components/QuizCard';

export default function QuizPage() {
  const location = useLocation();
  const { activeBook } = useBook();
  const preselected = location.state || {};

  // Config state
  const [pages, setPages] = useState(preselected.pages || '');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');

  // Quiz state
  const [mode, setMode] = useState('config'); // config | playing | results
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState({});
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!pages.trim()) {
      setError('Please enter a page range (e.g., 100-115)');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await quizApi.generate({
        book_id: activeBook,
        pages: pages.trim(),
        num_questions: numQuestions,
        difficulty,
      });
      if (res.data.questions && res.data.questions.length > 0) {
        setQuestions(res.data.questions);
        setTopic(res.data.topic || 'Medical Physiology');
        setAnswers({});
        setSubmitted({});
        setCurrentQ(0);
        setMode('playing');
      } else {
        setError('No questions were generated. Try a different page range.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate quiz. Check your API connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (letter) => {
    setAnswers({ ...answers, [currentQ]: letter });
  };

  const handleSubmitAnswer = () => {
    setSubmitted({ ...submitted, [currentQ]: true });
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setMode('results');
    }
  };

  const score = Object.keys(submitted).filter(
    (i) => answers[i] === questions[i]?.correct_answer
  ).length;

  const scorePercent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const resetQuiz = () => {
    setMode('config');
    setQuestions([]);
    setAnswers({});
    setSubmitted({});
    setCurrentQ(0);
  };

  // ---------- CONFIG MODE ----------
  if (mode === 'config') {
    return (
      <div className="page">
        <div className="page-header">
          <h1>🧠 Generate Quiz</h1>
          <p>Create a medical physiology MCQ quiz from any section of the textbook</p>
        </div>

        <div className="quiz-config">
          <div className="glass-card">
            {preselected.title && (
              <div style={{ marginBottom: '16px' }}>
                <span className="badge badge-teal">📖 {preselected.title}</span>
              </div>
            )}

            <div className="config-group">
              <div className="input-group">
                <label>Page Range</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., 100-115 or 50-60,70-80"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Number of Questions</label>
                <select
                  className="input"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                </select>
              </div>

              <div className="input-group">
                <label>Difficulty</label>
                <div className="difficulty-options">
                  {['easy', 'medium', 'hard'].map((d) => (
                    <div
                      key={d}
                      className={`difficulty-opt ${difficulty === d ? 'active' : ''}`}
                      onClick={() => setDifficulty(d)}
                    >
                      {d === 'easy' && '📗 '}
                      {d === 'medium' && '📙 '}
                      {d === 'hard' && '📕 '}
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {error && <div className="login-error" style={{ marginBottom: '16px' }}>{error}</div>}

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Generating quiz...
                </>
              ) : (
                '🚀 Generate Quiz'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- PLAYING MODE ----------
  if (mode === 'playing') {
    const q = questions[currentQ];
    const isSubmitted = submitted[currentQ];

    return (
      <div className="page">
        <div className="page-header">
          <h1>📝 {topic}</h1>
          <p>
            <span className="badge badge-teal">{difficulty}</span>
            {' '}
            <span className="badge badge-blue">Pages {pages}</span>
          </p>
        </div>

        <div className="quiz-play">
          <div className="quiz-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
              />
            </div>
            <span className="progress-text">{currentQ + 1} / {questions.length}</span>
          </div>

          <QuizCard
            question={q}
            questionIndex={currentQ}
            selectedAnswer={answers[currentQ]}
            onSelect={handleSelect}
            submitted={isSubmitted}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            {!isSubmitted ? (
              <button
                className="btn btn-primary"
                onClick={handleSubmitAnswer}
                disabled={!answers[currentQ]}
              >
                Submit Answer
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleNext}>
                {currentQ < questions.length - 1 ? 'Next Question →' : 'View Results →'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------- RESULTS MODE ----------
  return (
    <div className="page">
      <div className="quiz-results">
        <h1>Quiz Complete! 🎉</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{topic}</p>

        <div
          className={`score-circle ${
            scorePercent >= 80 ? 'good' : scorePercent >= 50 ? 'medium' : 'poor'
          }`}
        >
          <span className="score-value">{scorePercent}%</span>
          <span className="score-label">
            {score}/{questions.length} correct
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
          <button className="btn btn-primary" onClick={resetQuiz}>
            🔄 New Quiz
          </button>
          <button className="btn btn-secondary" onClick={() => setMode('playing')}>
            📋 Review Answers
          </button>
        </div>

        {/* Quick review */}
        <div style={{ textAlign: 'left' }}>
          {questions.map((q, i) => (
            <div
              key={i}
              className="glass-card"
              style={{
                marginBottom: '12px',
                padding: '12px 16px',
                borderLeft: `3px solid ${
                  answers[i] === q.correct_answer
                    ? 'var(--accent-green)'
                    : 'var(--accent-red)'
                }`,
              }}
            >
              <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                <strong>Q{i + 1}.</strong> {q.question.substring(0, 100)}...
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Your answer: {answers[i] || '—'} | Correct: {q.correct_answer}
                {q.page_reference && (
                  <span className="badge badge-teal" style={{ marginLeft: '8px' }}>
                    {q.page_reference}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
