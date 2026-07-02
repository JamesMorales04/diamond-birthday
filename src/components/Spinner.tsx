import { useState, useCallback } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { content } from '../content/page';
import { tpl } from '../utils/tpl';

/** Presentation-only spinner segment colours — kept local, not in content */
const SPINNER_COLORS: readonly string[] = [
  '#9B1B30', '#722F37', '#D4A5A5', '#C9B99A', '#722F37',
  '#9B1B30', '#D4A5A5', '#C9B99A', '#9B1B30', '#722F37',
];

const SPINNER_OPTIONS: Array<{ label: string; color: string }> = content.spinner.options.map((opt: { label: string }, i: number) => ({
  label: opt.label,
  color: SPINNER_COLORS[i] ?? '#722F37',
}));
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
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / SPIN_DURATION, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + (finalRotation - startRotation) * eased;
      setRotation(currentRotation);

      if (progress < 1) {
        window.setTimeout(animate, 16);
      } else {
        setRotation(finalRotation);
        setSpinning(false);

        // Determine result
        const normalized = ((finalRotation % 360) + 360) % 360;
        const idx = Math.floor(normalized / SEGMENT_ANGLE);
        setResult(SPINNER_OPTIONS[idx % SPINNER_OPTIONS.length].label);
      }
    };

    window.setTimeout(animate, 16);
  }, [spinning, rotation, reducedMotion]);

  return (
    <section
      ref={ref}
      className={`section spinner-section ${isVisible ? 'spinner-section--visible' : ''}`}
      aria-labelledby="spinner-title"
    >
      <h2 id="spinner-title" className="section__title">
        {content.spinner.title}
      </h2>
      <p className="section__subtitle">{content.spinner.subtitle}</p>

      <div className="spinner-section__wheel-wrap">
        <div className="spinner-section__pointer" aria-hidden="true">▼</div>

        <div
          className="spinner-section__wheel"
          style={{ transform: `rotate(${rotation}deg)` }}
          role="img"
          aria-label={spinning ? content.spinner.ariaSpinning : result ? tpl(content.spinner.ariaResultTemplate, { result }) : content.spinner.ariaDefault}
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
        {spinning ? content.spinner.spinning : content.spinner.spinButton}
      </button>

      {result && (
        <div className="spinner-section__result" role="alert">
          <span className="spinner-section__result-icon" aria-hidden="true">✦</span>
          <p>{tpl(content.spinner.resultTemplate, { result })}</p>
        </div>
      )}
    </section>
  );
}
