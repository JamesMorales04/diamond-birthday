/**
 * Shared test helpers for canvas-based mini-game tests (GameFlappy, GameLaneRunner).
 *
 * Provides mocked CanvasRenderingContext2D, controllable requestAnimationFrame,
 * Image stub, and matchMedia stub — all resettable between tests.
 *
 * Usage in a test file:
 * ```
 * import {
 *   createMockCtx,            // low-level: build a mock CanvasRenderingContext2D
 *   installCanvasMock,        // spy on HTMLCanvasElement.getContext
 *   getMockCtx,               // retrieve the mock context after installCanvasMock+render
 *   installRafMock, tickMany, // controllable requestAnimationFrame
 *   installImageMock,
 *   imageInstances,           // captured new Image() instances
 *   loadAllImages,            // trigger onload on every captured image
 *   stubMatchMedia,
 * } from '../test/gameTestHelpers';
 * ```
 */

import { vi } from 'vitest';

/* ── Mock CanvasRenderingContext2D ───────────────────── */

/**
 * Build a mock CanvasRenderingContext2D that never throws.
 * Every method is a vi.fn() so callers can assert on calls if needed.
 * Includes every property/method used by GameFlappy and GameLaneRunner.
 */
export function createMockCtx(): CanvasRenderingContext2D {
  const ctx = {
    canvas: {} as HTMLCanvasElement,
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    closePath: vi.fn(),
    roundRect: vi.fn(),
    setLineDash: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    measureText: vi.fn(() => ({ width: 10 })),
    getImageData: vi.fn(() => ({ data: [], width: 0, height: 0 })),
    putImageData: vi.fn(),
    createPattern: vi.fn(() => ({})),
    isPointInPath: vi.fn(() => false),
    isPointInStroke: vi.fn(() => false),
    clip: vi.fn(),
    strokeRect: vi.fn(),
    resetTransform: vi.fn(),
    reset: vi.fn(),
    setTransform: vi.fn(),
    transform: vi.fn(),
    quadraticCurveTo: vi.fn(),
    ellipse: vi.fn(),
    rect: vi.fn(),

    // Canvas state properties
    fillStyle: '',
    font: '',
    textAlign: 'left' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
    strokeStyle: '',
    lineWidth: 1,
    lineCap: 'butt' as CanvasLineCap,
    lineJoin: 'miter' as CanvasLineJoin,
    miterLimit: 10,
    shadowColor: '',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    globalAlpha: 1,
    globalCompositeOperation: 'source-over' as GlobalCompositeOperation,
    direction: 'ltr' as CanvasDirection,
    filter: 'none',
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'low' as ImageSmoothingQuality,
    getContextAttributes: vi.fn(() => ({})),
  } as unknown as CanvasRenderingContext2D;
  return ctx;
}

/* ── Mock requestAnimationFrame ──────────────────────── */

export let rafCallbacks: Map<number, FrameRequestCallback>;
export let nextRafId: number;
export let frameTimestamp: number;

/**
 * Replace `window.requestAnimationFrame` / `cancelAnimationFrame` with
 * a controllable driver that simulates wall-clock time progression.
 *
 * `tick()` advances exactly one frame (~16.67 ms); `tickMany(n)` advances `n`
 * frames. Each tick passes a monotonically increasing timestamp so the
 * component's dt-based physics work correctly.
 */
export function installRafMock() {
  rafCallbacks = new Map();
  nextRafId = 0;
  frameTimestamp = 0;

  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(
    (cb: FrameRequestCallback) => {
      const id = ++nextRafId;
      rafCallbacks.set(id, cb);
      return id;
    },
  );
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id: number) => {
    rafCallbacks.delete(id);
  });
}

/** Advance exactly one animation frame with a ~60 fps timestamp step. */
function tick() {
  frameTimestamp += 1000 / 60; // ~16.67 ms per frame
  const ids = [...rafCallbacks.keys()];
  for (const id of ids) {
    const cb = rafCallbacks.get(id);
    if (cb) {
      rafCallbacks.delete(id);
      cb(frameTimestamp);
    }
  }
}

export function tickMany(n: number) {
  for (let i = 0; i < n; i++) {
    tick();
  }
}

/* ── Mock Image ──────────────────────────────────────── */

export interface MockImageInstance {
  onload: (() => void) | null;
  onerror: (() => void) | null;
  src: string;
}

/**
 * Capture all `new Image()` calls so tests can trigger onload/onerror.
 * Reset automatically by `installImageMock()` before each usage.
 *
 * Note: this binding is re-assigned (not mutated in place) on each reset,
 * so holding a stale reference across resets will yield an empty array.
 */
export let imageInstances: MockImageInstance[] = [];

export function installImageMock() {
  imageInstances = [];
  const MockImage = vi.fn().mockImplementation(function () {
    const self: MockImageInstance = {
      onload: null,
      onerror: null,
      src: '',
    };
    imageInstances.push(self);
    return self;
  });
  vi.stubGlobal('Image', MockImage);
}

/* ── Mock matchMedia ─────────────────────────────────── */

/**
 * Stub `window.matchMedia` to return the given `matches` value for all queries.
 * Used by `useReducedMotion` to simulate `(prefers-reduced-motion: reduce)`.
 */
export function stubMatchMedia(matches = false) {
  window.matchMedia = vi.fn().mockImplementation(
    (query: string) =>
      ({
        matches,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList,
  );
}

/* ── Convenience wrappers ────────────────────────────── */

/**
 * Spy on `HTMLCanvasElement.prototype.getContext` and return a mock
 * `CanvasRenderingContext2D` that never throws.  Must be called in a
 * `beforeEach` (or test body) before the component renders.
 *
 * Replaces the manual `vi.spyOn(HTMLCanvasElement.prototype, "getContext")`
 * + `mockReturnValue(createMockCtx())` pattern.
 */
export function installCanvasMock() {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    createMockCtx(),
  );
}

/**
 * Retrieve the mock `CanvasRenderingContext2D` from the first call to
 * `getContext`.  Requires that `installCanvasMock()` was called and that
 * a `<canvas>` has been rendered.
 *
 * The return type is intentionally loose (`any`) so callers can access
 * `mockClear()` and other `vi.fn()` members on the context's methods
 * without additional casting.
 */
export function getMockCtx(): any {
  return (
    HTMLCanvasElement.prototype.getContext as unknown as ReturnType<
      typeof vi.fn
    >
  ).mock.results[0].value;
}

/**
 * Trigger the `onload` callback on every `Image` instance captured so far
 * by `installImageMock()`.  This is equivalent to iterating `imageInstances`
 * and calling `img.onload?.()`.  Useful for simulating successful sprite
 * loading in one line.
 */
export function loadAllImages() {
  for (const img of imageInstances) {
    img.onload?.();
  }
}
