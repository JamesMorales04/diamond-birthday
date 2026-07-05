import { timeline } from '../data/timeline';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { content } from '../content/page';

export const iconMap: Record<string, string> = {
  heart: '♥',
  star: '✦',
  diamond: '◆',
  flower: '✿',
  ring: '○',
};

function TimelineEntry({
  entry,
  index,
}: {
  entry: (typeof timeline)[number];
  index: number;
}) {
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.3,
    triggerOnce: true,
  });

  return (
    <div
      ref={ref}
      className={`timeline__entry ${isVisible ? 'timeline__entry--visible' : ''}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="timeline__dot" aria-hidden="true">
        <span className="timeline__icon">
          {iconMap[entry.icon ?? 'heart'] ?? iconMap.heart}
        </span>
      </div>
      <div className="timeline__card">
        <div className="timeline__meta">
          <time className="timeline__year">{entry.year}</time>
          {entry.month && (
            <span className="timeline__month">{entry.month}</span>
          )}
        </div>
        <h3 className="timeline__title">{entry.title}</h3>
        <p className="timeline__desc">{entry.description}</p>
      </div>
    </div>
  );
}

export default function Timeline() {
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.01,
    triggerOnce: true,
  });

  return (
    <section
      ref={ref}
      className={`section timeline ${isVisible ? 'timeline--visible' : ''}`}
      aria-labelledby="timeline-title"
    >
      <h2 id="timeline-title" className="section__title">
        {content.timeline.title}
      </h2>
      <p className="section__subtitle">{content.timeline.subtitle}</p>

      <div className="timeline__line" aria-hidden="true" />

      <div className="timeline__entries">
        {timeline.map((entry, i) => (
          <TimelineEntry
            key={`timeline-${entry.year}-${entry.month ?? ''}-${entry.title}`}
            entry={entry}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
