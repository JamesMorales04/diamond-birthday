import { useState } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { createConfetti } from '../utils/confetti';

export default function Surprise() {
  const [revealed, setRevealed] = useState(false);
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.3, triggerOnce: true });

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
        A Little Surprise
      </h2>

      {!revealed ? (
        <div className="surprise__hidden">
          <p className="surprise__prompt">Something special is waiting for you...</p>
          <button className="surprise__btn" onClick={handleReveal}>
            <span className="surprise__btn-glow" aria-hidden="true" />
            Tap to Reveal
          </button>
        </div>
      ) : (
        <div className="surprise__content">
          <div className="surprise__diamond" aria-hidden="true">◇</div>
          <h3 className="surprise__headline">You Are My Diamond</h3>
          <p className="surprise__message">
            Just as a diamond is formed under pressure, our love has been forged
            through every challenge, every laugh, every tear, and every beautiful
            moment we have shared. You are rare. You are precious. You are
            irreplaceable.
          </p>
          <p className="surprise__message">
            On this diamond birthday, I want you to know that you are the
            most brilliant gem in my universe — and I will spend the rest of
            my life cherishing every single facet of you.
          </p>
          <div className="surprise__sig">Forever yours</div>
          <div className="surprise__sparkles" aria-hidden="true">
            {[...Array(12)].map((_, i) => (
              <span key={i} className="surprise__sparkle" style={{ animationDelay: `${i * 0.3}s` }}>
                ✦
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
