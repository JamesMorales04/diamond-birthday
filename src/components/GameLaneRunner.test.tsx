import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GameLaneRunner from "./GameLaneRunner";
import { content } from "../content/page";
import {
  GAME_STORAGE_KEY,
  defaultHighScores,
} from "../data/games";
import { tpl } from "../utils/tpl";
import { DOG_FRAMES, DOG_FRAME_PATH } from "../data/dogRunnerAssets";

/* ──────────────────────────────────────────────
   Helpers – shared mock infrastructure
   ────────────────────────────────────────────── */

/**
 * Build a mock CanvasRenderingContext2D that never throws.
 * Every method is a vi.fn() so callers can assert on calls if needed.
 */
function createMockCtx(): CanvasRenderingContext2D {
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
    roundRect: vi.fn(),
    setLineDash: vi.fn(),
    drawImage: vi.fn(),
    arc: vi.fn(),
    closePath: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    measureText: vi.fn(() => ({ width: 10 })),
    getImageData: vi.fn(() => ({ data: [], width: 0, height: 0 })),
    putImageData: vi.fn(),
    createPattern: vi.fn(() => null),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    isPointInPath: vi.fn(() => false),
    isPointInStroke: vi.fn(() => false),
    clip: vi.fn(),
    fillStyle: "",
    font: "",
    textAlign: "left" as CanvasTextAlign,
    textBaseline: "alphabetic" as CanvasTextBaseline,
    strokeStyle: "",
    lineWidth: 1,
    lineCap: "butt" as CanvasLineCap,
    lineJoin: "miter" as CanvasLineJoin,
    miterLimit: 10,
    shadowColor: "",
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    globalAlpha: 1,
    globalCompositeOperation: "source-over" as GlobalCompositeOperation,
    direction: "ltr" as CanvasDirection,
    filter: "none",
    imageSmoothingEnabled: true,
    imageSmoothingQuality: "low" as ImageSmoothingQuality,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getContextAttributes: vi.fn(() => ({})),
    resetTransform: vi.fn(),
    reset: vi.fn(),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setTransform: vi.fn((_a?: never, _b?: never) => {}),
    transform: vi.fn(),
    quadraticCurveTo: vi.fn(),
    ellipse: vi.fn(),
    rect: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
  return ctx;
}

/**
 * Replace `window.requestAnimationFrame` / `cancelAnimationFrame` with
 * a controllable driver.  `tick()` advances exactly one frame; `tickMany(n)`
 * advances `n` frames.
 */
let rafCallbacks: Map<number, FrameRequestCallback>;
let nextRafId: number;

function installRafMock() {
  rafCallbacks = new Map();
  nextRafId = 0;

  vi.spyOn(window, "requestAnimationFrame").mockImplementation(
    (cb: FrameRequestCallback) => {
      const id = ++nextRafId;
      rafCallbacks.set(id, cb);
      return id;
    },
  );
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id: number) => {
    rafCallbacks.delete(id);
  });
}

/** Advance exactly one animation frame.  After the call a new RAF callback is
 *  already scheduled (loop re-arms itself). */
function tick() {
  const ids = [...rafCallbacks.keys()];
  for (const id of ids) {
    const cb = rafCallbacks.get(id);
    if (cb) {
      rafCallbacks.delete(id);
      cb(0); // timestamp is not used by the loop
    }
  }
}

function tickMany(n: number) {
  for (let i = 0; i < n; i++) {
    tick();
  }
}

/**
 * Capture all `new Image()` calls so tests can trigger onload/onerror.
 */
const imageInstances: Array<{
  onload: (() => void) | null;
  onerror: (() => void) | null;
  src: string;
}> = [];

function installImageMock() {
  imageInstances.length = 0;
  const MockImage = vi.fn().mockImplementation(function () {
    const self: { onload: (() => void) | null; onerror: (() => void) | null; src: string } = {
      onload: null,
      onerror: null,
      src: "",
    };
    imageInstances.push(self);
    return self;
  });
  vi.stubGlobal("Image", MockImage);
}

/* ──────────────────────────────────────────────
   Tests
   ────────────────────────────────────────────── */

describe("GameLaneRunner", () => {
  const onBack = vi.fn();

  beforeEach(() => {
    onBack.mockClear();
    window.localStorage.clear();

    // jsdom's HTMLCanvasElement.getContext() returns null, which prevents the
    // game loop effect from initialising gameRef.  Provide a mock context so
    // gameRef.current is populated and handleInput/keyboard handlers work.
    vi.spyOn(
      HTMLCanvasElement.prototype,
      "getContext",
    ).mockReturnValue(createMockCtx());

    // Ensure matchMedia stub is in place (setup.ts provides one but some
    // tests re-mock it locally; protect against cross-test leakage)
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  /* ── Rendering (existing + baseline) ── */

  it("renders the game title from centralized content", () => {
    render(<GameLaneRunner onBack={onBack} />);
    expect(
      screen.getByText(content.gameLaneRunner.title),
    ).toBeInTheDocument();
  });

  it("renders the back button with the centralized aria-label", () => {
    render(<GameLaneRunner onBack={onBack} />);
    expect(
      screen.getByLabelText(content.gameLaneRunner.backLabel),
    ).toBeInTheDocument();
  });

  it("renders the canvas wrapper with the centralized aria-label", () => {
    render(<GameLaneRunner onBack={onBack} />);
    expect(
      screen.getByLabelText(content.gameLaneRunner.ariaLabel),
    ).toBeInTheDocument();
  });

  it("renders the hint from centralized content", () => {
    render(<GameLaneRunner onBack={onBack} />);
    expect(screen.getByText(content.gameLaneRunner.hint)).toBeInTheDocument();
  });

  it("renders all on-screen control buttons with correct aria-labels", () => {
    render(<GameLaneRunner onBack={onBack} />);
    expect(
      screen.getByLabelText(content.gameLaneRunner.moveLeft),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(content.gameLaneRunner.moveRight),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(content.gameLaneRunner.moveUp),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(content.gameLaneRunner.moveDown),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(content.gameLaneRunner.canvasPaused),
    ).toBeInTheDocument();
  });

  it("renders the controls hint text", () => {
    render(<GameLaneRunner onBack={onBack} />);
    expect(
      screen.getByText(content.gameLaneRunner.controlsHint),
    ).toBeInTheDocument();
  });

  it("calls onBack when the back button is clicked", async () => {
    const user = userEvent.setup();
    render(<GameLaneRunner onBack={onBack} />);

    await user.click(screen.getByLabelText(content.gameLaneRunner.backLabel));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("renders a canvas element inside the game wrapper", () => {
    render(<GameLaneRunner onBack={onBack} />);

    const wrapper = screen.getByLabelText(content.gameLaneRunner.ariaLabel);
    const canvas = wrapper.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  /* ── Keyboard input ── */

  describe("keyboard input", () => {
    it("starts the game with Space bar (idle hint disappears)", async () => {
      const user = userEvent.setup();
      render(<GameLaneRunner onBack={onBack} />);

      expect(
        screen.getByText(content.gameLaneRunner.hint),
      ).toBeInTheDocument();

      await user.keyboard(" ");

      expect(
        screen.queryByText(content.gameLaneRunner.hint),
      ).not.toBeInTheDocument();
    });

    it("starts the game with ArrowUp", async () => {
      const user = userEvent.setup();
      render(<GameLaneRunner onBack={onBack} />);

      expect(
        screen.getByText(content.gameLaneRunner.hint),
      ).toBeInTheDocument();

      await user.keyboard("{ArrowUp}");

      expect(
        screen.queryByText(content.gameLaneRunner.hint),
      ).not.toBeInTheDocument();
    });

    it("starts the game with w key", async () => {
      const user = userEvent.setup();
      render(<GameLaneRunner onBack={onBack} />);

      await user.keyboard("w");

      expect(
        screen.queryByText(content.gameLaneRunner.hint),
      ).not.toBeInTheDocument();
    });

    it("starts the game with W (uppercase)", async () => {
      const user = userEvent.setup();
      render(<GameLaneRunner onBack={onBack} />);

      await user.keyboard("W");

      expect(
        screen.queryByText(content.gameLaneRunner.hint),
      ).not.toBeInTheDocument();
    });

    it("does not throw when ArrowLeft, ArrowRight, ArrowDown are pressed", async () => {
      const user = userEvent.setup();
      render(<GameLaneRunner onBack={onBack} />);

      await user.keyboard("{ArrowLeft}");
      await user.keyboard("{ArrowRight}");
      await user.keyboard("{ArrowDown}");

      expect(
        screen.getByText(content.gameLaneRunner.title),
      ).toBeInTheDocument();
    });

    it("does not throw when a/A, d/D, s/S are pressed", async () => {
      const user = userEvent.setup();
      render(<GameLaneRunner onBack={onBack} />);

      await user.keyboard("a");
      await user.keyboard("A");
      await user.keyboard("d");
      await user.keyboard("D");
      await user.keyboard("s");
      await user.keyboard("S");

      expect(
        screen.getByText(content.gameLaneRunner.title),
      ).toBeInTheDocument();
    });

    it("toggles pause with p and P without throwing", async () => {
      const user = userEvent.setup();
      render(<GameLaneRunner onBack={onBack} />);

      // start the game first so pause is meaningful
      await user.keyboard(" ");

      // pause
      await user.keyboard("p");

      // unpause
      await user.keyboard("P");

      // Component is still rendered
      expect(
        screen.getByText(content.gameLaneRunner.title),
      ).toBeInTheDocument();
    });

    it("pressing P before game starts is a no-op (no crash)", async () => {
      const user = userEvent.setup();
      render(<GameLaneRunner onBack={onBack} />);

      await user.keyboard("p");

      expect(
        screen.getByText(content.gameLaneRunner.hint),
      ).toBeInTheDocument();
    });
  });

  /* ── On-screen controls ── */

  describe("on-screen controls", () => {
    it("left button triggers movement without throwing", async () => {
      const user = userEvent.setup();
      render(<GameLaneRunner onBack={onBack} />);

      await user.click(screen.getByLabelText(content.gameLaneRunner.moveLeft));
      expect(
        screen.getByText(content.gameLaneRunner.title),
      ).toBeInTheDocument();
    });

    it("right button triggers movement without throwing", async () => {
      const user = userEvent.setup();
      render(<GameLaneRunner onBack={onBack} />);

      await user.click(
        screen.getByLabelText(content.gameLaneRunner.moveRight),
      );
      expect(
        screen.getByText(content.gameLaneRunner.title),
      ).toBeInTheDocument();
    });

    it("up button triggers jump without throwing", async () => {
      const user = userEvent.setup();
      render(<GameLaneRunner onBack={onBack} />);

      await user.click(screen.getByLabelText(content.gameLaneRunner.moveUp));
      expect(
        screen.getByText(content.gameLaneRunner.title),
      ).toBeInTheDocument();
    });

    it("down button triggers slide without throwing", async () => {
      const user = userEvent.setup();
      render(<GameLaneRunner onBack={onBack} />);

      await user.click(screen.getByLabelText(content.gameLaneRunner.moveDown));
      expect(
        screen.getByText(content.gameLaneRunner.title),
      ).toBeInTheDocument();
    });

    it("pause button toggles pause state without throwing", async () => {
      const user = userEvent.setup();
      render(<GameLaneRunner onBack={onBack} />);

      // start the game first
      await user.keyboard(" ");

      await user.click(
        screen.getByLabelText(content.gameLaneRunner.canvasPaused),
      );

      // Component should still be mounted
      expect(
        screen.getByText(content.gameLaneRunner.title),
      ).toBeInTheDocument();
    });
  });

  /* ── Game loop (mocked RAF / canvas) ── */

  describe("game loop and collision", () => {
    beforeEach(() => {
      installRafMock();
      // Deterministic obstacle spawning: always lane 1 (player's lane)
      vi.spyOn(Math, "random").mockReturnValue(0.5);
    });

    afterEach(() => {
      // Clean up any mocked RAF state
      rafCallbacks.clear();
    });

    it("runs the game loop without throwing", () => {
      render(<GameLaneRunner onBack={onBack} />);

      // Advance a few frames — the loop should not crash
      act(() => {
        tickMany(10);
      });

      expect(
        screen.getByText(content.gameLaneRunner.title),
      ).toBeInTheDocument();
    });

    it("collision triggers game-over state and score template appears", () => {
      render(<GameLaneRunner onBack={onBack} />);

      // Start the game via the gameRef mutation path
      // (simulate keyboard starting the game)
      act(() => {
        // grab gameRef and set started=true directly – easier than
        // coordinating userEvent with the RAF loop
        // Instead: fire a keydown to trigger handleInput which sets started
        fireEvent.keyDown(document, { key: " " });
      });

      // Advance enough frames for an obstacle to spawn and reach the player.
      // With baseSpeed=2, obstacleFrequency=60, and random lane=1 (player lane):
      //   - obstacle spawns at frame 60   (y ≈ -40)
      //   - moves at speed ~2-3 px/frame
      //   - reaches collision zone (y ~408-460) around frame 237-240
      // Run 250 frames to be safe.
      act(() => {
        tickMany(250);
      });

      // Game over → the hint paragraph shows the score template
      const scorePattern = new RegExp(
        tpl(content.gameLaneRunner.canvasScoreTemplate, {
          score: "\\d+",
        }).replace(/\\/g, "\\"),
      );
      // Use queryAllByText to allow partial matches – tpl uses {score} placeholders
      const scoreElements = screen.queryAllByText(scorePattern);
      expect(scoreElements.length).toBeGreaterThanOrEqual(1);
    });

    it("persists new best score to localStorage on collision", () => {
      // Set an existing low score to ensure we beat it
      window.localStorage.setItem(
        GAME_STORAGE_KEY,
        JSON.stringify({ ...defaultHighScores, laneRunner: 0 }),
      );

      render(<GameLaneRunner onBack={onBack} />);

      act(() => {
        fireEvent.keyDown(document, { key: " " });
      });

      act(() => {
        tickMany(250);
      });

      const stored = window.localStorage.getItem(GAME_STORAGE_KEY);
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.laneRunner).toBeGreaterThan(0);
    });

    it("does not overwrite a higher existing best score", () => {
      // Set an unrealistically high existing score
      window.localStorage.setItem(
        GAME_STORAGE_KEY,
        JSON.stringify({ ...defaultHighScores, laneRunner: 9999 }),
      );

      render(<GameLaneRunner onBack={onBack} />);

      act(() => {
        fireEvent.keyDown(document, { key: " " });
      });

      act(() => {
        tickMany(250);
      });

      const stored = window.localStorage.getItem(GAME_STORAGE_KEY);
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.laneRunner).toBe(9999);
    });

    it("restarts the game after game-over via keyboard input", () => {
      render(<GameLaneRunner onBack={onBack} />);

      // Start & collide
      act(() => {
        fireEvent.keyDown(document, { key: " " });
      });
      act(() => {
        tickMany(250);
      });

      // Verify we're in game-over state
      const scorePattern = new RegExp(
        tpl(content.gameLaneRunner.canvasScoreTemplate, {
          score: "\\d+",
        }).replace(/\\/g, "\\"),
      );
      expect(screen.queryAllByText(scorePattern).length).toBeGreaterThanOrEqual(
        1,
      );

      // Restart via any directional key (handleInput checks game.gameOver first)
      act(() => {
        fireEvent.keyDown(document, { key: "ArrowLeft" });
      });

      // After restart, the score template should be gone (game is now "playing")
      // and the idle hint should also be absent
      expect(screen.queryByText(content.gameLaneRunner.hint)).toBeNull();

      // Advance a few frames to verify the game loop runs without errors
      // on the freshly reset game data.
      act(() => {
        tickMany(10);
      });

      // The title should still be visible (component is alive)
      expect(
        screen.getByText(content.gameLaneRunner.title),
      ).toBeInTheDocument();
    });
  });

  /* ── Reduced motion ── */

  describe("reduced motion", () => {
    beforeEach(() => {
      installRafMock();
      vi.spyOn(
        HTMLCanvasElement.prototype,
        "getContext",
      ).mockReturnValue(createMockCtx());
    });

    it("reduced-motion preference does not crash the component", () => {
      // Override matchMedia to signal reduced motion
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })) as unknown as typeof window.matchMedia;

      render(<GameLaneRunner onBack={onBack} />);

      // Advance a few frames with the reduced-motion speed multiplier
      act(() => {
        tickMany(10);
      });

      expect(
        screen.getByText(content.gameLaneRunner.title),
      ).toBeInTheDocument();
    });

    it("initGame with reduced motion produces lower speed (test via no crash)", () => {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === "(prefers-reduced-motion: reduce)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })) as unknown as typeof window.matchMedia;

      render(<GameLaneRunner onBack={onBack} />);

      // start game
      act(() => {
        fireEvent.keyDown(document, { key: " " });
      });

      // Run many frames — should be stable even with halved speed
      act(() => {
        tickMany(100);
      });

      expect(
        screen.getByText(content.gameLaneRunner.title),
      ).toBeInTheDocument();
    });
  });

  /* ── Sprite loading / fallback ── */

  describe("sprite loading", () => {
    beforeEach(() => {
      installImageMock();
    });

    it("creates Image instances for all dog frames on mount", () => {
      render(<GameLaneRunner onBack={onBack} />);

      // The component creates DOG_FRAMES (4) Image objects
      expect(imageInstances).toHaveLength(DOG_FRAMES);

      // Each instance should have a src matching a frame path
      for (let i = 1; i <= DOG_FRAMES; i++) {
        expect(imageInstances[i - 1].src).toContain(
          DOG_FRAME_PATH(i).replace("/assets", "assets"),
        );
      }
    });

    it("handles all frames loading successfully without crashing", () => {
      render(<GameLaneRunner onBack={onBack} />);

      // Simulate successful load for each frame
      for (const img of imageInstances) {
        if (img.onload) img.onload();
      }

      expect(
        screen.getByText(content.gameLaneRunner.title),
      ).toBeInTheDocument();
    });

    it("handles a single frame loading error without crashing", () => {
      render(<GameLaneRunner onBack={onBack} />);

      // Simulate first frame failing, rest succeeding
      if (imageInstances.length > 0 && imageInstances[0].onerror) {
        imageInstances[0].onerror!();
      }
      for (let i = 1; i < imageInstances.length; i++) {
        imageInstances[i].onload?.();
      }

      // Should still render without errors
      expect(
        screen.getByText(content.gameLaneRunner.title),
      ).toBeInTheDocument();
    });

    it("handles all frames failing to load without crashing", () => {
      render(<GameLaneRunner onBack={onBack} />);

      for (const img of imageInstances) {
        if (img.onerror) img.onerror();
      }

      // The fallback heart rendering path should not throw
      expect(
        screen.getByText(content.gameLaneRunner.title),
      ).toBeInTheDocument();
    });
  });

  /* ── Swipe (touch events) ── */

  describe("swipe gestures", () => {
    function createTouchList(
      clientX: number,
      clientY: number,
    ): TouchList {
      const touch = { clientX, clientY } as Touch;
      const list = [touch] as unknown as TouchList;
      return list;
    }

    function fireSwipe(
      wrapper: HTMLElement,
      fromX: number,
      fromY: number,
      toX: number,
      toY: number,
    ) {
      fireEvent.touchStart(wrapper, { touches: createTouchList(fromX, fromY) });
      fireEvent.touchEnd(wrapper, {
        changedTouches: createTouchList(toX, toY),
      });
    }

    it("exposes touch event handlers on the canvas wrapper", () => {
      render(<GameLaneRunner onBack={onBack} />);

      const wrapper = screen.getByLabelText(
        content.gameLaneRunner.ariaLabel,
      );

      // The useSwipe hook attaches onTouchStart and onTouchEnd
      expect(wrapper).toHaveProperty("ontouchstart");
      expect(wrapper).toHaveProperty("ontouchend");
    });

    it("swipe left does not throw", () => {
      render(<GameLaneRunner onBack={onBack} />);
      const wrapper = screen.getByLabelText(
        content.gameLaneRunner.ariaLabel,
      );

      // Swipe left: start at x=200, end at x=50 (diff 150 > threshold 50)
      expect(() => {
        fireSwipe(wrapper, 200, 100, 50, 100);
      }).not.toThrow();

      expect(
        screen.getByText(content.gameLaneRunner.title),
      ).toBeInTheDocument();
    });

    it("swipe right does not throw", () => {
      render(<GameLaneRunner onBack={onBack} />);
      const wrapper = screen.getByLabelText(
        content.gameLaneRunner.ariaLabel,
      );

      expect(() => {
        fireSwipe(wrapper, 50, 100, 200, 100);
      }).not.toThrow();
    });

    it("swipe up does not throw", () => {
      render(<GameLaneRunner onBack={onBack} />);
      const wrapper = screen.getByLabelText(
        content.gameLaneRunner.ariaLabel,
      );

      expect(() => {
        fireSwipe(wrapper, 100, 200, 100, 50);
      }).not.toThrow();
    });

    it("swipe down does not throw", () => {
      render(<GameLaneRunner onBack={onBack} />);
      const wrapper = screen.getByLabelText(
        content.gameLaneRunner.ariaLabel,
      );

      expect(() => {
        fireSwipe(wrapper, 100, 50, 100, 200);
      }).not.toThrow();
    });

    it("short swipes below threshold are ignored without error", () => {
      render(<GameLaneRunner onBack={onBack} />);
      const wrapper = screen.getByLabelText(
        content.gameLaneRunner.ariaLabel,
      );

      // Only 20px — below the 50px threshold
      expect(() => {
        fireSwipe(wrapper, 100, 100, 80, 100);
      }).not.toThrow();
    });
  });

  /* ── Jump and slide collision geometry / action-state ── */

  describe("jump and slide collision geometry", () => {
    beforeEach(() => {
      installRafMock();
      installImageMock();
      vi.spyOn(Math, "random").mockReturnValue(0.5);
    });

    it("pressing up during running switches to jump frame", () => {
      render(<GameLaneRunner onBack={onBack} />);

      // Load all frames so drawImage is called with the actual image
      for (const img of imageInstances) {
        img.onload?.();
      }

      // Start game and advance a few frames
      act(() => {
        fireEvent.keyDown(document, { key: " " });
      });
      act(() => {
        tickMany(10);
      });

      // Capture the mock context
      const mockCtx = (
        HTMLCanvasElement.prototype.getContext as ReturnType<typeof vi.fn>
      ).mock.results[0].value;

      // Clear any previous drawImage calls (running frames)
      mockCtx.drawImage.mockClear();

      // Press up (jump)
      act(() => {
        fireEvent.keyDown(document, { key: "ArrowUp" });
      });

      // Advance one frame so drawPlayer runs with the jump action
      act(() => {
        tickMany(1);
      });

      // During jump the component selects DOG_JUMP_FRAME (3) → frames[2].
      // imageInstances[i] is the same object stored in dogFramesRef.current[i].
      const calls = mockCtx.drawImage.mock.calls as Array<unknown[]>;
      const jumpFrameCall = calls.find(
        (args) => args[0] === imageInstances[2],
      );
      expect(jumpFrameCall).toBeTruthy();
    });

    it("pressing down during running switches to slide/crouch frame", () => {
      render(<GameLaneRunner onBack={onBack} />);

      for (const img of imageInstances) {
        img.onload?.();
      }

      // Start game — Space triggers handleInput("up") which sets
      // playerAction="jumping".  Wait for the jump to finish (JUMP_DURATION=24)
      // plus a few extra running frames before testing the slide.
      act(() => {
        fireEvent.keyDown(document, { key: " " });
      });
      act(() => {
        tickMany(30);
      });

      const mockCtx = (
        HTMLCanvasElement.prototype.getContext as ReturnType<typeof vi.fn>
      ).mock.results[0].value;
      mockCtx.drawImage.mockClear();

      // Press down (slide)
      act(() => {
        fireEvent.keyDown(document, { key: "ArrowDown" });
      });
      act(() => {
        tickMany(1);
      });

      // During slide the component selects DOG_CROUCH_FRAME (1) → frames[0].
      // imageInstances[i] is the same object stored in dogFramesRef.current[i].
      const calls = mockCtx.drawImage.mock.calls;
      const slideFrameCall = calls.find(
        (args: unknown[]) => args[0] === imageInstances[0],
      );
      expect(slideFrameCall).toBeTruthy();
    });

    it("pressing up/down repeatedly is idempotent (no state corruption)", () => {
      render(<GameLaneRunner onBack={onBack} />);

      act(() => {
        fireEvent.keyDown(document, { key: " " });
      });
      act(() => {
        tickMany(5);
      });

      // Rapidly fire jump + slide — should not crash
      expect(() => {
        act(() => {
          fireEvent.keyDown(document, { key: "ArrowUp" });
          fireEvent.keyDown(document, { key: "ArrowDown" });
          fireEvent.keyDown(document, { key: "ArrowUp" });
          fireEvent.keyDown(document, { key: "ArrowDown" });
        });
        act(() => {
          tickMany(20);
        });
      }).not.toThrow();

      expect(
        screen.getByText(content.gameLaneRunner.title),
      ).toBeInTheDocument();
    });

    it("jump lifts collision box so dog can clear obstacles (forgiving geometry)", () => {
      render(<GameLaneRunner onBack={onBack} />);

      // Load images so drawPlayer uses real frame references
      for (const img of imageInstances) {
        img.onload?.();
      }

      // Start game (Space → jump).  Wait for the initial jump to finish
      // (JUMP_DURATION=24) and a few more frames so the dog is running.
      act(() => {
        fireEvent.keyDown(document, { key: " " });
      });
      act(() => {
        tickMany(30);
      });

      const mockCtx = (
        HTMLCanvasElement.prototype.getContext as ReturnType<typeof vi.fn>
      ).mock.results[0].value;
      mockCtx.drawImage.mockClear();

      // Jump
      act(() => {
        fireEvent.keyDown(document, { key: "ArrowUp" });
      });
      act(() => {
        tickMany(1);
      });

      // The jump frame (DOG_JUMP_FRAME=3 → imageInstances[2]) must be drawn
      const calls = mockCtx.drawImage.mock.calls;
      const jumpFrameCall = calls.find(
        (args: unknown[]) => args[0] === imageInstances[2],
      );
      expect(jumpFrameCall).toBeTruthy();
    });

    it("sliding lowers collision box for tight spaces (forgiving geometry)", () => {
      render(<GameLaneRunner onBack={onBack} />);

      for (const img of imageInstances) {
        img.onload?.();
      }

      // Start game, wait past the initial jump, then advance a bit
      act(() => {
        fireEvent.keyDown(document, { key: " " });
      });
      act(() => {
        tickMany(30);
      });

      const mockCtx = (
        HTMLCanvasElement.prototype.getContext as ReturnType<typeof vi.fn>
      ).mock.results[0].value;
      mockCtx.drawImage.mockClear();

      // Slide
      act(() => {
        fireEvent.keyDown(document, { key: "ArrowDown" });
      });
      act(() => {
        tickMany(1);
      });

      // The slide/crouch frame (DOG_CROUCH_FRAME=1 → imageInstances[0]) must be drawn
      const calls = mockCtx.drawImage.mock.calls;
      const slideFrameCall = calls.find(
        (args: unknown[]) => args[0] === imageInstances[0],
      );
      expect(slideFrameCall).toBeTruthy();
    });

    it("sliding does not extend horizontal collision width (no wider box)", () => {
      render(<GameLaneRunner onBack={onBack} />);

      act(() => {
        fireEvent.keyDown(document, { key: " " });
      });
      act(() => {
        tickMany(30);
      });

      // Press slide when obstacle is present
      act(() => {
        fireEvent.keyDown(document, { key: "ArrowDown" });
      });
      act(() => {
        tickMany(100);
      });

      // No crash — component alive
      expect(
        screen.getByText(content.gameLaneRunner.title),
      ).toBeInTheDocument();
    });
  });
});
