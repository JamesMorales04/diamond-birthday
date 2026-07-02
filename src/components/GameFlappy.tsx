import { useRef, useEffect, useState, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { gameSettings, defaultHighScores, GAME_STORAGE_KEY } from '../data/games';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { content } from '../content/page';
import { tpl } from '../utils/tpl';

interface FlappyGame {
  bird: { x: number; y: number; vy: number; size: number };
  pipes: { x: number; top: number; bottom: number; scored: boolean }[];
  score: number;
  gameOver: boolean;
  started: boolean;
  frame: number;
}

const settings = gameSettings.flappy;
const CANVAS_W = 400;
const CANVAS_H = 500;

export default function GameFlappy({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [highScore, setHighScore] = useLocalStorage(GAME_STORAGE_KEY, defaultHighScores);
  const highScoreRef = useRef(highScore.flappy);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle');
  const gameRef = useRef<FlappyGame | null>(null);
  const animRef = useRef<number>(0);
  const reducedMotion = useReducedMotion();

  // Keep ref in sync without restarting game effects
  useEffect(() => {
    highScoreRef.current = highScore.flappy;
  }, [highScore.flappy]);

  const initGame = useCallback((): FlappyGame => ({
    bird: { x: 80, y: CANVAS_H / 2, vy: 0, size: 15 },
    pipes: [],
    score: 0,
    gameOver: false,
    started: false,
    frame: 0,
  }), []);

  const jump = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    if (g.gameOver) {
      gameRef.current = initGame();
      setGameState('playing');
      setScore(0);
      return;
    }
    if (!g.started) {
      g.started = true;
    }
    g.bird.vy = settings.jumpForce * (reducedMotion ? 0.5 : 1);
  }, [initGame, reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    const g = initGame();
    gameRef.current = g;

    const update = () => {
      const game = gameRef.current;
      if (!game) return;
      if (game.gameOver) {
        draw(ctx, game);
        return;
      }

      game.frame++;

      // Bird physics
      game.bird.vy += settings.gravity * (reducedMotion ? 0.3 : 1);
      game.bird.y += game.bird.vy;

      // Spawn pipes (only skip push, never return — physics/rendering must continue)
      if (game.started && game.frame % settings.pipeFrequency === 0) {
        const gapY = 100 + Math.random() * (CANVAS_H - settings.pipeGap - 200);
        const shouldSpawnPipe = !reducedMotion || game.frame % (settings.pipeFrequency * 2) === 0;
        if (shouldSpawnPipe) {
          game.pipes.push({
            x: CANVAS_W,
            top: gapY,
            bottom: gapY + settings.pipeGap,
            scored: false,
          });
        }
      }

      // Move pipes
      for (const pipe of game.pipes) {
        pipe.x -= settings.pipeSpeed * (reducedMotion ? 0.5 : 1);
      }

      // Remove off-screen pipes
      game.pipes = game.pipes.filter((p) => p.x > -60);

      // Collision detection
      const bird = game.bird;
      const birdLeft = bird.x - bird.size;
      const birdRight = bird.x + bird.size;
      const birdTop = bird.y - bird.size;
      const birdBottom = bird.y + bird.size;

      // Walls
      if (birdTop <= 0 || birdBottom >= CANVAS_H) {
        game.gameOver = true;
        setGameState('over');
      }

      // Pipes
      for (const pipe of game.pipes) {
        if (
          birdRight > pipe.x &&
          birdLeft < pipe.x + 50 &&
          (birdTop < pipe.top || birdBottom > pipe.bottom)
        ) {
          game.gameOver = true;
          setGameState('over');
        }

        // Score
        if (!pipe.scored && pipe.x + 50 < birdLeft) {
          pipe.scored = true;
          game.score++;
          setScore(game.score);
        }
      }

      if (game.gameOver) {
        setHighScore((prev) => ({
          ...prev,
          flappy: Math.max(prev.flappy, game.score),
        }));
      }

      draw(ctx, game);
      animRef.current = requestAnimationFrame(update);
    };

    const draw = (ctx: CanvasRenderingContext2D, game: FlappyGame) => {
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = '#1a0e12';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      if (!game.started && !game.gameOver) {
        ctx.fillStyle = '#C9B99A';
        ctx.font = '18px "Cormorant Garamond", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText(content.gameFlappy.hint.idle, CANVAS_W / 2, CANVAS_H / 2 - 30);
        ctx.fillText('♥', CANVAS_W / 2, CANVAS_H / 2 + 20);
        return;
      }

      // Draw pipes
      ctx.fillStyle = '#722F37';
      ctx.strokeStyle = '#C9B99A';
      ctx.lineWidth = 2;
      for (const pipe of game.pipes) {
        ctx.fillRect(pipe.x, 0, 50, pipe.top);
        ctx.strokeRect(pipe.x, 0, 50, pipe.top);
        ctx.fillRect(pipe.x, pipe.bottom, 50, CANVAS_H - pipe.bottom);
        ctx.strokeRect(pipe.x, pipe.bottom, 50, CANVAS_H - pipe.bottom);

        // Pipe cap
        ctx.fillStyle = '#9B1B30';
        ctx.fillRect(pipe.x - 5, pipe.top - 20, 60, 20);
        ctx.fillRect(pipe.x - 5, pipe.bottom, 60, 20);
        ctx.fillStyle = '#722F37';

        // Heart decoration on pipe
        ctx.fillStyle = '#D4A5A5';
        ctx.font = '16px serif';
        ctx.textAlign = 'center';
        ctx.fillText('♥', pipe.x + 25, pipe.top - 5);
        ctx.fillText('♥', pipe.x + 25, pipe.bottom + 20);
        ctx.fillStyle = '#722F37';
      }

      // Draw bird (heart shape)
      const bx = game.bird.x;
      const by = game.bird.y;
      ctx.fillStyle = '#D4A5A5';
      ctx.shadowColor = '#D4A5A5';
      ctx.shadowBlur = 15;

      // Simple heart shape
      ctx.beginPath();
      ctx.moveTo(bx, by + 10);
      ctx.bezierCurveTo(bx + 15, by - 5, bx + 25, by + 5, bx, by + 20);
      ctx.bezierCurveTo(bx - 25, by + 5, bx - 15, by - 5, bx, by + 10);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Score
      ctx.fillStyle = '#FFFDD0';
      ctx.font = '24px "Cormorant Garamond", Georgia, serif';
      ctx.textAlign = 'left';
      ctx.fillText(`♥ ${game.score}`, 10, 35);

      // High score
      ctx.fillStyle = '#C9B99A';
      ctx.font = '14px "Inter", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(tpl(content.gameFlappy.canvasBestTemplate, { best: highScoreRef.current }), CANVAS_W - 10, 25);

      // Game over overlay
      if (game.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.fillStyle = '#FFFDD0';
        ctx.font = '32px "Cormorant Garamond", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText(content.gameFlappy.canvasGameOver, CANVAS_W / 2, CANVAS_H / 2 - 30);
        ctx.fillStyle = '#D4A5A5';
        ctx.font = '20px "Cormorant Garamond", Georgia, serif';
        ctx.fillText(tpl(content.gameFlappy.canvasScoreTemplate, { score: game.score }), CANVAS_W / 2, CANVAS_H / 2 + 20);
        ctx.fillStyle = '#C9B99A';
        ctx.font = '14px "Inter", sans-serif';
        ctx.fillText(content.gameFlappy.canvasTapRestart, CANVAS_W / 2, CANVAS_H / 2 + 60);
      }
    };

    animRef.current = requestAnimationFrame(update);

    return () => cancelAnimationFrame(animRef.current);
  }, [initGame, reducedMotion]);

  return (
    <div className="game-container">
      <div className="game-container__header">
        <button className="game-container__back" onClick={onBack} aria-label={content.gameFlappy.backLabel}>
          ← {content.games.backText}
        </button>
        <h3 className="game-container__title">{content.gameFlappy.title}</h3>
      </div>

      <div
        className="game-container__canvas-wrap"
        onClick={jump}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); jump(); } }}
        role="button"
        tabIndex={0}
        aria-label={content.gameFlappy.ariaLabel}
      >
        <canvas ref={canvasRef} className="game-container__canvas" />
      </div>

      <p className="game-container__hint">
        {gameState === 'idle' && content.gameFlappy.hint.idle}
        {gameState === 'playing' && content.gameFlappy.hint.playing}
        {gameState === 'over' && tpl(content.gameFlappy.hint.over, { score })}
      </p>
    </div>
  );
}
