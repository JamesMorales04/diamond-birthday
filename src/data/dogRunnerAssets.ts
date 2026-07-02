/**
 * Dog runner sprite asset metadata.
 *
 * Source: public/assets/games/runner/dog-runner-source.png
 *   - White RGB background, 4 horizontal frames
 *   - Each frame: 64×64 px
 *   - Total source: 256×64 px
 *
 * Frame order (left→right, 1-indexed):
 *   1 — neutral/standing (legs together)            → used for slide/crouch
 *   2 — right-forward stride
 *   3 — mid-stretch (legs apart)                     → used for jump
 *   4 — left-forward stride
 *
 * Runtime-ready frames (RGBA, white→transparent):
 *   /assets/games/runner/dog/dog-frame-{1..4}.png
 *
 * Frame selection at runtime:
 *   - running: frame cycles 1-4 at DOG_ANIM_INTERVAL
 *   - jumping: always frame 3 (mid-stretch / airborne)
 *   - sliding: always frame 1 (crouched / compact)
 *
 * Usage: import { assetUrl } from '../utils/assets';
 *   const frame = assetUrl(DOG_FRAME_PATH(1));
 */

/** Individual frame asset path template (pass 1-4) */
export const DOG_FRAME_PATH = (n: number) =>
  `/assets/games/runner/dog/dog-frame-${n}.png`;

export const DOG_FRAME_W = 64;
export const DOG_FRAME_H = 64;
export const DOG_FRAMES = 4;

/** Canvas-space display size (width, height) – preserves 1:1 source aspect ratio */
export const DOG_DISPLAY_W = 48;
export const DOG_DISPLAY_H = 48;

/**
 * Collision box relative to top-left of displayed sprite (px in canvas coords).
 *
 * Sprite centre at (px, py); sprite top-left = (px - DOG_DISPLAY_W/2, py - DOG_DISPLAY_H/2).
 * Offsets are added to that top-left to define the tight collision rect.
 *
 * Current values define a 28×32 box approximately centred on the dog body:
 *   left   = px - 24 + 10 = px - 14
 *   right  = px - 14 + 28 = px + 14
 *   top    = py - 24 + 8  = py - 16
 *   bottom = py - 16 + 32 = py + 16
 */
export const DOG_COLLISION_OFFSET_X = 10;
export const DOG_COLLISION_OFFSET_Y = 8;
export const DOG_COLLISION_W = 28;
export const DOG_COLLISION_H = 32;

/** Vertical offset from canvas bottom to the dog's standing ground position */
export const DOG_GROUND_OFFSET = 56;

/** Running-animation frame interval (lower = faster) */
export const DOG_ANIM_INTERVAL = 9;

/**
 * 1-based frame index used for the slide/crouch pose.
 * Falls back to 0 (first frame) if out of range.
 */
export const DOG_CROUCH_FRAME = 1;

/**
 * 1-based frame index used for the jump pose (mid-stretch, airborne).
 * Falls back to 2 if out of range.
 */
export const DOG_JUMP_FRAME = 3;
