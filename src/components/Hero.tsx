import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { wife } from '../data/wife';

export default function Hero() {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.3, triggerOnce: true });
  const reducedMotion = useReducedMotion();

  return (
    <section
      ref={ref}
      className={`hero ${isVisible ? 'hero--visible' : ''}`}
      aria-label="Hero greeting"
    >
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__glow hero__glow--1" />
        <div className="hero__glow hero__glow--2" />
      </div>

      <div className="hero__content">
        <p className="hero__subtitle">
          <span className="hero__diamond" aria-hidden="true">✦</span>
          {' '}Happy Diamond Birthday{' '}
          <span className="hero__diamond" aria-hidden="true">✦</span>
        </p>

        <h1 className="hero__name">
          {wife.name}
        </h1>

        <div
          className={`hero__heart ${reducedMotion ? '' : 'hero__heart--beat'}`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 100 100" width="60" height="60">
            <path
              d="M50 85 C20 60 5 40 5 25 C5 10 20 5 30 15 L50 35 L70 15 C80 5 95 10 95 25 C95 40 80 60 50 85Z"
              fill="#9B1B30"
              opacity="0.8"
            />
          </svg>
        </div>

        <p className="hero__age">{wife.age} years, brilliantly beautiful</p>

        <p className="hero__message">{wife.specialMessage}</p>

        <div className="hero__scroll" aria-hidden="true">
          <span className="hero__scroll-text">Scroll to explore</span>
          <span className="hero__scroll-arrow">↓</span>
        </div>
      </div>
    </section>
  );
}
