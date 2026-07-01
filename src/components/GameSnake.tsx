import { useRef, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { gameSettings, defaultHighScores, GAME_STORAGE_KEY } from '../data/games';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface SnakeSegment {
  x: number;
  y: number;
}

type Direction = 'up' | 'down' | 'left' | 'right';

interface SnakeGame {
  snake: SnakeSegment[];
  food: { x: number; y: number };
  direction: Direction;
  nextDirection: Direction;
  gameOver: boolean;
  started: boolean;
  tick: number;
}

const settings = gameSettings.snake;
const GRID = settings.gridSize;
const CANVAS_W = 400;
const CANVAS_H = 400;
const CELL = CANVAS_W / GRID;

export default function GameSnake({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [highScore, setHighScore] = useLocalStorage(GAME_STORAGE_KEY, defaultHighScores);
  const highScoreRef = useRef(highScore.snake);
  const gameRef = useRef<SnakeGame | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    highScoreRef.current = highScore.snake;
  }, [highScore.snake]);

  const spawnFood = useCallback((snake: SnakeSegment[]) => {
    const occupied = new Set(snake.map((s) => `${s.x},${s.y}`));
    let x: number, y: number;
    do {
      x = Math.floor(Math.random() * GRID);
      y = Math.floor(Math.random() * GRID);
    } while (occupied.has(`${x},${y}`));
    return { x, y };
  }, []);

  const initGame = useCallback((): SnakeGame => {
    const startX = Math.floor(GRID / 2);
    const startY = Math.floor(GRID / 2);
    const snake = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY },
    ];
    return {
      snake,
      food: spawnFood(snake),
      direction: 'right',
      nextDirection: 'right',
      gameOver: false,
      started: false,
      tick: 0,
    };
  }, [spawnFood]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    const game: SnakeGame = initGame();
    gameRef.current = game;

    const speed = reducedMotion ? settings.initialSpeed * 0.5 : settings.initialSpeed;
    let lastTick = 0;

    const drawBoard = () => {
      const g = gameRef.current;
      if (!g) return;

      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = '#1a0e12';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Grid (very subtle)
      ctx.strokeStyle = 'rgba(201, 185, 154, 0.05)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= GRID; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL, 0);
        ctx.lineTo(i * CELL, CANVAS_H);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * CELL);
        ctx.lineTo(CANVAS_W, i * CELL);
        ctx.stroke();
      }

      // Food (heart)
      const fx = g.food.x * CELL + CELL / 2;
      const fy = g.food.y * CELL + CELL / 2;

      ctx.shadowColor = '#D4A5A5';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#D4A5A5';
      ctx.beginPath();
      ctx.moveTo(fx, fy + CELL * 0.25);
      ctx.bezierCurveTo(
        fx + CELL * 0.4, fy - CELL * 0.2,
        fx + CELL * 0.6, fy + CELL * 0.15,
        fx, fy + CELL * 0.4,
      );
      ctx.bezierCurveTo(
        fx - CELL * 0.6, fy + CELL * 0.15,
        fx - CELL * 0.4, fy - CELL * 0.2,
        fx, fy + CELL * 0.25,
      );
      ctx.fill();
      ctx.shadowBlur = 0;

      // Snake
      for (let i = 0; i < g.snake.length; i++) {
        const seg = g.snake[i];
        const isHead = i === 0;
        const x = seg.x * CELL + 1;
        const y = seg.y * CELL + 1;
        const size = CELL - 2;

        ctx.fillStyle = isHead ? '#9B1B30' : '#722F37';
        ctx.shadowColor = isHead ? '#9B1B30' : 'transparent';
        ctx.shadowBlur = isHead ? 10 : 0;

        ctx.beginPath();
        ctx.roundRect(x, y, size, size, 4);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (isHead) {
          ctx.fillStyle = '#FFFDD0';
          ctx.font = `${CELL * 0.4}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('♥', seg.x * CELL + CELL / 2, seg.y * CELL + CELL / 2);
        }
      }

      // Score
      ctx.fillStyle = '#FFFDD0';
      ctx.font = '18px "Cormorant Garamond", Georgia, serif';
      ctx.textAlign = 'left';
      ctx.fillText(`♥ ${g.snake.length - 3}`, 10, 25);

      ctx.fillStyle = '#C9B99A';
      ctx.font = '12px "Inter", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`Best: ${highScoreRef.current}`, CANVAS_W - 10, 20);

      if (g.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.fillStyle = '#FFFDD0';
        ctx.font = '32px "Cormorant Garamond", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', CANVAS_W / 2, CANVAS_H / 2 - 30);
        ctx.fillStyle = '#D4A5A5';
        ctx.font = '20px "Cormorant Garamond", Georgia, serif';
        ctx.fillText(`Score: ${g.snake.length - 3}`, CANVAS_W / 2, CANVAS_H / 2 + 20);
        ctx.fillStyle = '#C9B99A';
        ctx.font = '14px "Inter", sans-serif';
        ctx.fillText('Press any arrow key to restart', CANVAS_W / 2, CANVAS_H / 2 + 60);
      } else if (!g.started) {
        ctx.fillStyle = '#C9B99A';
        ctx.font = '18px "Cormorant Garamond", Georgia, serif';
        ctx.textAlign = 'center';
        ctx.fillText('Press arrow keys to start', CANVAS_W / 2, CANVAS_H / 2 - 30);
        ctx.fillText('♥', CANVAS_W / 2, CANVAS_H / 2 + 20);
      }
    };

    const gameLoop = (timestamp: number) => {
      const g = gameRef.current;
      if (!g) return;

      if (timestamp - lastTick >= speed) {
        lastTick = timestamp;

        if (!g.gameOver) {
          g.direction = g.nextDirection;

          // Move snake
          const head = { ...g.snake[0] };
          switch (g.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
          }

          // Wall collision
          if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
            g.gameOver = true;
            setHighScore((prev) => ({
              ...prev,
              snake: Math.max(prev.snake, g.snake.length - 3),
            }));
          }

          // Self collision
          if (!g.gameOver && g.snake.some((s) => s.x === head.x && s.y === head.y)) {
            g.gameOver = true;
            setHighScore((prev) => ({
              ...prev,
              snake: Math.max(prev.snake, g.snake.length - 3),
            }));
          }

          if (!g.gameOver) {
            g.snake.unshift(head);

            // Eat food
            if (head.x === g.food.x && head.y === g.food.y) {
              g.food = spawnFood(g.snake);
            } else {
              g.snake.pop();
            }
          }
        }

        drawBoard();
      }

      requestAnimationFrame(gameLoop);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const g = gameRef.current;
      if (!g) return;

      const keyMap: Record<string, Direction> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
      };

      const newDir = keyMap[e.key];
      if (!newDir) return;
      e.preventDefault();

      if (g.gameOver) {
        gameRef.current = initGame();
        return;
      }

      // Prevent reversing
      const opposites: Record<Direction, Direction> = {
        up: 'down',
        down: 'up',
        left: 'right',
        right: 'left',
      };

      if (newDir !== opposites[g.direction]) {
        g.nextDirection = newDir;
        if (!g.started) {
          g.started = true;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const raf = requestAnimationFrame(gameLoop);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(raf);
    };
  }, [initGame, spawnFood, reducedMotion]);

  return (
    <div className="game-container">
      <div className="game-container__header">
        <button className="game-container__back" onClick={onBack} aria-label="Back to games menu">
          ← Back
        </button>
        <h3 className="game-container__title">Love Snake</h3>
      </div>

      <div
        className="game-container__canvas-wrap"
        role="application"
        aria-label="Snake game. Use arrow keys to control the snake."
        tabIndex={0}
      >
        <canvas ref={canvasRef} className="game-container__canvas" />
      </div>

      <p className="game-container__hint">
        Use arrow keys to move. Collect hearts to grow!
      </p>
    </div>
  );
}
