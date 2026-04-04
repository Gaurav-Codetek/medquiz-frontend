export default function QuizCard({
  question,
  questionIndex,
  selectedAnswer,
  onSelect,
  submitted,
}) {
  const letters = ['A', 'B', 'C', 'D'];

  const getOptionClass = (idx) => {
    const letter = letters[idx];
    let cls = 'option-item';

    if (submitted) {
      cls += ' disabled';
      if (letter === question.correct_answer) {
        cls += ' correct';
      } else if (letter === selectedAnswer && letter !== question.correct_answer) {
        cls += ' incorrect';
      }
    } else if (letter === selectedAnswer) {
      cls += ' selected';
    }

    return cls;
  };

  return (
    <div className="question-card glass-card">
      <div className="question-text">
        <span style={{ color: 'var(--accent-teal)', marginRight: '8px' }}>
          Q{questionIndex + 1}.
        </span>
        {question.question}
      </div>

      <div className="options-list">
        {question.options.map((option, idx) => (
          <div
            key={idx}
            className={getOptionClass(idx)}
            onClick={() => !submitted && onSelect(letters[idx])}
          >
            <span className="option-letter">{letters[idx]}</span>
            <span>{option.replace(/^[A-D]\)\s*/, '')}</span>
          </div>
        ))}
      </div>

      {submitted && (
        <div className="explanation-box">
          <h4>
            {selectedAnswer === question.correct_answer ? '✅ Correct!' : '❌ Incorrect'}
            {' — '}Answer: {question.correct_answer}
          </h4>
          <p>{question.explanation}</p>
          {question.page_reference && (
            <div style={{ marginTop: '8px' }}>
              <span className="badge badge-teal">📄 {question.page_reference}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
