import { useState } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { createConfetti } from '../utils/confetti';
import { content } from '../content/page';

export default function Surprise() {
  const [revealed, setRevealed] = useState(false);
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.3,
    triggerOnce: true,
  });

  const handleReveal = () => {
    if (!revealed) {
      setRevealed(true);
      createConfetti({ count: 80, duration: 4000 });
    }
  };

  return (
    <section
      ref={ref}
      className={`section surprise ${isVisible ? 'surprise--visible' : ''} ${revealed ? 'surprise--revealed' : ''}`}
      aria-labelledby="surprise-title"
    >
      <div className="surprise__glow" aria-hidden="true" />

      <h2 id="surprise-title" className="section__title">
        {content.surprise.title}
      </h2>

      {!revealed ? (
        <div className="surprise__hidden">
          <p className="surprise__prompt">{content.surprise.prompt}</p>
          <button className="surprise__btn" onClick={handleReveal}>
            <span className="surprise__btn-glow" aria-hidden="true" />
            {content.surprise.revealButton}
          </button>
        </div>
      ) : (
        <div className="surprise__content">
          <div className="surprise__diamond" aria-hidden="true">
            ◇
          </div>
          <h3 className="surprise__headline">{content.surprise.headline}</h3>
          <p className="surprise__message">{content.surprise.message1}</p>
          <p className="surprise__message">{content.surprise.message2}</p>
          <div className="surprise__sig">{content.surprise.signature}</div>
          <div className="surprise__sparkles" aria-hidden="true">
            {[...Array(12)].map((_, i) => (
              <span
                key={i}
                className="surprise__sparkle"
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                ✦
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
