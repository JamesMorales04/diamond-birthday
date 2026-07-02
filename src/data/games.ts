/**
 * Game runtime configuration derived from the canonical game registry.
 *
 * All game IDs and their presence are governed by `gameRegistry.ts` —
 * adding a new game means adding its ID there, then defining its
 * settings interface and default value here.
 */

import type { GameId } from "./gameRegistry";

// ─── Per-game settings interfaces ────────────────────────────────────

export interface FlappySettings {
  gravity: number;
  jumpForce: number;
  pipeSpeed: number;
  pipeGap: number;
  pipeFrequency: number;
}

export interface LaneRunnerSettings {
  baseSpeed: number;
  speedIncrement: number;
  obstacleFrequency: number;
}

export interface MemoryMatchSettings {
  gridSize: number; // 4 = 4×4 grid (8 pairs)
  flipDelay: number;
}

// ─── Settings map keyed by canonical GameId ──────────────────────────

/**
 * Per-game settings derived from the `GameId` union.
 * Adding a new game ID to `gameRegistry.ts` requires an entry here
 * (the `never` branch will produce a type error at `gameSettings`).
 */
export type GameSettings = {
  [K in GameId]: K extends "flappy"
    ? FlappySettings
    : K extends "lane-runner"
      ? LaneRunnerSettings
      : K extends "memory"
        ? MemoryMatchSettings
        : never;
};

export const gameSettings: GameSettings = {
  flappy: {
    gravity: 0.5,
    jumpForce: -8,
    pipeSpeed: 3,
    pipeGap: 150,
    pipeFrequency: 90,
  },
  "lane-runner": {
    baseSpeed: 2,
    speedIncrement: 0.15,
    obstacleFrequency: 60,
  },
  memory: {
    gridSize: 4,
    flipDelay: 600,
  },
};

// ─── High scores derived from GameId ─────────────────────────────────

/**
 * Per-game high-score record.
 *
 * Score semantics per game:
 * - `flappy`       — number of pipes successfully passed (1 per pipe).
 * - `lane-runner`  — total points = passive score increment (+1 per tick)
 *                    + obstacle passes (+2 each). Higher is better.
 * - `memory`       — time bonus = `max(0, 60 − moves)` where `moves` is
 *                    the number of card flips to match all pairs. Fewer
 *                    moves yields a higher bonus (max 60).
 */
export type GameHighScore = Record<GameId, number>;

export const defaultHighScores: GameHighScore = {
  flappy: 0,
  "lane-runner": 0,
  memory: 0,
};

export const GAME_STORAGE_KEY = "diamond-birthday-games";
