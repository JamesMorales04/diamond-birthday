import { useRef, useEffect, useState, useCallback } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  gameSettings,
  defaultHighScores,
  GAME_STORAGE_KEY,
} from "../data/games";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useSwipe } from "../hooks/useSwipe";
import { content } from "../content/page";
import { tpl } from "../utils/tpl";
import { assetUrl } from "../utils/assets";
import {
  DOG_FRAME_PATH,
  DOG_FRAMES,
  DOG_DISPLAY_W,
  DOG_DISPLAY_H,
  DOG_COLLISION_OFFSET_X,
  DOG_COLLISION_OFFSET_Y,
  DOG_COLLISION_W,
  DOG_COLLISION_H,
  DOG_GROUND_OFFSET,
  DOG_ANIM_INTERVAL,
  DOG_CROUCH_FRAME,
  DOG_JUMP_FRAME,
} from "../data/dogRunnerAssets";

const LANES = 3;
const CANVAS_W = 300;
const CANVAS_H = 500;
const LANE_W = CANVAS_W / LANES;

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: "rock" | "thorn";
  lane: number;
  /** Whether the player has been scored for passing this obstacle */
  scored: boolean;
}

interface GameData {
  playerLane: number;
  obstacles: Obstacle[];
  speed: number;
  score: number;
  gameOver: boolean;
  frame: number;
  playerAction: "running" | "jumping" | "sliding";
  actionTimer: number;
  paused: boolean;
  started: boolean;
}

const JUMP_DURATION = 24; // frames (increased for wider forgiveness window)
const SLIDE_DURATION = 30; // frames (increased for wider forgiveness window)
const JUMP_HEIGHT = 42; // pixels

/* ── Obstacle spawn / removal thresholds ── */
const OBSTACLE_SPAWN_Y = -40;
const OBSTACLE_SPAWN_X_OFFSET = 5;
const OBSTACLE_MIN_GAP = 10;
const OBSTACLE_ROCK_HEIGHT = 25;
const OBSTACLE_THORN_HEIGHT = 20;
const SCORE_PASS_THRESHOLD = 10; // px past canvas bottom to count as scored
const OBSTACLE_REMOVE_THRESHOLD = 50; // px past canvas bottom before removal

/* ── Collision box adjustments during sliding ── */
const SLIDE_COLLISION_Y_OFFSET = 14;
const SLIDE_COLLISION_H = 18;
// Slide width and x-offset match standing (28px, centered at px).
// Previously SLIDE_COLLISION_W was 34 — wider than standing — which
// made collisions more likely during a dodge action.  Now the slide
// box is the same width as standing (28px, not wider).
const SLIDE_COLLISION_W = DOG_COLLISION_W;
const SLIDE_COLLISION_X_OFFSET = 0;

/* ── Collision box adjustment during jumping ── */
// Shorter collision height during jump so the dog's raised box
// clears obstacles with a forgiving margin.  The standing box is
// 32px tall, giving only 10px peak clearance (42px lift − 32px box).
// With JUMP_COLLISION_H the clearance becomes 22px (~11 frames at
// speed 2) — the player doesn't need frame-perfect timing.
const JUMP_COLLISION_H = 20;

/* ── Drawing / scoring ── */
const SLIDE_DRAW_Y_OFFSET = 8;
const GROUND_HEIGHT = 10;
const SCORE_INTERVAL = 30; // frames between passive score increments

/** Vertical pixel offset during a jump animation (sine arc peaking at JUMP_HEIGHT) */
function getJumpOffset(actionTimer: number): number {
  const jumpProgress = actionTimer / JUMP_DURATION;
  return Math.sin((1 - jumpProgress) * Math.PI) * JUMP_HEIGHT;
}

/**
 * Clamp a 1-based frame index to valid range [1, DOG_FRAMES], then convert to 0-based.
 * Returns 0 (first frame) as safe fallback.
 */
function frameIndex(n: number): number {
  const clamped = Math.max(1, Math.min(n, DOG_FRAMES)) - 1;
  return clamped;
}

export default function GameLaneRunner({ onBack }: { onBack: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [highScore, setHighScore] = useLocalStorage(
    GAME_STORAGE_KEY,
    defaultHighScores,
  );
  const highScoreRef = useRef(highScore["lane-runner"]);
  const [gameState, setGameState] = useState<"idle" | "playing" | "over">(
    "idle",
  );
  const [displayScore, setDisplayScore] = useState(0);
  const gameRef = useRef<GameData | null>(null);
  const animRef = useRef<number>(0);

  /* ── Stable reduced-motion ref (preference changes never reset the game loop) ── */
  const reducedMotionPref = useReducedMotion();
  const reducedMotionRef = useRef(reducedMotionPref);
  useEffect(() => {
    reducedMotionRef.current = reducedMotionPref;
  }, [reducedMotionPref]);

  const dogFramesRef = useRef<HTMLImageElement[]>([]);
  const dogLoadedRef = useRef<boolean[]>([]);

  /* ── Sync high-score ref ── */
  useEffect(() => {
    highScoreRef.current = highScore["lane-runner"];
  }, [highScore["lane-runner"]]);

  /* ── Preload dog frames (per-frame success tracking) ── */
  useEffect(() => {
    const frames: HTMLImageElement[] = [];
    const loaded: boolean[] = [];
    const total = DOG_FRAMES;

    for (let i = 1; i <= total; i++) {
      const idx = i - 1;
      const img = new Image();
      img.src = assetUrl(DOG_FRAME_PATH(i));
      img.onload = () => {
        loaded[idx] = true;
      };
      img.onerror = () => {
        loaded[idx] = false; // mark failed frame explicitly
      };
      frames.push(img);
      loaded.push(false);
    }
    dogFramesRef.current = frames;
    dogLoadedRef.current = loaded;
    return () => {
      dogFramesRef.current = [];
      dogLoadedRef.current = [];
    };
  }, []);

  /* ── Factory (no reducedMotion dependency — reads ref at call time) ── */
  const initGame = useCallback(
    (): GameData => ({
      playerLane: 1,
      obstacles: [],
      speed:
        gameSettings["lane-runner"].baseSpeed *
        (reducedMotionRef.current ? 0.5 : 1),
      score: 0,
      gameOver: false,
      frame: 0,
      playerAction: "running",
      actionTimer: 0,
      paused: false,
      started: false,
    }),
    [],
  );

  /* ── Input handler (left/right/up/down) ── */
  const handleInput = useCallback(
    (action: "left" | "right" | "up" | "down") => {
      const game = gameRef.current;
      if (!game) return;

      // Restart if game is over
      if (game.gameOver) {
        gameRef.current = initGame();
        gameRef.current.started = true;
        setGameState("playing");
        setDisplayScore(0);
        return;
      }

      if (game.paused) return;

      // Start game from idle
      if (gameState === "idle") {
        game.started = true;
        setGameState("playing");
      }

      switch (action) {
        case "left":
          if (game.playerLane > 0) game.playerLane--;
          break;
        case "right":
          if (game.playerLane < LANES - 1) game.playerLane++;
          break;
        case "up":
          if (game.playerAction === "running") {
            game.playerAction = "jumping";
            game.actionTimer = JUMP_DURATION;
          }
          break;
        case "down":
          if (game.playerAction === "running") {
            game.playerAction = "sliding";
            game.actionTimer = SLIDE_DURATION;
          }
          break;
      }
    },
    [gameState, initGame],
  );

  /* ── Pause toggle (keyboard and on-screen) ── */
  const togglePause = useCallback(() => {
    const g = gameRef.current;
    if (!g || g.gameOver) return;
    if (!g.started && !g.paused) return; // not started, nothing to pause
    g.paused = !g.paused;
  }, []);

  /* ── Keyboard ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          handleInput("left");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          handleInput("right");
          break;
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          handleInput("up");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          handleInput("down");
          break;
        case " ":
          e.preventDefault();
          handleInput("up");
          break;
        case "p":
        case "P":
          e.preventDefault();
          togglePause();
          break;
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [handleInput, togglePause]);

  /* ── Swipe ── */
  const swipeProps = useSwipe({
    onSwipeLeft: () => handleInput("left"),
    onSwipeRight: () => handleInput("right"),
    onSwipeUp: () => handleInput("up"),
    onSwipeDown: () => handleInput("down"),
  });

  /* ── Canvas loop (stable — never re-runs on reducedMotion changes) ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    gameRef.current = initGame();

    const rm = () => reducedMotionRef.current; // read stable ref inside loop

    // ── Update sub-functions ──

    const updateActionTimer = (game: GameData) => {
      if (game.playerAction === "jumping" || game.playerAction === "sliding") {
        game.actionTimer--;
        if (game.actionTimer <= 0) game.playerAction = "running";
      }
    };

    const spawnObstacle = (game: GameData) => {
      const freq =
        gameSettings["lane-runner"].obstacleFrequency * (rm() ? 2 : 1);
      if (game.frame % freq !== 0) return;
      const lane = Math.floor(Math.random() * LANES);
      const type: Obstacle["type"] = Math.random() > 0.5 ? "rock" : "thorn";
      game.obstacles.push({
        x: lane * LANE_W + OBSTACLE_SPAWN_X_OFFSET,
        y: OBSTACLE_SPAWN_Y,
        width: LANE_W - OBSTACLE_MIN_GAP,
        height: type === "rock" ? OBSTACLE_ROCK_HEIGHT : OBSTACLE_THORN_HEIGHT,
        type,
        lane,
        scored: false,
      });
    };

    const moveAndScoreObstacles = (game: GameData) => {
      for (const obs of game.obstacles) {
        obs.y += game.speed;
        if (!obs.scored && obs.y > CANVAS_H + SCORE_PASS_THRESHOLD) {
          obs.scored = true;
          game.score += 2;
        }
      }
      game.obstacles = game.obstacles.filter(
        (o) => o.y < CANVAS_H + OBSTACLE_REMOVE_THRESHOLD,
      );
    };

    const increaseDifficulty = (game: GameData) => {
      game.score++;
      game.speed +=
        gameSettings["lane-runner"].speedIncrement * (rm() ? 0.3 : 1);
    };

    /** Returns true when a collision triggers game-over */
    const checkCollision = (game: GameData): boolean => {
      const px = game.playerLane * LANE_W + LANE_W / 2;
      const py = CANVAS_H - DOG_GROUND_OFFSET;

      let colX = px - DOG_DISPLAY_W / 2 + DOG_COLLISION_OFFSET_X;
      let colY = py - DOG_DISPLAY_H / 2 + DOG_COLLISION_OFFSET_Y;
      let colW = DOG_COLLISION_W;
      let colH = DOG_COLLISION_H;

      if (game.playerAction === "jumping") {
        colY -= getJumpOffset(game.actionTimer);
        colH = JUMP_COLLISION_H;
      } else if (game.playerAction === "sliding") {
        colY += SLIDE_COLLISION_Y_OFFSET;
        colH = SLIDE_COLLISION_H;
        colW = SLIDE_COLLISION_W;
        colX = px - colW / 2 + SLIDE_COLLISION_X_OFFSET;
      }

      for (const obs of game.obstacles) {
        if (
          colX < obs.x + obs.width &&
          colX + colW > obs.x &&
          colY < obs.y + obs.height &&
          colY + colH > obs.y
        ) {
          game.gameOver = true;
          setGameState("over");
          setDisplayScore(game.score);
          setHighScore((prev) => ({
            ...prev,
            "lane-runner": Math.max(prev["lane-runner"], game.score),
          }));
          return true;
        }
      }
      return false;
    };

    const update = (game: GameData) => {
      if (game.gameOver || game.paused || !game.started) return;

      game.frame++;
      updateActionTimer(game);
      spawnObstacle(game);
      moveAndScoreObstacles(game);

      // Stop processing on collision so game-over score/speed are not
      // mutated further — keeps display, high-score save, and HUD consistent.
      if (checkCollision(game)) return;

      if (game.frame % SCORE_INTERVAL === 0) {
        increaseDifficulty(game);
      }
    };

    // ── Draw sub-functions ──

    const drawBackground = (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = "#1a0e12";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    };

    const drawLaneLines = (ctx: CanvasRenderingContext2D) => {
      ctx.strokeStyle = "rgba(201, 185, 154, 0.1)";
      ctx.lineWidth = 1;
      for (let i = 1; i < LANES; i++) {
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(i * LANE_W, 0);
        ctx.lineTo(i * LANE_W, CANVAS_H);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    };

    const drawGround = (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = "rgba(201, 185, 154, 0.05)";
      ctx.fillRect(0, CANVAS_H - GROUND_HEIGHT, CANVAS_W, GROUND_HEIGHT);
    };

    const drawObstacles = (
      ctx: CanvasRenderingContext2D,
      obstacles: Obstacle[],
    ) => {
      for (const obs of obstacles) {
        if (obs.type === "rock") {
          ctx.fillStyle = "#722F37";
          ctx.shadowColor = "#722F37";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 4);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#9B1B30";
          for (let t = 0; t < 3; t++) {
            ctx.beginPath();
            ctx.moveTo(obs.x + (obs.width * (t + 0.5)) / 3, obs.y);
            ctx.lineTo(obs.x + (obs.width * (t + 0.3)) / 3, obs.y - 8);
            ctx.lineTo(obs.x + (obs.width * (t + 0.7)) / 3, obs.y - 8);
            ctx.fill();
          }
        } else {
          ctx.fillStyle = "#9B1B30";
          ctx.shadowColor = "#9B1B30";
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 6);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    };

    /**
     * Select the appropriate dog sprite frame for the current action.
     * Each branch clamps via `frameIndex()` so invalid config values never crash.
     */
    const selectFrame = (game: GameData): number => {
      if (game.playerAction === "sliding") {
        // Crouch/slide pose — use DOG_CROUCH_FRAME (default: frame 1)
        return frameIndex(DOG_CROUCH_FRAME);
      }
      if (game.playerAction === "jumping") {
        // Airborne pose — use DOG_JUMP_FRAME (default: frame 3 / mid-stretch)
        return frameIndex(DOG_JUMP_FRAME);
      }
      // Running animation — cycle through all frames
      return Math.floor(game.frame / DOG_ANIM_INTERVAL) % DOG_FRAMES;
    };

    const drawPlayer = (
      ctx: CanvasRenderingContext2D,
      game: GameData,
      frames: HTMLImageElement[],
      loaded: boolean[],
    ) => {
      const px = game.playerLane * LANE_W + LANE_W / 2;
      const py = CANVAS_H - DOG_GROUND_OFFSET;
      const dw = DOG_DISPLAY_W;
      const dh = DOG_DISPLAY_H;
      let dy = py - dh / 2;

      if (game.playerAction === "jumping") {
        dy -= getJumpOffset(game.actionTimer);
      } else if (game.playerAction === "sliding") {
        dy += SLIDE_DRAW_Y_OFFSET;
      }

      const frameIdx = selectFrame(game);

      // Per-frame loaded check: render sprite only when that specific image succeeded
      const frameOk = frames[frameIdx] && loaded[frameIdx];
      if (frameOk) {
        // drawImage preserves the underlying 1:1 source aspect ratio because
        // DOG_DISPLAY_W === DOG_DISPLAY_H === 48 (matching DOG_FRAME_W === DOG_FRAME_H)
        ctx.drawImage(frames[frameIdx], px - dw / 2, dy, dw, dh);
      } else {
        // Fallback heart when this specific frame isn't ready
        ctx.shadowColor = "#D4A5A5";
        ctx.shadowBlur = 20;
        ctx.fillStyle = "#D4A5A5";
        const hs = 15;
        ctx.beginPath();
        ctx.moveTo(px, dy + hs * 0.7);
        ctx.bezierCurveTo(
          px + hs * 0.8,
          dy - hs * 0.2,
          px + hs * 1.2,
          dy + hs * 0.6,
          px,
          dy + hs * 0.9,
        );
        ctx.bezierCurveTo(
          px - hs * 1.2,
          dy + hs * 0.6,
          px - hs * 0.8,
          dy - hs * 0.2,
          px,
          dy + hs * 0.7,
        );
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };

    const drawHUD = (ctx: CanvasRenderingContext2D, game: GameData) => {
      ctx.fillStyle = "#FFFDD0";
      ctx.font = '18px "Cormorant Garamond", Georgia, serif';
      ctx.textAlign = "left";
      ctx.fillText(`♥ ${game.score}`, 10, 25);

      ctx.fillStyle = "#C9B99A";
      ctx.font = '12px "Inter", sans-serif';
      ctx.textAlign = "right";
      ctx.fillText(
        tpl(content.gameLaneRunner.canvasBestTemplate, {
          best: highScoreRef.current,
        }),
        CANVAS_W - 10,
        20,
      );
    };

    const drawOverlays = (
      ctx: CanvasRenderingContext2D,
      game: GameData,
      frames: HTMLImageElement[],
      loaded: boolean[],
    ) => {
      // Idle overlay — draw start instructions including jump/slide hints
      if (!game.started && !game.gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.fillStyle = "#C9B99A";
        ctx.font = '18px "Cormorant Garamond", Georgia, serif';
        ctx.textAlign = "center";
        ctx.fillText(
          content.gameLaneRunner.canvasStart,
          CANVAS_W / 2,
          CANVAS_H / 2 - 50,
        );

        // Jump / slide hints below the start text
        ctx.fillStyle = "#D4A5A5";
        ctx.font = '13px "Inter", sans-serif';
        ctx.fillText(
          content.gameLaneRunner.canvasJumpHint,
          CANVAS_W / 2,
          CANVAS_H / 2 - 24,
        );
        ctx.fillText(
          content.gameLaneRunner.canvasSlideHint,
          CANVAS_W / 2,
          CANVAS_H / 2 - 8,
        );

        // Dog preview
        const previewIdx = frameIndex(DOG_CROUCH_FRAME);
        if (frames[previewIdx] && loaded[previewIdx]) {
          ctx.drawImage(
            frames[previewIdx],
            CANVAS_W / 2 - DOG_DISPLAY_W / 2,
            CANVAS_H / 2 + 10,
            DOG_DISPLAY_W,
            DOG_DISPLAY_H,
          );
        } else {
          ctx.fillStyle = "#C9B99A";
          ctx.font = '18px "Cormorant Garamond", Georgia, serif';
          ctx.fillText("♥", CANVAS_W / 2, CANVAS_H / 2 + 50);
        }
      }

      // Pause overlay
      if (game.paused && !game.gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.fillStyle = "#FFFDD0";
        ctx.font = '32px "Cormorant Garamond", Georgia, serif';
        ctx.textAlign = "center";
        ctx.fillText(
          content.gameLaneRunner.canvasPaused,
          CANVAS_W / 2,
          CANVAS_H / 2 - 10,
        );
        ctx.fillStyle = "#C9B99A";
        ctx.font = '14px "Inter", sans-serif';
        ctx.fillText(
          content.gameLaneRunner.canvasResumeHint,
          CANVAS_W / 2,
          CANVAS_H / 2 + 30,
        );
      }

      // Game over overlay
      if (game.gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.fillStyle = "#FFFDD0";
        ctx.font = '32px "Cormorant Garamond", Georgia, serif';
        ctx.textAlign = "center";
        ctx.fillText(
          content.gameLaneRunner.canvasGameOver,
          CANVAS_W / 2,
          CANVAS_H / 2 - 30,
        );
        ctx.fillStyle = "#D4A5A5";
        ctx.font = '20px "Cormorant Garamond", Georgia, serif';
        ctx.fillText(
          tpl(content.gameLaneRunner.canvasScoreTemplate, {
            score: game.score,
          }),
          CANVAS_W / 2,
          CANVAS_H / 2 + 20,
        );
        ctx.fillStyle = "#C9B99A";
        ctx.font = '14px "Inter", sans-serif';
        ctx.fillText(
          content.gameLaneRunner.canvasRestart,
          CANVAS_W / 2,
          CANVAS_H / 2 + 60,
        );
      }
    };

    // ── Main loop ──

    const loop = () => {
      const game = gameRef.current;
      if (!game) {
        animRef.current = requestAnimationFrame(loop);
        return;
      }

      update(game);

      drawBackground(ctx);
      drawLaneLines(ctx);
      drawGround(ctx);
      drawObstacles(ctx, game.obstacles);
      drawPlayer(ctx, game, dogFramesRef.current, dogLoadedRef.current);
      drawHUD(ctx, game);
      drawOverlays(ctx, game, dogFramesRef.current, dogLoadedRef.current);

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [initGame]);

  return (
    <div className="game-container">
      <div className="game-container__header">
        <button
          className="game-container__back"
          onClick={onBack}
          aria-label={content.gameLaneRunner.backLabel}
        >
          ← {content.games.backText}
        </button>
        <h3 className="game-container__title">
          {content.gameLaneRunner.title}
        </h3>
      </div>

      <div
        className="game-container__canvas-wrap"
        role="application"
        aria-label={content.gameLaneRunner.ariaLabel}
        tabIndex={0}
        {...swipeProps}
      >
        <canvas ref={canvasRef} className="game-container__canvas" />
      </div>

      <div className="game-container__controls">
        <button
          className="game-container__ctrl-btn"
          onClick={() => handleInput("left")}
          aria-label={content.gameLaneRunner.moveLeft}
        >
          ←
        </button>
        <button
          className="game-container__ctrl-btn"
          onClick={() => handleInput("up")}
          aria-label={content.gameLaneRunner.moveUp}
        >
          ↑
        </button>
        <button
          className="game-container__ctrl-btn"
          onClick={togglePause}
          aria-label={content.gameLaneRunner.canvasPaused}
        >
          ⏸
        </button>
        <span className="game-container__ctrl-hint">
          {content.gameLaneRunner.controlsHint}
        </span>
        <button
          className="game-container__ctrl-btn"
          onClick={() => handleInput("down")}
          aria-label={content.gameLaneRunner.moveDown}
        >
          ↓
        </button>
        <button
          className="game-container__ctrl-btn"
          onClick={() => handleInput("right")}
          aria-label={content.gameLaneRunner.moveRight}
        >
          →
        </button>
      </div>

      <p className="game-container__hint">
        {gameState === "idle" && content.gameLaneRunner.hint}
        {gameState === "over" &&
          tpl(content.gameLaneRunner.canvasScoreTemplate, {
            score: displayScore,
          })}
      </p>
    </div>
  );
}
