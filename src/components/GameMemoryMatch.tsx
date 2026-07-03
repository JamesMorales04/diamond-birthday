import { useState, useCallback, useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  gameSettings,
  defaultHighScores,
  GAME_STORAGE_KEY,
} from "../data/games";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { createConfetti } from "../utils/confetti";
import { content } from "../content/page";
import { tpl } from "../utils/tpl";
import { createMemoryMatchCards } from "../features/games/memory/memoryAssets";
import type { MemoryCard as Card } from "../features/games/memory/memoryAssets";

function createCards(): Card[] {
  return createMemoryMatchCards();
}

export default function GameMemoryMatch({ onBack }: { onBack: () => void }) {
  const [highScore, setHighScore] = useLocalStorage(
    GAME_STORAGE_KEY,
    defaultHighScores,
  );
  const [cards, setCards] = useState<Card[]>(createCards);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const reducedMotion = useReducedMotion();

  const totalPairs = cards.length / 2;

  const handleCardClick = useCallback(
    (id: number) => {
      if (isChecking || gameWon) return;
      if (flippedIds.includes(id)) return;

      const card = cards.find((c) => c.id === id);
      if (!card || card.matched || card.flipped) return;

      if (!gameStarted) setGameStarted(true);

      const newFlipped = [...flippedIds, id];
      setFlippedIds(newFlipped);

      // Flip card
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, flipped: true } : c)),
      );

        if (newFlipped.length === 2) {
          setIsChecking(true);
          setMoves((prev) => prev + 1);
          const currentMoves = moves + 1;

          const [firstId, secondId] = newFlipped;
          const first = cards.find((c) => c.id === firstId)!;
          const second = cards.find((c) => c.id === secondId)!;

          if (first.pairId === second.pairId) {
            // Match!
            setTimeout(() => {
              setCards((prev) =>
                prev.map((c) =>
                  c.id === firstId || c.id === secondId
                    ? { ...c, matched: true }
                    : c,
                ),
              );
              setFlippedIds([]);
              setIsChecking(false);
              setMatchedPairs((prev) => {
                const newCount = prev + 1;
                if (newCount >= totalPairs) {
                  setGameWon(true);
                  const timeBonus = Math.max(0, 60 - currentMoves);
                  setHighScore((s) => ({
                    ...s,
                    memory: Math.max(s.memory, timeBonus),
                  }));
                  if (!reducedMotion) {
                    createConfetti({ count: 50, duration: 3000 });
                  }
                }
                return newCount;
              });
            }, gameSettings["memory"].flipDelay);
        } else {
          // No match
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId
                  ? { ...c, flipped: false }
                  : c,
              ),
            );
            setFlippedIds([]);
            setIsChecking(false);
          }, gameSettings["memory"].flipDelay);
        }
      }
    },
    [
      cards,
      flippedIds,
      isChecking,
      gameWon,
      gameStarted,
      totalPairs,
      moves,
      setHighScore,
    ],
  );

  const resetGame = useCallback(() => {
    setCards(createCards());
    setFlippedIds([]);
    setMatchedPairs(0);
    setMoves(0);
    setIsChecking(false);
    setGameStarted(false);
    setGameWon(false);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (gameWon) {
      const handler = (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          resetGame();
        }
      };
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    }
  }, [gameWon, resetGame]);

  const gridCols = gameSettings["memory"].columns;

  return (
    <div className="game-container">
      <div className="game-container__header">
        <button
          className="game-container__back"
          onClick={onBack}
          aria-label={content.gameMemoryMatch.backLabel}
        >
          ← {content.games.backText}
        </button>
        <h3 className="game-container__title">
          {content.gameMemoryMatch.title}
        </h3>
      </div>

      {gameWon ? (
        <div className="memory__win">
          <div className="memory__win-icon" aria-hidden="true">
            ✦
          </div>
          <h4 className="memory__win-title">
            {content.gameMemoryMatch.winTitle}
          </h4>
          <p className="memory__win-text">
            {tpl(content.gameMemoryMatch.winText, { moves })}
          </p>
          <button
            className="memory__win-btn"
            onClick={resetGame}
            aria-label={content.gameMemoryMatch.restartLabel}
          >
            {content.gameMemoryMatch.playAgain}
          </button>
        </div>
      ) : (
        <>
          <div className="memory__stats">
            <span>
              {tpl(content.gameMemoryMatch.movesLabel, { count: moves })}
            </span>
            <span>
              {tpl(content.gameMemoryMatch.matchedLabel, {
                matched: matchedPairs,
                total: totalPairs,
              })}
            </span>
            <span className="memory__best">
              {highScore.memory > 0
                ? tpl(content.gameMemoryMatch.bestLabel, {
                    score: `${highScore.memory}s`,
                  })
                : content.gameMemoryMatch.bestDash}
            </span>
          </div>

          <div
            className="memory__grid"
            style={{
              gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
              maxWidth: `${gridCols * 80}px`,
            }}
            role="grid"
            aria-label={content.gameMemoryMatch.gridLabel}
          >
            {cards.map((card) => (
              <button
                key={card.id}
                className={`memory__card ${card.flipped ? "memory__card--flipped" : ""} ${card.matched ? "memory__card--matched" : ""}`}
                onClick={() => handleCardClick(card.id)}
                disabled={card.matched || isChecking}
                aria-label={
                  card.matched
                    ? content.gameMemoryMatch.matchedCardLabel
                    : card.flipped
                      ? content.gameMemoryMatch.revealedCardLabel
                      : content.gameMemoryMatch.hiddenCardLabel
                }
                style={{
                  transitionDuration: reducedMotion ? "0ms" : "400ms",
                }}
              >
                <div className="memory__card-inner">
                  <div className="memory__card-front" aria-hidden="true" />
                  <div className="memory__card-back" aria-hidden="true">
                    <img
                      src={card.image}
                      alt=""
                      draggable={false}
                      loading="lazy"
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {!gameStarted && (
            <p className="game-container__hint">
              {content.gameMemoryMatch.hint}
            </p>
          )}
        </>
      )}
    </div>
  );
}
