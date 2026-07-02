import { useState } from 'react';
import { letters } from '../data/messages';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { content } from '../content/page';

function LetterCard({
  letter,
  index,
  isOpen,
  onToggle,
}: {
  letter: (typeof letters)[number];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.2, triggerOnce: true });

  return (
    <article
      ref={ref}
      className={`letter-card ${isVisible ? 'letter-card--visible' : ''} ${isOpen ? 'letter-card--open' : ''}`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <button
        className="letter-card__header"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={`letter-content-${letter.id}`}
      >
        <div className="letter-card__meta">
          <time className="letter-card__date">{letter.date}</time>
          <h3 className="letter-card__title">{letter.title}</h3>
        </div>
        <span className={`letter-card__chevron ${isOpen ? 'letter-card__chevron--open' : ''}`} aria-hidden="true">
          ↓
        </span>
      </button>

      <div
        id={`letter-content-${letter.id}`}
        className="letter-card__body"
        role="region"
        hidden={!isOpen}
      >
        <div className="letter-card__ornament" aria-hidden="true">~ ✿ ~</div>
        <p className="letter-card__excerpt">{letter.excerpt}</p>
        <div className="letter-card__content">
          {letter.content.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
        {letter.signature && (
          <p className="letter-card__signature">— {letter.signature}</p>
        )}
      </div>
    </article>
  );
}

export default function Letters() {
  const [openId, setOpenId] = useState<string | null>(letters[0]?.id ?? null);
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  const handleToggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      ref={ref}
      className={`section letters ${isVisible ? 'letters--visible' : ''}`}
      aria-labelledby="letters-title"
    >
      <h2 id="letters-title" className="section__title">
        {content.letters.title}
      </h2>
      <p className="section__subtitle">{content.letters.subtitle}</p>

      <div className="letters__list" role="list">
        {letters.map((letter, i) => (
          <LetterCard
            key={letter.id}
            letter={letter}
            index={i}
            isOpen={openId === letter.id}
            onToggle={() => handleToggle(letter.id)}
          />
        ))}
      </div>
    </section>
  );
}
