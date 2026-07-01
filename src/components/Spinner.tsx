import { useState, useCallback } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { useReducedMotion } from '../hooks/useReducedMotion';

const SPINNER_OPTIONS = [
  { label: 'Kiss Me ♥', color: '#9B1B30' },
  { label: 'Dance Tonight', color: '#722F37' },
  { label: 'Love Letter', color: '#D4A5A5' },
  { label: 'Candlelit Dinner', color: '#C9B99A' },
  { label: 'Stargazing ✦', color: '#722F37' },
  { label: 'Surprise Date', color: '#9B1B30' },
  { label: 'Foot Massage', color: '#D4A5A5' },
  { label: 'Movie Night', color: '#C9B99A' },
  { label: 'Breakfast in Bed', color: '#9B1B30' },
  { label: 'Waltz Together', color: '#722F37' },
];

const SEGMENT_ANGLE = 360 / SPINNER_OPTIONS.length;
const SPIN_DURATION = 4000;

export default function Spinner() {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.15, triggerOnce: true });
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const reducedMotion = useReducedMotion();

  const spin = useCallback(() => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    const targetIndex = Math.floor(Math.random() * SPINNER_OPTIONS.length);
    const segmentOffset = targetIndex * SEGMENT_ANGLE + Math.random() * SEGMENT_ANGLE * 0.7;

    // Reduced motion: skip JS animation entirely, jump to result
    if (reducedMotion) {
      setRotation(segmentOffset);
      setSpinning(false);
      setResult(SPINNER_OPTIONS[targetIndex].label);
      return;
    }

    const extraSpins = 3 + Math.floor(Math.random() * 5);
    const targetAngle = extraSpins * 360 + segmentOffset;
    // Compute final rotation ensuring we always move forward
    const finalRotation = rotation + targetAngle - (rotation % 360);
    const startRotation = rotation;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / SPIN_DURATION, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + (finalRotation - startRotation) * eased;
      setRotation(currentRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setRotation(finalRotation);
        setSpinning(false);

        // Determine result
        const normalized = ((finalRotation % 360) + 360) % 360;
        const idx = Math.floor(normalized / SEGMENT_ANGLE);
        setResult(SPINNER_OPTIONS[idx % SPINNER_OPTIONS.length].label);
      }
    };

    requestAnimationFrame(animate);
  }, [spinning, rotation, reducedMotion]);

  return (
    <section
      ref={ref}
      className={`section spinner-section ${isVisible ? 'spinner-section--visible' : ''}`}
      aria-labelledby="spinner-title"
    >
      <h2 id="spinner-title" className="section__title">
        Wheel of Romance
      </h2>
      <p className="section__subtitle">Spin to discover our next romantic adventure</p>

      <div className="spinner-section__wheel-wrap">
        <div className="spinner-section__pointer" aria-hidden="true">▼</div>

        <div
          className="spinner-section__wheel"
          style={{ transform: `rotate(${rotation}deg)` }}
          role="img"
          aria-label={spinning ? 'Spinner is spinning...' : result ? `Result: ${result}` : 'Romance spinner wheel'}
        >
          {SPINNER_OPTIONS.map((option, i) => (
            <div
              key={i}
              className="spinner-section__segment"
              style={{
                transform: `rotate(${i * SEGMENT_ANGLE}deg)`,
                backgroundColor: option.color,
              }}
            >
              <span
                className="spinner-section__label"
                style={{ transform: `rotate(${SEGMENT_ANGLE / 2}deg)` }}
              >
                {option.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        className="spinner-section__btn"
        onClick={spin}
        disabled={spinning}
        aria-busy={spinning}
      >
        {spinning ? 'Spinning...' : 'Spin for Love'}
      </button>

      {result && (
        <div className="spinner-section__result" role="alert">
          <span className="spinner-section__result-icon" aria-hidden="true">✦</span>
          <p>Tonight: <strong>{result}</strong></p>
        </div>
      )}
    </section>
  );
}
