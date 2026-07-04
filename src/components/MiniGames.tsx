import { useState, lazy, Suspense, ComponentType } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { content } from '../content/page';
import { tpl } from '../utils/tpl';
import { GAME_ICONS } from '../data/gameRegistry';
import type { GameId } from '../data/gameRegistry';

const GameFlappy = lazy(() => import('./GameFlappy'));
const GameLaneRunner = lazy(() => import('./GameLaneRunner'));
const GameMemoryMatch = lazy(() => import('./GameMemoryMatch'));

type GameProps = { onBack: () => void };

const GAME_COMPONENTS: Record<GameId, ComponentType<GameProps>> = {
  flappy: GameFlappy,
  'lane-runner': GameLaneRunner,
  memory: GameMemoryMatch,
};

const GAMES = content.miniGames.games;

function GameLoading() {
  return (
    <div
      className="minigames__loading"
      role="status"
      aria-label={content.miniGames.loadingLabel}
    >
      <div className="minigames__spinner" aria-hidden="true">
        ✦
      </div>
      <p>{content.miniGames.loading}</p>
    </div>
  );
}

export default function MiniGames() {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.05,
    triggerOnce: true,
  });

  const renderGame = () => {
    if (!activeGame) return null;

    const GameComponent = GAME_COMPONENTS[activeGame];
    const gameProps: GameProps = { onBack: () => setActiveGame(null) };

    return (
      <Suspense fallback={<GameLoading />}>
        <GameComponent {...gameProps} />
      </Suspense>
    );
  };

  return (
    <section
      ref={ref}
      className={`section minigames ${isVisible ? 'minigames--visible' : ''}`}
      aria-labelledby="minigames-title"
    >
      <h2 id="minigames-title" className="section__title">
        {content.miniGames.title}
      </h2>
      <p className="section__subtitle">{content.miniGames.subtitle}</p>

      {!activeGame ? (
        <div className="minigames__grid">
          {GAMES.map((game) => (
            <button
              key={game.id}
              className="minigames__card"
              onClick={() => setActiveGame(game.id)}
              aria-label={tpl(content.miniGames.playTemplate, {
                name: game.name,
              })}
            >
              <span className="minigames__card-icon" aria-hidden="true">
                {GAME_ICONS[game.id] ?? '✦'}
              </span>
              <h3 className="minigames__card-name">{game.name}</h3>
              <p className="minigames__card-desc">{game.desc}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="minigames__active">{renderGame()}</div>
      )}
    </section>
  );
}
