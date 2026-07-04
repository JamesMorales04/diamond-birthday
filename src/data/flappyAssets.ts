/**
 * Chester beagle sprite asset metadata for the Flappy Bird-style game.
 *
 * ── Sprite state mapping ─────────────────────────────────
 *   up/rising     → chester3.png   (vy < -1, or flap pulse active)
 *   mid/gliding   → chester2.png   (-1 ≤ vy ≤ 1, no pulse)
 *   down/falling  → chester1.png   (vy > 1)
 *
 * ── Source assets ────────────────────────────────────────
 *   public/photos/assets/flappy/chester{1,2,3}.png  (120×120 px RGBA, retina-friendly 3× display size)
 *
 * This is the single place to adjust sprite paths, display size,
 * collision hitbox, rotation feel, and animation timing.
 */

// ─── Sprite mapping (explicit, easy to edit) ─────────────

/**
 * Per-state frame metadata. The `index` aligns with the 0-based
 * `chesterFramesRef` array in the component. Adding/removing a
 * state here means also updating the loader loop in GameFlappy.
 */
export const FLAPPY_SPRITE_MAP = {
  up: { path: '/photos/assets/flappy/chester3.png', index: 2, label: 'rising' },
  mid: {
    path: '/photos/assets/flappy/chester2.png',
    index: 1,
    label: 'gliding',
  },
  down: {
    path: '/photos/assets/flappy/chester1.png',
    index: 0,
    label: 'falling',
  },
} as const;

export type FlappySpriteState = keyof typeof FLAPPY_SPRITE_MAP;

/** Frame path template — used by the bulk loader in GameFlappy */
export const FLAPPY_FRAME_PATH = (n: number) =>
  `/photos/assets/flappy/chester${n}.png`;

/** Background image path (UK flag texture) — used by the GameFlappy canvas renderer */
export const FLAPPY_BG_PATH = '/photos/assets/flappy/uk.png';

/** Obstacle (pipe) image path — used instead of solid-colour pipe segments */
export const FLAPPY_OBSTACLE_PATH = '/photos/assets/flappy/pipes.png';

/**
 * Visible non-transparent bounds of pipes.png.
 * The image has large transparent margins, so we crop to the sprite itself
 * before drawing it into the game pipes.
 */
export const FLAPPY_OBSTACLE_SRC_X = 443;
export const FLAPPY_OBSTACLE_SRC_Y = 63;
export const FLAPPY_OBSTACLE_SRC_W = 200;
export const FLAPPY_OBSTACLE_SRC_H = 1316;

export const FLAPPY_FRAMES = 3;

// ─── Display size ────────────────────────────────────────

export const FLAPPY_DISPLAY_W = 48;
export const FLAPPY_DISPLAY_H = 44;

// ─── Collision / hitbox (per-edge insets) ────────────────

/**
 * Per-edge insets (px) from the sprite display bounds to the collision box.
 * Chester has transparent padding around his body; these values tighten the
 * hitbox to match his visible silhouette. Asymmetric values let us account
 * for the pose's centre-of-mass offset without a separate shift constant.
 */
export const COLLISION_LEFT_INSET = 10;
export const COLLISION_RIGHT_INSET = 10;
export const COLLISION_TOP_INSET = 7; // less padding at the head
export const COLLISION_BOTTOM_INSET = 9; // more padding at the base

/** Derived collision half-dimensions (convenience for simple checks). */
export const COLLISION_HALF_W =
  (FLAPPY_DISPLAY_W - COLLISION_LEFT_INSET - COLLISION_RIGHT_INSET) / 2;
export const COLLISION_HALF_H =
  (FLAPPY_DISPLAY_H - COLLISION_TOP_INSET - COLLISION_BOTTOM_INSET) / 2;

/**
 * Pure helper — compute the collision rectangle for a bird at (x, y).
 * Returns the four edges in canvas coordinates.
 */
export function getFlappyHitbox(
  x: number,
  y: number,
): { left: number; right: number; top: number; bottom: number } {
  return {
    left: x - FLAPPY_DISPLAY_W / 2 + COLLISION_LEFT_INSET,
    right: x + FLAPPY_DISPLAY_W / 2 - COLLISION_RIGHT_INSET,
    top: y - FLAPPY_DISPLAY_H / 2 + COLLISION_TOP_INSET,
    bottom: y + FLAPPY_DISPLAY_H / 2 - COLLISION_BOTTOM_INSET,
  };
}

// ─── Rotation ────────────────────────────────────────────

/** Max sprite tilt (radians) at peak vertical velocity. */
export const MAX_ROTATION = 0.4;

/** Velocity magnitude at which full tilt is reached. */
export const ROTATION_VELOCITY_CAP = 10;

// ─── Flap-pulse timing ───────────────────────────────────

/** How many seconds the "up" sprite persists after a flap, for visual feedback. */
export const FLAP_PULSE_DURATION = 0.12;

// ─── Frame selection (pure) ──────────────────────────────

/**
 * Select the sprite state based on vertical velocity and an optional
 * flap-pulse timer. The pulse briefly forces the "up" frame so the
 * player gets immediate visual feedback that the tap was registered.
 */
export function selectFlappyFrame(
  vy: number,
  flapTimer: number = 0,
): FlappySpriteState {
  if (flapTimer > 0) return 'up';
  if (vy < -1) return 'up';
  if (vy > 1) return 'down';
  return 'mid';
}
