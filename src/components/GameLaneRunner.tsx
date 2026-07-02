import { useRef, useEffect, useState, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { gameSettings, defaultHighScores, GAME_STORAGE_KEY } from '../data/games';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { content } from '../content/page';
import { tpl } from '../utils/tpl';

const LANES = 3;
const CANVAS_W = 300;
const CANVAS_H = 500;
const LANE_W = CANVAS_W / LANES;
const PLAYER_SIZE = 30;

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'rock' | 'thorn';
}

export default function GameLaneRunner({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [highScore, setHighScore] = useLocalStorage(GAME_STORAGE_KEY, defaultHighScores);
  const highScoreRef = useRef(highScore.laneRunner);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle');

  useEffect(() => {
    highScoreRef.current = highScore.laneRunner;
  }, [highScore.laneRunner]);
  const gameRef = useRef<{
    playerLane: number;
    obstacles: Obstacle[];
    speed: number;
    score: number;
    gameOver: boolean;
    frame: number;
    targetLane: number;
  } | null>(null);
  const reducedMotion = useReducedMotion();

  const initGame = useCallback(() => ({
    playerLane: 1,
    obstacles: [] as Obstacle[],
    speed: gameSettings.laneRunner.baseSpeed * (reducedMotion ? 0.5 : 1),
    score: 0,
    gameOver: false,
    frame: 0,
    targetLane: 1,
  }), [reducedMotion]);

  const switchLane = useCallback((dir: 'left' | 'right') => {
    const g = gameRef.current;
    if (!g || g.gameOver) {
      // Restart
      gameRef.current = initGame();
      setGameState('playing');
      return;
    }
    if (dir === 'left' && g.playerLane > 0) {
      g.playerLane--;
    }
    if (dir === 'right' && g.playerLane < LANES - 1) {
      g.playerLane++;
    }
    if (!g.gameOver && gameState === 'idle') {
      setGameState('playing');
    }
  }, [initGame, gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    const game = initGame();
    gameRef.current = game;

    const draw = () => {
      if (!gameRef.current) return;
      const g = gameRef.current;

      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = '#1a0e12';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Lane lines
      ctx.strokeStyle = 'rgba(201, 185, 154, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 1; i < LANES; i++) {
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(i * LANE_W, 0);
        ctx.lineTo(i * LANE_W, CANVAS_H);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Moving ground
      ctx.fillStyle = 'rgba(201, 185, 154, 0.05)';
      ctx.fillRect(0, CANVAS_H - 10, CANVAS_W, 10);

      // Obstacles
      for (const obs of g.obstacles) {
        if (obs.type === 'rock') {
          ctx.fillStyle = '#722F37';
          ctx.shadowColor = '#722F37';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 4);
          ctx.fill();
          ctx.shadowBlur = 0;
          // Thorn detail
          ctx.fillStyle = '#9B1B30';
          for (let t = 0; t < 3; t++) {
            ctx.beginPath();
            ctx.moveTo(obs.x + obs.width * (t + 0.5) / 3, obs.y);
            ctx.lineTo(obs.x + obs.width * (t + 0.3) / 3, obs.y - 8);
            ctx.lineTo(obs.x + obs.width * (t + 0.7) / 3, obs.y - 8);
            ctx.fill();
          }
        } else {
          ctx.fillStyle = '#9B1B30';
          ctx.shadowColor = '#9B1B30';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 6);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Player (heart)
      const px = game.playerLane * LANE_W + LANE_W / 2;
      const py = CANVAS_H - 60;

      ctx.shadowColor = '#D4A5A5';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#D4A5A5';
      const hs = PLAYER_SIZE / 2;
      ctx.beginPath();
      ctx.moveTo(px, py + hs * 0.4);
      ctx.bezierCurveTo(px + hs * 0.8, py - hs * 0.5, px + hs * 1.2, py + hs * 0.3, px, py + hs * 0.8);
      ctx.bezierCurveTo(px - hs * 1.2, py + hs * 0.3, px - hs * 0.8, py - hs * 0.5, px, py + hs * 0.4);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Score
      ctx.fillStyle = '#FFFDD0';
      ctx.font = '18px "Cormorant Garamond", Georgia, serif';
      ctx.textAlign = 'left';
      ctx.fillText(`♥ ${g.score}`, 10, 25);

      ctx.fillStyle = '#C9B99A';
      ctx.font = '12px "Inter", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(tpl(content.gameLaneRunner.canvasBestTemplate, { best: highScoreRef.current }), CANVAS_W - 10, 20);

      // Idle state
      if (gameState === 'idle') {
        ctx.fillStyle = '#C9B99A';
        ctx.font = '18px "Cormorant Garamond", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText(content.gameLaneRunner.canvasStart, CANVAS_W / 2, CANVAS_H / 2 - 30);
        ctx.fillText('♥', CANVAS_W / 2, CANVAS_H / 2 + 20);
      }

      // Game over
      if (g.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.fillStyle = '#FFFDD0';
        ctx.font = '32px "Cormorant Garamond", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText(content.gameLaneRunner.canvasGameOver, CANVAS_W / 2, CANVAS_H / 2 - 30);
        ctx.fillStyle = '#D4A5A5';
        ctx.font = '20px "Cormorant Garamond", Georgia, serif';
        ctx.fillText(tpl(content.gameLaneRunner.canvasScoreTemplate, { score: g.score }), CANVAS_W / 2, CANVAS_H / 2 + 20);
        ctx.fillStyle = '#C9B99A';
        ctx.font = '14px "Inter", sans-serif';
        ctx.fillText(content.gameLaneRunner.canvasRestart, CANVAS_W / 2, CANVAS_H / 2 + 60);
      }
    };

    const update = () => {
      if (!gameRef.current) return;
      const g = gameRef.current;
      if (g.gameOver) return;

      g.frame++;

      // Spawn obstacles
      const freq = gameSettings.laneRunner.obstacleFrequency * (reducedMotion ? 2 : 1);
      if (gameState === 'playing' && g.frame % freq === 0) {
        const lane = Math.floor(Math.random() * LANES);
        const type: Obstacle['type'] = Math.random() > 0.5 ? 'rock' : 'thorn';
        g.obstacles.push({
          x: lane * LANE_W + 5,
          y: -40,
          width: LANE_W - 10,
          height: type === 'rock' ? 25 : 20,
          type,
        });
      }

      // Move obstacles
      for (const obs of g.obstacles) {
        obs.y += g.speed;
      }

      // Remove off-screen
      g.obstacles = g.obstacles.filter((o) => o.y < CANVAS_H + 50);

      // Collision
      const px = g.playerLane * LANE_W + LANE_W / 2;
      const py = CANVAS_H - 60;
      const pr = PLAYER_SIZE / 2;

      for (const obs of g.obstacles) {
        const ox = obs.x;
        const oy = obs.y;
        const ow = obs.width;
        const oh = obs.height;

        // Simple circle-rect collision
        const nearX = Math.max(ox, Math.min(px, ox + ow));
        const nearY = Math.max(oy, Math.min(py, oy + oh));
        const dist = Math.sqrt((px - nearX) ** 2 + (py - nearY) ** 2);
        if (dist < pr) {
          g.gameOver = true;
          setGameState('over');
          setHighScore((prev) => ({
            ...prev,
            laneRunner: Math.max(prev.laneRunner, g.score),
          }));
          break;
        }
      }

      // Score increases over time
      if (gameState === 'playing' && g.frame % 30 === 0) {
        g.score++;
        g.speed += gameSettings.laneRunner.speedIncrement * (reducedMotion ? 0.3 : 1);
      }

      draw();
      requestAnimationFrame(update);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        switchLane('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        switchLane('right');
      }
    };

    // Also support touch/swipe via simple on-screen buttons
    document.addEventListener('keydown', handleKeyDown);
    const raf = requestAnimationFrame(update);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(raf);
    };
  }, [initGame, switchLane, gameState, reducedMotion]);

  return (
    <div className="game-container">
      <div className="game-container__header">
        <button className="game-container__back" onClick={onBack} aria-label={content.gameLaneRunner.backLabel}>
          ← {content.games.backText}
        </button>
        <h3 className="game-container__title">{content.gameLaneRunner.title}</h3>
      </div>

      <div
        className="game-container__canvas-wrap"
        role="application"
        aria-label={content.gameLaneRunner.ariaLabel}
        tabIndex={0}
      >
        <canvas ref={canvasRef} className="game-container__canvas" />
      </div>

      <div className="game-container__controls">
        <button
          className="game-container__ctrl-btn"
          onClick={() => switchLane('left')}
          aria-label={content.gameLaneRunner.moveLeft}
        >
          ←
        </button>
        <span className="game-container__ctrl-hint">{content.gameLaneRunner.controlsHint}</span>
        <button
          className="game-container__ctrl-btn"
          onClick={() => switchLane('right')}
          aria-label={content.gameLaneRunner.moveRight}
        >
          →
        </button>
      </div>

      <p className="game-container__hint">
        {content.gameLaneRunner.hint}
      </p>
    </div>
  );
}
