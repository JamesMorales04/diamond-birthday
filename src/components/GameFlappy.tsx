import { useRef, useEffect, useState, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import {
  gameSettings,
  defaultHighScores,
  GAME_STORAGE_KEY,
} from '../data/games';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { content } from '../content/page';
import { tpl } from '../utils/tpl';
import { assetUrl } from '../utils/assets';
import {
  FLAPPY_FRAME_PATH,
  FLAPPY_FRAMES,
  FLAPPY_DISPLAY_W,
  FLAPPY_DISPLAY_H,
  FLAPPY_SPRITE_MAP,
  FLAP_PULSE_DURATION,
  MAX_ROTATION,
  ROTATION_VELOCITY_CAP,
  FLAPPY_BG_PATH,
  FLAPPY_OBSTACLE_PATH,
  FLAPPY_OBSTACLE_SRC_X,
  FLAPPY_OBSTACLE_SRC_Y,
  FLAPPY_OBSTACLE_SRC_W,
  FLAPPY_OBSTACLE_SRC_H,
  getFlappyHitbox,
  selectFlappyFrame,
} from '../data/flappyAssets';

interface FlappyGame {
  bird: { x: number; y: number; vy: number };
  pipes: { x: number; top: number; bottom: number; scored: boolean }[];
  score: number;
  gameOver: boolean;
  started: boolean;
  /** Whether the best-score has been persisted for this round. Guards against
   *  duplicate localStorage writes when the RAF loop keeps running after game-over. */
  scoreSaved: boolean;
  /** Accumulated time (in frame-equivalent units) since last pipe spawn. */
  pipeSpawnTimer: number;
  /** Seconds remaining for the "up" sprite flap-pulse. */
  flapTimer: number;
}

const settings = gameSettings.flappy;
const CANVAS_W = 400;
const CANVAS_H = 500;

/** Pipe obstacle visual width (canvas pixels). */
const PIPE_W = 70;
/** Pipe obstacle collision/scoring width — kept narrower than visual for gameplay fairness. */
const PIPE_HIT_W = 55;

// Colour constants matching CSS custom properties
const COL_BG = '#1a0e12';
const COL_MUTED_GOLD = '#C9B99A';
const COL_WINE = '#722F37';
const COL_CREAM = '#FFFDD0';
const COL_DUSTY_PINK = '#D4A5A5';
const COL_OVERLAY = 'rgba(0, 0, 0, 0.7)';

/**
 * Minimum top-edge padding for the random pipe-gap Y-position.
 * Prevents the gap from being placed too low — the top pipe must have
 * at least this many canvas pixels above the gap.
 */
const PIPE_GAP_TOP_MARGIN = 200;
/** Pipes whose left edge is past this threshold (px left of canvas) are removed. */
const PIPE_REMOVE_THRESHOLD = -PIPE_W;

/**
 * Render deps bundled into a single object so drawGame's signature stays
 * manageable — avoids a long positional-parameter list.
 */
interface DrawAssets {
  highScore: number;
  frames: HTMLImageElement[];
  loaded: boolean[];
  bgImage: HTMLImageElement | null;
  bgLoaded: boolean;
  pipeImg: HTMLImageElement | null;
  pipeLoaded: boolean;
}

/**
 * Pure render function — draws the full game state onto the canvas.
 * Extracted from the component so the requestAnimationFrame loop stays
 * focused on state transitions and the drawing logic is unit-testable.
 */
function drawGame(
  ctx: CanvasRenderingContext2D,
  game: FlappyGame,
  assets: DrawAssets,
): void {
  const { highScore, frames, loaded, bgImage, bgLoaded, pipeImg, pipeLoaded } =
    assets;

  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  if (bgImage && bgLoaded) {
    ctx.drawImage(bgImage, 0, 0, CANVAS_W, CANVAS_H);
  } else {
    ctx.fillStyle = COL_BG;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }

  if (!game.started && !game.gameOver) {
    ctx.fillStyle = COL_MUTED_GOLD;
    ctx.font = '18px "Cormorant Garamond", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(content.gameFlappy.hint.idle, CANVAS_W / 2, CANVAS_H / 2 - 30);
    ctx.fillText('♥', CANVAS_W / 2, CANVAS_H / 2 + 20);
    return;
  }

  // Draw pipes. When the sprite is loaded, render the visible pipe art
  // cropped from pipes.png so the transparent margins do not turn the pipe
  // into a box. The top pipe is flipped so the cap faces the gap.
  for (const pipe of game.pipes) {
    if (pipeImg && pipeLoaded) {
      ctx.save();
      ctx.translate(pipe.x, pipe.top);
      ctx.scale(1, -1);
      ctx.drawImage(
        pipeImg,
        FLAPPY_OBSTACLE_SRC_X,
        FLAPPY_OBSTACLE_SRC_Y,
        FLAPPY_OBSTACLE_SRC_W,
        FLAPPY_OBSTACLE_SRC_H,
        0,
        0,
        PIPE_W,
        pipe.top,
      );
      ctx.restore();

      ctx.drawImage(
        pipeImg,
        FLAPPY_OBSTACLE_SRC_X,
        FLAPPY_OBSTACLE_SRC_Y,
        FLAPPY_OBSTACLE_SRC_W,
        FLAPPY_OBSTACLE_SRC_H,
        pipe.x,
        pipe.bottom,
        PIPE_W,
        CANVAS_H - pipe.bottom,
      );
    } else {
      ctx.fillStyle = COL_WINE;
      ctx.strokeStyle = COL_MUTED_GOLD;
      ctx.lineWidth = 2;
      ctx.fillRect(pipe.x, 0, PIPE_W, pipe.top);
      ctx.strokeRect(pipe.x, 0, PIPE_W, pipe.top);
      ctx.fillRect(pipe.x, pipe.bottom, PIPE_W, CANVAS_H - pipe.bottom);
      ctx.strokeRect(pipe.x, pipe.bottom, PIPE_W, CANVAS_H - pipe.bottom);
    }
  }

  // ── Draw Chester sprite ──
  const bx = game.bird.x;
  const by = game.bird.y;

  const spriteState = selectFlappyFrame(game.bird.vy, game.flapTimer);
  const frameIdx = FLAPPY_SPRITE_MAP[spriteState].index;

  const frameOk = frames[frameIdx] && loaded[frameIdx];
  if (frameOk) {
    // Subtle rotation from vertical velocity (flap pulse doesn't affect rotation)
    const speed = Math.min(Math.abs(game.bird.vy) / ROTATION_VELOCITY_CAP, 1);
    const rotation =
      game.bird.vy < 0 ? -MAX_ROTATION * speed : MAX_ROTATION * speed;

    ctx.shadowBlur = 0; // reset any stray shadow from pipe drawing

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(rotation);
    ctx.drawImage(
      frames[frameIdx],
      -FLAPPY_DISPLAY_W / 2,
      -FLAPPY_DISPLAY_H / 2,
      FLAPPY_DISPLAY_W,
      FLAPPY_DISPLAY_H,
    );
    ctx.restore();
  } else {
    // Fallback heart when sprite frame isn't ready
    ctx.fillStyle = COL_DUSTY_PINK;
    ctx.shadowColor = COL_DUSTY_PINK;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(bx, by + 10);
    ctx.bezierCurveTo(bx + 15, by - 5, bx + 25, by + 5, bx, by + 20);
    ctx.bezierCurveTo(bx - 25, by + 5, bx - 15, by - 5, bx, by + 10);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Score
  ctx.fillStyle = COL_CREAM;
  ctx.font = '24px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(`♥ ${game.score}`, 10, 35);

  // High score
  ctx.fillStyle = COL_MUTED_GOLD;
  ctx.font = '14px "Inter", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(
    tpl(content.gameFlappy.canvasBestTemplate, { best: highScore }),
    CANVAS_W - 10,
    25,
  );

  // Game over overlay
  if (game.gameOver) {
    ctx.fillStyle = COL_OVERLAY;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = COL_CREAM;
    ctx.font = '32px "Cormorant Garamond", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      content.gameFlappy.canvasGameOver,
      CANVAS_W / 2,
      CANVAS_H / 2 - 30,
    );
    ctx.fillStyle = COL_DUSTY_PINK;
    ctx.font = '20px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(
      tpl(content.gameFlappy.canvasScoreTemplate, { score: game.score }),
      CANVAS_W / 2,
      CANVAS_H / 2 + 20,
    );
    ctx.fillStyle = COL_MUTED_GOLD;
    ctx.font = '14px "Inter", sans-serif';
    ctx.fillText(
      content.gameFlappy.canvasTapRestart,
      CANVAS_W / 2,
      CANVAS_H / 2 + 60,
    );
  }
}

export default function GameFlappy({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [highScore, setHighScore] = useLocalStorage(
    GAME_STORAGE_KEY,
    defaultHighScores,
  );
  const highScoreRef = useRef(highScore.flappy);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>(
    'idle',
  );
  const gameRef = useRef<FlappyGame | null>(null);
  const animRef = useRef<number>(0);
  const reducedMotion = useReducedMotion();
  /* Timestamp from the previous requestAnimationFrame call (ms). 0 = first frame. */
  const lastTimestampRef = useRef<number>(0);

  // Chester sprite frames (preloaded on mount)
  const chesterFramesRef = useRef<HTMLImageElement[]>([]);
  const chesterLoadedRef = useRef<boolean[]>([]);
  // Background image (uk.png) and obstacle image (pipes.png)
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const bgLoadedRef = useRef(false);
  const obstacleImageRef = useRef<HTMLImageElement | null>(null);
  const obstacleLoadedRef = useRef(false);

  /* ── Preload Chester sprites + background + obstacle (per-frame success tracking) ── */
  useEffect(() => {
    const frames: HTMLImageElement[] = [];
    const loaded: boolean[] = [];

    for (let i = 1; i <= FLAPPY_FRAMES; i++) {
      const idx = i - 1;
      const img = new Image();
      img.src = assetUrl(FLAPPY_FRAME_PATH(i));
      img.onload = () => {
        loaded[idx] = true;
      };
      img.onerror = () => {
        loaded[idx] = false;
        if (import.meta.env.DEV) {
          console.warn(
            `[GameFlappy] Chester frame load failed: ${FLAPPY_FRAME_PATH(i)}`,
          );
        }
      };
      frames.push(img);
      loaded.push(false);
    }

    // Background image (uk.png)
    const bg = new Image();
    bg.src = assetUrl(FLAPPY_BG_PATH);
    bg.onload = () => {
      bgLoadedRef.current = true;
    };
    bg.onerror = () => {
      bgLoadedRef.current = false;
      if (import.meta.env.DEV) {
        console.warn(
          `[GameFlappy] Background image load failed: ${FLAPPY_BG_PATH}`,
        );
      }
    };
    bgImageRef.current = bg;

    // Obstacle image (pipes.png)
    const obs = new Image();
    obs.src = assetUrl(FLAPPY_OBSTACLE_PATH);
    obs.onload = () => {
      obstacleLoadedRef.current = true;
    };
    obs.onerror = () => {
      obstacleLoadedRef.current = false;
      if (import.meta.env.DEV) {
        console.warn(
          `[GameFlappy] Obstacle image load failed: ${FLAPPY_OBSTACLE_PATH}`,
        );
      }
    };
    obstacleImageRef.current = obs;

    chesterFramesRef.current = frames;
    chesterLoadedRef.current = loaded;
    return () => {
      for (const f of frames) {
        f.onload = null;
        f.onerror = null;
      }
      if (bgImageRef.current) {
        bgImageRef.current.onload = null;
        bgImageRef.current.onerror = null;
      }
      if (obstacleImageRef.current) {
        obstacleImageRef.current.onload = null;
        obstacleImageRef.current.onerror = null;
      }
      chesterFramesRef.current = [];
      chesterLoadedRef.current = [];
      bgImageRef.current = null;
      bgLoadedRef.current = false;
      obstacleImageRef.current = null;
      obstacleLoadedRef.current = false;
    };
  }, []);

  // Keep ref in sync without restarting game effects
  useEffect(() => {
    highScoreRef.current = highScore.flappy;
  }, [highScore.flappy]);

  const initGame = useCallback(
    (): FlappyGame => ({
      bird: { x: 80, y: CANVAS_H / 2, vy: 0 },
      pipes: [],
      score: 0,
      gameOver: false,
      started: false,
      scoreSaved: false,
      pipeSpawnTimer: 0,
      flapTimer: 0,
    }),
    [],
  );

  const jump = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    if (g.gameOver) {
      // Seamless restart: re-initialise and flap immediately
      const fresh = initGame();
      fresh.started = true;
      fresh.bird.vy = settings.jumpForce * (reducedMotion ? 0.5 : 1);
      fresh.flapTimer = FLAP_PULSE_DURATION;
      gameRef.current = fresh;
      setGameState('playing');
      setScore(0);
      return;
    }
    if (!g.started) {
      g.started = true;
      setGameState('playing'); // first flap transitions from idle to playing
    }
    g.bird.vy = settings.jumpForce * (reducedMotion ? 0.5 : 1);
    g.flapTimer = FLAP_PULSE_DURATION;
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
    lastTimestampRef.current = 0;

    /** Build the DrawAssets object from current refs. */
    const buildAssets = (): DrawAssets => ({
      highScore: highScoreRef.current,
      frames: chesterFramesRef.current,
      loaded: chesterLoadedRef.current,
      bgImage: bgImageRef.current,
      bgLoaded: bgLoadedRef.current,
      pipeImg: obstacleImageRef.current,
      pipeLoaded: obstacleLoadedRef.current,
    });

    const update = (timestamp: number) => {
      // ── Compute delta time (normalised so 1.0 ≈ one frame at 60 fps) ──
      if (lastTimestampRef.current === 0) {
        lastTimestampRef.current = timestamp;
        const currentGame = gameRef.current;
        if (currentGame) drawGame(ctx, currentGame, buildAssets());
        animRef.current = requestAnimationFrame(update);
        return;
      }
      const deltaMs = Math.min(timestamp - lastTimestampRef.current, 100);
      lastTimestampRef.current = timestamp;
      const dt = deltaMs / (1000 / 60);

      const game = gameRef.current;
      if (!game) return;

      // ── Game logic (skip when game-over — RAF loop keeps running for restart) ──
      if (!game.gameOver) {
        // ── Flap-pulse countdown (wall-clock seconds) ──
        if (game.flapTimer > 0) {
          game.flapTimer = Math.max(game.flapTimer - deltaMs / 1000, 0);
        }

        // ── Bird physics (dt-scaled) ──
        game.bird.vy += settings.gravity * (reducedMotion ? 0.3 : 1) * dt;
        game.bird.y += game.bird.vy * dt;

        // ── Pipe spawn (dt-accumulated timer) ──
        const spawnThreshold = reducedMotion
          ? settings.pipeFrequency * 2
          : settings.pipeFrequency;
        if (game.started) {
          game.pipeSpawnTimer += dt;
          if (game.pipeSpawnTimer >= spawnThreshold) {
            game.pipeSpawnTimer -= spawnThreshold;
            const gapY =
              100 +
              Math.random() *
                (CANVAS_H - settings.pipeGap - PIPE_GAP_TOP_MARGIN);
            game.pipes.push({
              x: CANVAS_W,
              top: gapY,
              bottom: gapY + settings.pipeGap,
              scored: false,
            });
          }
        }

        // ── Move pipes (dt-scaled) ──
        for (const pipe of game.pipes) {
          pipe.x -= settings.pipeSpeed * (reducedMotion ? 0.5 : 1) * dt;
        }

        // Remove off-screen pipes
        game.pipes = game.pipes.filter((p) => p.x > PIPE_REMOVE_THRESHOLD);

        // ── Collision detection ──
        const {
          left: birdLeft,
          right: birdRight,
          top: birdTop,
          bottom: birdBottom,
        } = getFlappyHitbox(game.bird.x, game.bird.y);

        // Walls
        if (birdTop <= 0 || birdBottom >= CANVAS_H) {
          game.gameOver = true;
          setGameState('over');
        }

        // Pipes
        for (const pipe of game.pipes) {
          if (
            birdRight > pipe.x &&
            birdLeft < pipe.x + PIPE_HIT_W &&
            (birdTop < pipe.top || birdBottom > pipe.bottom)
          ) {
            game.gameOver = true;
            setGameState('over');
          }

          // Score — game.score is the single source of truth; React state
          // (`setScore`) is synced only so the DOM hint outside the canvas
          // stays reactive without reading from gameRef in JSX.
          if (!pipe.scored && pipe.x + PIPE_HIT_W < birdLeft) {
            pipe.scored = true;
            game.score++;
            setScore(game.score);
          }
        }

        if (game.gameOver && !game.scoreSaved) {
          game.scoreSaved = true;
          const best = Math.max(highScoreRef.current, game.score);
          setHighScore((prev) => ({
            ...prev,
            flappy: best,
          }));
          highScoreRef.current = best;
        }
      }

      drawGame(ctx, game, buildAssets());
      animRef.current = requestAnimationFrame(update);
    };

    animRef.current = requestAnimationFrame(update);

    return () => cancelAnimationFrame(animRef.current);
  }, [initGame, reducedMotion]);

  return (
    <div className="game-container">
      <div className="game-container__header">
        <button
          className="game-container__back"
          onClick={onBack}
          aria-label={content.gameFlappy.backLabel}
        >
          ← {content.games.backText}
        </button>
        <h3 className="game-container__title">{content.gameFlappy.title}</h3>
      </div>

      <div
        className="game-container__canvas-wrap"
        onClick={jump}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            jump();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={content.gameFlappy.ariaLabel}
      >
        <canvas ref={canvasRef} className="game-container__canvas" />
      </div>

      <p className="game-container__hint" aria-live="polite">
        {gameState === 'idle' && content.gameFlappy.hint.idle}
        {gameState === 'playing' && content.gameFlappy.hint.playing}
        {gameState === 'over' && tpl(content.gameFlappy.hint.over, { score })}
      </p>
    </div>
  );
}
