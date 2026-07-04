/**
 * Single authoritative registry for mini-game identities.
 *
 * - `GAME_IDS` is the const array that defines every valid game ID (kebab-case,
 *   matching the IDs used in `page.json`).
 * - `GameId` is the derived union type used throughout the codebase.
 * - `GAME_ICONS` maps each game ID to its presentation icon.
 *
 * Adding or removing a game starts here — the rest of the codebase
 * derives its types and data from this registry.
 */

export const GAME_IDS = ['flappy', 'lane-runner', 'memory'] as const;
export type GameId = (typeof GAME_IDS)[number];

/** Presentation-only icons — kept here, not in content data. */
export const GAME_ICONS: Record<GameId, string> = {
  flappy: '♥',
  'lane-runner': '◆',
  memory: '♡',
};
