import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { gameSettings, defaultHighScores, GAME_STORAGE_KEY } from '../data/games';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { shuffle } from '../utils/shuffle';
import { createConfetti } from '../utils/confetti';
import { content } from '../content/page';
import { tpl } from '../utils/tpl';

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

const EMOJIS = ['♥', '✦', '◆', '♡', '✿', '◇', '♤', '○'];

function createCards(): Card[] {
  const pairs = EMOJIS.slice(0, (gameSettings.memoryMatch.gridSize * gameSettings.memoryMatch.gridSize) / 2);
  const cards: Card[] = [];
  pairs.forEach((emoji, index) => {
    cards.push({ id: index * 2, emoji, flipped: false, matched: false });
    cards.push({ id: index * 2 + 1, emoji, flipped: false, matched: false });
  });
  return shuffle(cards);
}

export default function GameMemoryMatch({ onBack }: { onBack: () => void }) {
  const [highScore, setHighScore] = useLocalStorage(GAME_STORAGE_KEY, defaultHighScores);
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
      setCards((prev) => prev.map((c) => (c.id === id ? { ...c, flipped: true } : c)));

      if (newFlipped.length === 2) {
        setIsChecking(true);
        setMoves((prev) => prev + 1);

        const [firstId, secondId] = newFlipped;
        const first = cards.find((c) => c.id === firstId)!;
        const second = cards.find((c) => c.id === secondId)!;

        if (first.emoji === second.emoji) {
          // Match!
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId ? { ...c, matched: true } : c,
              ),
            );
            setFlippedIds([]);
            setIsChecking(false);
            setMatchedPairs((prev) => {
              const newCount = prev + 1;
              if (newCount >= totalPairs) {
                setGameWon(true);
                const timeBonus = Math.max(0, 60 - moves);
                setHighScore((s) => ({
                  ...s,
                  memoryMatch: Math.max(s.memoryMatch, timeBonus),
                }));
                createConfetti({ count: 50, duration: 3000 });
              }
              return newCount;
            });
          }, gameSettings.memoryMatch.flipDelay);
        } else {
          // No match
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId ? { ...c, flipped: false } : c,
              ),
            );
            setFlippedIds([]);
            setIsChecking(false);
          }, gameSettings.memoryMatch.flipDelay);
        }
      }
    },
    [cards, flippedIds, isChecking, gameWon, gameStarted, totalPairs, moves, setHighScore],
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
        if (e.key === 'Enter' || e.key === ' ') {
          resetGame();
        }
      };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }
  }, [gameWon, resetGame]);

  const gridCols = gameSettings.memoryMatch.gridSize;

  return (
    <div className="game-container">
      <div className="game-container__header">
        <button className="game-container__back" onClick={onBack} aria-label={content.gameMemoryMatch.backLabel}>
          ← {content.games.backText}
        </button>
        <h3 className="game-container__title">{content.gameMemoryMatch.title}</h3>
      </div>

      {gameWon ? (
          <div className="memory__win">
          <div className="memory__win-icon" aria-hidden="true">✦</div>
          <h4 className="memory__win-title">{content.gameMemoryMatch.winTitle}</h4>
          <p className="memory__win-text">
            {tpl(content.gameMemoryMatch.winText, { moves })}
          </p>
          <button className="memory__win-btn" onClick={resetGame}>
            {content.gameMemoryMatch.playAgain}
          </button>
        </div>
      ) : (
        <>
          <div className="memory__stats">
            <span>{tpl(content.gameMemoryMatch.movesLabel, { count: moves })}</span>
            <span>
              {tpl(content.gameMemoryMatch.matchedLabel, { matched: matchedPairs, total: totalPairs })}
            </span>
            <span className="memory__best">
              {highScore.memoryMatch > 0
                ? tpl(content.gameMemoryMatch.bestLabel, { score: `${highScore.memoryMatch}s` })
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
                className={`memory__card ${card.flipped ? 'memory__card--flipped' : ''} ${card.matched ? 'memory__card--matched' : ''}`}
                onClick={() => handleCardClick(card.id)}
                disabled={card.matched || isChecking}
                aria-label={
                  card.flipped || card.matched
                    ? tpl(content.gameMemoryMatch.cardLabelTemplate, { emoji: card.emoji })
                    : content.gameMemoryMatch.hiddenCardLabel
                }
                style={{
                  transitionDuration: reducedMotion ? '0ms' : '400ms',
                }}
              >
                <div className="memory__card-inner">
                  <div className="memory__card-front" aria-hidden="true">
                    <span>?</span>
                  </div>
                  <div className="memory__card-back" aria-hidden="true">
                    <span>{card.emoji}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {!gameStarted && (
            <p className="game-container__hint">{content.gameMemoryMatch.hint}</p>
          )}
        </>
      )}
    </div>
  );
}
