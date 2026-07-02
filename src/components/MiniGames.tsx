import { useState, lazy, Suspense } from "react";
import { useIntersectionObserver } from "../hooks/useIntersectionObserver";
import { content } from "../content/page";
import { tpl } from "../utils/tpl";

const GameFlappy = lazy(() => import("./GameFlappy"));
const GameLaneRunner = lazy(() => import("./GameLaneRunner"));
const GameMemoryMatch = lazy(() => import("./GameMemoryMatch"));

const GAMES = content.miniGames.games;

type GameId = (typeof GAMES)[number]["id"];

/** Presentation-only game card icons — kept local, not in content */
const GAME_ICONS: Record<GameId, string> = {
  flappy: "♥",
  "lane-runner": "◆",
  memory: "♡",
};

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

    const gameProps = { onBack: () => setActiveGame(null) };

    return (
      <Suspense fallback={<GameLoading />}>
        {activeGame === "flappy" && <GameFlappy {...gameProps} />}
        {activeGame === "lane-runner" && <GameLaneRunner {...gameProps} />}
        {activeGame === "memory" && <GameMemoryMatch {...gameProps} />}
      </Suspense>
    );
  };

  return (
    <section
      ref={ref}
      className={`section minigames ${isVisible ? "minigames--visible" : ""}`}
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
                {GAME_ICONS[game.id] ?? "✦"}
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
