import { useState, useCallback } from 'react';
import { getShuffledTrivia, type TriviaQuestion } from '../data/trivia';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { createConfetti } from '../utils/confetti';
import { content } from '../content/page';
import { tpl } from '../utils/tpl';

interface TriviaState {
  questions: TriviaQuestion[];
  current: number;
  score: number;
  answered: boolean;
  selectedIndex: number | null;
  finished: boolean;
}

function initState(): TriviaState {
  return {
    questions: getShuffledTrivia(6),
    current: 0,
    score: 0,
    answered: false,
    selectedIndex: null,
    finished: false,
  };
}

export default function Trivia() {
  const [state, setState] = useState<TriviaState>(initState);
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.15, triggerOnce: true });

  const { questions, current, score, answered, selectedIndex, finished } = state;
  const question = questions[current];

  const handleAnswer = useCallback(
    (index: number) => {
      if (answered) return;
      const isCorrect = index === question.correctIndex;
      setState((prev) => ({
        ...prev,
        answered: true,
        selectedIndex: index,
        score: isCorrect ? prev.score + 1 : prev.score,
      }));
      if (isCorrect) {
        createConfetti({ count: 20, duration: 1500 });
      }
    },
    [answered, question],
  );

  const handleNext = useCallback(() => {
    if (current < questions.length - 1) {
      setState((prev) => ({
        ...prev,
        current: prev.current + 1,
        answered: false,
        selectedIndex: null,
      }));
    } else {
      setState((prev) => ({ ...prev, finished: true }));
      if (state.score >= questions.length * 0.6) {
        createConfetti({ count: 40, duration: 2500 });
      }
    }
  }, [current, questions.length, state.score]);

  const handleRestart = useCallback(() => {
    setState(initState());
  }, []);

  return (
    <section
      ref={ref}
      className={`section trivia ${isVisible ? 'trivia--visible' : ''}`}
      aria-labelledby="trivia-title"
    >
      <h2 id="trivia-title" className="section__title">
        {content.trivia.title}
      </h2>
      <p className="section__subtitle">{content.trivia.subtitle}</p>

      {finished ? (
        <div className="trivia__result">
          <div className="trivia__score-ring">
            <span className="trivia__score-num">
              {tpl(content.trivia.scoreTemplate, { score: String(score), total: String(questions.length) })}
            </span>
          </div>
          <p className="trivia__result-text">
            {score === questions.length
              ? content.trivia.perfect
              : score >= questions.length * 0.6
                ? content.trivia.good
                : content.trivia.tryAgain}
          </p>
          <button className="trivia__restart-btn" onClick={handleRestart}>
            {content.trivia.playAgain}
          </button>
        </div>
      ) : question ? (
        <div className="trivia__quiz">
          <div className="trivia__progress" role="progressbar" aria-valuenow={current + 1} aria-valuemax={questions.length}>
            <div
              className="trivia__progress-bar"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
            <span className="trivia__progress-label">
              {tpl(content.trivia.ofTemplate, { current: String(current + 1), total: String(questions.length) })}
            </span>
          </div>

          <p className="trivia__question">{question.question}</p>

          <div className="trivia__options" role="radiogroup" aria-label={content.trivia.progressLabel}>
            {question.options.map((option, i) => {
              let className = 'trivia__option';
              if (answered) {
                if (i === question.correctIndex) className += ' trivia__option--correct';
                else if (i === selectedIndex) className += ' trivia__option--wrong';
                else className += ' trivia__option--disabled';
              }
              return (
                <button
                  key={i}
                  className={className}
                  onClick={() => handleAnswer(i)}
                  disabled={answered}
                  role="radio"
                  aria-checked={selectedIndex === i}
                >
                  <span className="trivia__option-letter">{'ABCD'[i]}</span>
                  <span className="trivia__option-text">{option}</span>
                </button>
              );
            })}
          </div>

          {answered && question.explanation && (
            <p className="trivia__explanation" role="alert">
              {question.explanation}
            </p>
          )}

          {answered && (
            <button className="trivia__next-btn" onClick={handleNext}>
              {current < questions.length - 1 ? content.trivia.nextQuestion : content.trivia.seeResults}
            </button>
          )}
        </div>
      ) : (
        <div className="trivia__empty" role="status">
          <p>{content.trivia.noQuestions}</p>
        </div>
      )}
    </section>
  );
}
