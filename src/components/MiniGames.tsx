import { useState, lazy, Suspense } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

const GameFlappy = lazy(() => import('./GameFlappy'));
const GameSnake = lazy(() => import('./GameSnake'));
const GameLaneRunner = lazy(() => import('./GameLaneRunner'));
const GameMemoryMatch = lazy(() => import('./GameMemoryMatch'));

const GAMES = [
  { id: 'flappy', name: 'Flappy Love', desc: 'Tap to fly through hearts', Icon: '♥' },
  { id: 'snake', name: 'Love Snake', desc: 'Collect the hearts, grow longer', Icon: '✦' },
  { id: 'lane-runner', name: 'Lane of Love', desc: 'Dodge obstacles, stay together', Icon: '◆' },
  { id: 'memory', name: 'Memory Match', desc: 'Find the matching pairs', Icon: '♡' },
] as const;

type GameId = (typeof GAMES)[number]['id'];

function GameLoading() {
  return (
    <div className="minigames__loading" role="status" aria-label="Loading game">
      <div className="minigames__spinner" aria-hidden="true">✦</div>
      <p>Loading game...</p>
    </div>
  );
}

export default function MiniGames() {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.05, triggerOnce: true });

  const renderGame = () => {
    if (!activeGame) return null;

    const gameProps = { onBack: () => setActiveGame(null) };

    return (
      <Suspense fallback={<GameLoading />}>
        {activeGame === 'flappy' && <GameFlappy {...gameProps} />}
        {activeGame === 'snake' && <GameSnake {...gameProps} />}
        {activeGame === 'lane-runner' && <GameLaneRunner {...gameProps} />}
        {activeGame === 'memory' && <GameMemoryMatch {...gameProps} />}
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
        Mini Games
      </h2>
      <p className="section__subtitle">A little fun, just for you</p>

      {!activeGame ? (
        <div className="minigames__grid">
          {GAMES.map((game) => (
            <button
              key={game.id}
              className="minigames__card"
              onClick={() => setActiveGame(game.id)}
              aria-label={`Play ${game.name}`}
            >
              <span className="minigames__card-icon" aria-hidden="true">
                {game.Icon}
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
