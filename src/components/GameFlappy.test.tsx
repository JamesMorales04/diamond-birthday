import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameFlappy from './GameFlappy';
import { content } from '../content/page';
import { tpl } from '../utils/tpl';
import {
  createMockCtx,
  installCanvasMock,
  installRafMock,
  tickMany,
  installImageMock,
  imageInstances,
  stubMatchMedia,
} from '../test/gameTestHelpers';
import {
  FLAPPY_FRAME_PATH,
  FLAPPY_FRAMES,
  FLAPPY_DISPLAY_W,
  FLAPPY_DISPLAY_H,
  FLAPPY_SPRITE_MAP,
  FLAPPY_OBSTACLE_PATH,
  FLAPPY_OBSTACLE_SRC_X,
  FLAPPY_OBSTACLE_SRC_Y,
  FLAPPY_OBSTACLE_SRC_W,
  FLAPPY_OBSTACLE_SRC_H,
  COLLISION_LEFT_INSET,
  COLLISION_RIGHT_INSET,
  COLLISION_TOP_INSET,
  COLLISION_BOTTOM_INSET,
  COLLISION_HALF_W,
  COLLISION_HALF_H,
  MAX_ROTATION,
  ROTATION_VELOCITY_CAP,
  FLAP_PULSE_DURATION,
  getFlappyHitbox,
  selectFlappyFrame,
} from '../data/flappyAssets';
import {
  GAME_STORAGE_KEY,
  defaultHighScores,
  gameSettings,
} from '../data/games';

/* ──────────────────────────────────────────────
   Helpers – shared mock infrastructure (from
   src/test/gameTestHelpers.ts)
   ────────────────────────────────────────────── */

/** Restore original game settings after mutation-based tests. */
function withFastPipes(fn: () => void) {
  const origPipeFreq = gameSettings.flappy.pipeFrequency;
  const origPipeSpeed = gameSettings.flappy.pipeSpeed;
  gameSettings.flappy.pipeFrequency = 1;
  gameSettings.flappy.pipeSpeed = 100;
  try {
    fn();
  } finally {
    gameSettings.flappy.pipeFrequency = origPipeFreq;
    gameSettings.flappy.pipeSpeed = origPipeSpeed;
  }
}

/* ────────────────────────────────────────
   Sprite config unit tests (flappyAssets)
   ──────────────────────────────────────── */

describe('flappyAssets sprite config', () => {
  it('exports frame path template for all Chester frames (1–3)', () => {
    expect(FLAPPY_FRAME_PATH(1)).toContain('chester1.png');
    expect(FLAPPY_FRAME_PATH(2)).toContain('chester2.png');
    expect(FLAPPY_FRAME_PATH(3)).toContain('chester3.png');
  });

  it('exports correct frame count', () => {
    expect(FLAPPY_FRAMES).toBe(3);
  });

  it('exports the exact display size for the canvas', () => {
    expect(FLAPPY_DISPLAY_W).toBe(48);
    expect(FLAPPY_DISPLAY_H).toBe(44);
  });

  it('exports the explicit sprite-state map with correct image paths', () => {
    expect(FLAPPY_SPRITE_MAP).toBeDefined();
    expect(Object.keys(FLAPPY_SPRITE_MAP)).toEqual(['up', 'mid', 'down']);

    expect(FLAPPY_SPRITE_MAP.up.path).toContain('chester3.png');
    expect(FLAPPY_SPRITE_MAP.up.index).toBe(2);
    expect(FLAPPY_SPRITE_MAP.up.label).toBe('rising');

    expect(FLAPPY_SPRITE_MAP.mid.path).toContain('chester2.png');
    expect(FLAPPY_SPRITE_MAP.mid.index).toBe(1);
    expect(FLAPPY_SPRITE_MAP.mid.label).toBe('gliding');

    expect(FLAPPY_SPRITE_MAP.down.path).toContain('chester1.png');
    expect(FLAPPY_SPRITE_MAP.down.index).toBe(0);
    expect(FLAPPY_SPRITE_MAP.down.label).toBe('falling');
  });

  it('exports the exact flap-pulse duration', () => {
    expect(FLAP_PULSE_DURATION).toBe(0.12);
  });

  it('exports exact per-edge collision configuration', () => {
    expect(COLLISION_LEFT_INSET).toBe(10);
    expect(COLLISION_RIGHT_INSET).toBe(10);
    expect(COLLISION_TOP_INSET).toBe(7);
    expect(COLLISION_BOTTOM_INSET).toBe(9);
    expect(COLLISION_HALF_W).toBe(14);
    expect(COLLISION_HALF_H).toBe(14);
  });

  it('exports exact rotation constants', () => {
    expect(MAX_ROTATION).toBe(0.4);
    expect(ROTATION_VELOCITY_CAP).toBe(10);
  });

  it('frame paths resolve to a valid asset URL pattern under the default BASE_URL', async () => {
    const { assetUrl } = await import('../utils/assets');
    for (let i = 1; i <= FLAPPY_FRAMES; i++) {
      const url = assetUrl(FLAPPY_FRAME_PATH(i));
      expect(url).toContain('chester');
      expect(url).toContain('.png');
      expect(url).toContain('/photos/assets/flappy/');
    }
  });

  it('exports the exact pipe sprite crop constants', () => {
    expect(FLAPPY_OBSTACLE_SRC_X).toBe(443);
    expect(FLAPPY_OBSTACLE_SRC_Y).toBe(63);
    expect(FLAPPY_OBSTACLE_SRC_W).toBe(200);
    expect(FLAPPY_OBSTACLE_SRC_H).toBe(1316);
  });
});

/* ────────────────────────────────────────
   Pure helper tests (frame selection, hitbox)
   ──────────────────────────────────────── */

describe('selectFlappyFrame', () => {
  it('returns "up" when flapTimer is active regardless of velocity', () => {
    expect(selectFlappyFrame(5, 0.1)).toBe('up');
    expect(selectFlappyFrame(-2, 0.05)).toBe('up');
    expect(selectFlappyFrame(0, 0.01)).toBe('up');
  });

  it('returns "up" for strong upward velocity (vy < -1) with no pulse', () => {
    expect(selectFlappyFrame(-2)).toBe('up');
    expect(selectFlappyFrame(-10)).toBe('up');
    expect(selectFlappyFrame(-1.1)).toBe('up');
  });

  it('returns "down" for strong downward velocity (vy > 1) with no pulse', () => {
    expect(selectFlappyFrame(2)).toBe('down');
    expect(selectFlappyFrame(10)).toBe('down');
    expect(selectFlappyFrame(1.1)).toBe('down');
  });

  it('returns "mid" for gentle velocity (-1 ≤ vy ≤ 1) with no pulse', () => {
    expect(selectFlappyFrame(0)).toBe('mid');
    expect(selectFlappyFrame(0.5)).toBe('mid');
    expect(selectFlappyFrame(-0.5)).toBe('mid');
    expect(selectFlappyFrame(1)).toBe('mid');
    expect(selectFlappyFrame(-1)).toBe('mid');
  });
});

describe('getFlappyHitbox', () => {
  const cx = 100;
  const cy = 200;

  it('returns edges in canvas coordinates', () => {
    const hb = getFlappyHitbox(cx, cy);
    expect(hb).toHaveProperty('left');
    expect(hb).toHaveProperty('right');
    expect(hb).toHaveProperty('top');
    expect(hb).toHaveProperty('bottom');
  });

  it('is narrower than the full display size (inset applied)', () => {
    const hb = getFlappyHitbox(cx, cy);
    const fullW = FLAPPY_DISPLAY_W;
    const halfFullW = fullW / 2;

    expect(hb.left).toBe(cx - halfFullW + COLLISION_LEFT_INSET);
    expect(hb.right).toBe(cx + halfFullW - COLLISION_RIGHT_INSET);
    expect(hb.right - hb.left).toBeLessThan(fullW);
  });

  it('is shorter than the full display size (vertical inset applied)', () => {
    const hb = getFlappyHitbox(cx, cy);
    const fullH = FLAPPY_DISPLAY_H;
    const halfFullH = fullH / 2;

    expect(hb.top).toBe(cy - halfFullH + COLLISION_TOP_INSET);
    expect(hb.bottom).toBe(cy + halfFullH - COLLISION_BOTTOM_INSET);
    expect(hb.bottom - hb.top).toBeLessThan(fullH);
  });

  it('moves with the bird position', () => {
    const hb1 = getFlappyHitbox(0, 0);
    const hb2 = getFlappyHitbox(50, 100);
    expect(hb2.left - hb1.left).toBe(50);
    expect(hb2.top - hb1.top).toBe(100);
  });
});

/* ────────────────────────────────────────
   Component tests
   ──────────────────────────────────────── */

/** Regex matching the game-over hint text for Chester. */
const OVER_HINT = /Chester necesita un descansito/i;

describe('GameFlappy', () => {
  const onBack = vi.fn();

  beforeEach(() => {
    onBack.mockClear();
    vi.unstubAllGlobals();
    // Re-apply the global matchMedia mock that the setup file provides,
    // since unstubAllGlobals + restoreAllMocks in sibling tests can clear it.
    stubMatchMedia();
  });

  /* ── Rendering (vanilla jsdom, no game-loop mocks) ── */

  describe('rendering', () => {
    it('renders the game title from centralized content', () => {
      render(<GameFlappy onBack={onBack} />);
      expect(screen.getByText(content.gameFlappy.title)).toBeInTheDocument();
    });

    it('renders the back button with the centralized aria-label', () => {
      render(<GameFlappy onBack={onBack} />);
      expect(
        screen.getByLabelText(content.gameFlappy.backLabel),
      ).toBeInTheDocument();
    });

    it('renders the canvas wrapper with the centralized aria-label', () => {
      render(<GameFlappy onBack={onBack} />);
      expect(
        screen.getByLabelText(content.gameFlappy.ariaLabel),
      ).toBeInTheDocument();
    });

    it('renders the idle hint from centralized content', () => {
      render(<GameFlappy onBack={onBack} />);
      const hint = screen.getByText(content.gameFlappy.hint.idle);
      expect(hint).toBeInTheDocument();
      expect(hint).toHaveAttribute('aria-live', 'polite');
    });

    it('calls onBack when the back button is clicked', async () => {
      const user = userEvent.setup();
      render(<GameFlappy onBack={onBack} />);

      await user.click(screen.getByLabelText(content.gameFlappy.backLabel));
      expect(onBack).toHaveBeenCalledOnce();
    });

    it('renders a canvas element inside the game wrapper', () => {
      render(<GameFlappy onBack={onBack} />);

      const wrapper = screen.getByLabelText(content.gameFlappy.ariaLabel);
      const canvas = wrapper.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
    });

    it('does not throw when the canvas wrapper area is clicked', async () => {
      const user = userEvent.setup();
      render(<GameFlappy onBack={onBack} />);

      await user.click(screen.getByLabelText(content.gameFlappy.ariaLabel));

      // Component should still be mounted and render the title
      expect(screen.getByText(content.gameFlappy.title)).toBeInTheDocument();
    });
  });

  /* ── Game lifecycle (RAF + canvas + Image mocks) ── */

  describe('game lifecycle', () => {
    beforeEach(() => {
      window.localStorage.clear();

      // Controllable RAF with progressive timestamps
      installRafMock();
      // Mock getContext so game-loop useEffect initialises
      installCanvasMock();
      // Stub Image so sprites are "loaded" immediately
      installImageMock();
      // useReducedMotion depends on matchMedia
      stubMatchMedia();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('shows idle hint on mount before any interaction', () => {
      render(<GameFlappy onBack={onBack} />);
      expect(
        screen.getByText(content.gameFlappy.hint.idle),
      ).toBeInTheDocument();
    });

    it('transitions from idle to playing on first click (first flap)', () => {
      render(<GameFlappy onBack={onBack} />);

      // Initially idle
      expect(
        screen.getByText(content.gameFlappy.hint.idle),
      ).toBeInTheDocument();

      // First click → flap → gameState becomes 'playing'
      act(() => {
        screen.getByLabelText(content.gameFlappy.ariaLabel).click();
      });

      expect(
        screen.getByText(content.gameFlappy.hint.playing),
      ).toBeInTheDocument();

      // Idle hint should be gone
      expect(screen.queryByText(content.gameFlappy.hint.idle)).toBeNull();
    });

    it('transitions to game-over after enough frames (bird hits ground)', () => {
      render(<GameFlappy onBack={onBack} />);

      // Click wrapper to start the game
      act(() => {
        screen.getByLabelText(content.gameFlappy.ariaLabel).click();
      });

      // Advance enough frames for the bird to fall to the ground
      // (jumpForce=-8, gravity=0.5, dt≈1 per frame → bird falls in ~50–60 frames)
      act(() => {
        tickMany(100);
      });

      // The hint should now show the game-over template with a score
      const overPattern = OVER_HINT;
      expect(screen.getByText(overPattern)).toBeInTheDocument();
    });

    it('game-over hint includes the score', () => {
      render(<GameFlappy onBack={onBack} />);

      act(() => {
        screen.getByLabelText(content.gameFlappy.ariaLabel).click();
      });
      act(() => {
        tickMany(100);
      });

      // Over hint contains the score number (0 in this case since no pipes passed)
      const scorePattern = new RegExp(
        tpl(content.gameFlappy.hint.over, { score: '\\d+' }),
      );
      expect(screen.getByText(scorePattern)).toBeInTheDocument();
    });

    it('restarts from game-over on click and resets score to zero', () => {
      render(<GameFlappy onBack={onBack} />);

      // Play to game over (fast pipes ensure a score > 0)
      withFastPipes(() => {
        act(() => {
          screen.getByLabelText(content.gameFlappy.ariaLabel).click();
        });
        act(() => {
          tickMany(100);
        });
      });

      // Confirm game over — score should be > 0
      const overHint = screen.getByText(OVER_HINT);
      expect(overHint).toBeInTheDocument();
      const firstScore = parseInt(
        overHint.textContent!.match(/\d+/)?.[0] ?? '0',
        10,
      );
      expect(firstScore).toBeGreaterThan(0);

      // Click to restart
      act(() => {
        screen.getByLabelText(content.gameFlappy.ariaLabel).click();
      });

      // After restart, gameState is 'playing' → playing hint shown
      expect(
        screen.getByText(content.gameFlappy.hint.playing),
      ).toBeInTheDocument();

      // The over hint should be gone
      expect(screen.queryByText(OVER_HINT)).toBeNull();

      // Now play a second round WITHOUT fast pipes — the bird will fall
      // to the ground before any pipe spawns, so the score stays 0.
      act(() => {
        screen.getByLabelText(content.gameFlappy.ariaLabel).click();
      });
      act(() => {
        tickMany(100);
      });

      // The over hint should show score 0, proving it was truly reset
      expect(
        screen.getByText(tpl(content.gameFlappy.hint.over, { score: 0 })),
      ).toBeInTheDocument();
    });

    it('persists new best score to localStorage on game-over', () => {
      // Set low existing score
      window.localStorage.setItem(
        GAME_STORAGE_KEY,
        JSON.stringify({ ...defaultHighScores, flappy: 0 }),
      );

      render(<GameFlappy onBack={onBack} />);

      // Use fast pipes so the bird scores before dying
      withFastPipes(() => {
        act(() => {
          screen.getByLabelText(content.gameFlappy.ariaLabel).click();
        });
        // Enough frames for pipe to spawn and pass, then bird hits ground
        act(() => {
          tickMany(150);
        });
      });

      const stored = window.localStorage.getItem(GAME_STORAGE_KEY);
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.flappy).toBeGreaterThan(0);
    });

    it('does not overwrite a higher existing best score', () => {
      // Set unrealistically high existing score
      window.localStorage.setItem(
        GAME_STORAGE_KEY,
        JSON.stringify({ ...defaultHighScores, flappy: 9999 }),
      );

      render(<GameFlappy onBack={onBack} />);

      act(() => {
        screen.getByLabelText(content.gameFlappy.ariaLabel).click();
      });
      act(() => {
        tickMany(100);
      });

      const stored = window.localStorage.getItem(GAME_STORAGE_KEY);
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed.flappy).toBe(9999);
    });

    it('score increments when a pipe passes the bird', () => {
      render(<GameFlappy onBack={onBack} />);

      withFastPipes(() => {
        act(() => {
          screen.getByLabelText(content.gameFlappy.ariaLabel).click();
        });
        act(() => {
          tickMany(80);
        });
      });

      // Game should be over by now and the over-hint score should be > 0
      const overText = screen.getByText(OVER_HINT).textContent!;
      const score = parseInt(overText.match(/\d+/)?.[0] ?? '0', 10);
      expect(score).toBeGreaterThan(0);
    });

    it('draws pipe sprite via drawImage with crop constants from pipes.png', () => {
      const mockCtx = createMockCtx();
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
        mockCtx,
      );

      render(<GameFlappy onBack={onBack} />);

      // Load all images so obstacle is considered loaded and
      // the sprite-rendering branch runs instead of the fallback.
      for (const img of imageInstances) {
        img.onload?.();
      }

      // Start the game with fast pipes and advance enough frames
      // for pipes to spawn and be drawn.
      withFastPipes(() => {
        act(() => {
          screen.getByLabelText(content.gameFlappy.ariaLabel).click();
        });
        act(() => {
          tickMany(30);
        });
      });

      // Verify drawImage was called at least once with the obstacle image
      // (src matching pipes.png) and the exact crop constants — proves the
      // sprite-crop branch ran instead of the fallback.
      expect(mockCtx.drawImage).toHaveBeenCalledWith(
        expect.objectContaining({
          src: expect.stringContaining(FLAPPY_OBSTACLE_PATH),
        }),
        FLAPPY_OBSTACLE_SRC_X,
        FLAPPY_OBSTACLE_SRC_Y,
        FLAPPY_OBSTACLE_SRC_W,
        FLAPPY_OBSTACLE_SRC_H,
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
      );

      // No createPattern should have been used — the sprite is drawn directly
      expect(mockCtx.createPattern).not.toHaveBeenCalled();

      // Component is still mounted without errors
      expect(screen.getByText(content.gameFlappy.title)).toBeInTheDocument();
    });
  });

  /* ── Keyboard interaction ── */

  describe('keyboard input', () => {
    beforeEach(() => {
      window.localStorage.clear();
      installRafMock();
      installCanvasMock();
      installImageMock();
      stubMatchMedia();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('starts the game on Space key press', () => {
      render(<GameFlappy onBack={onBack} />);
      const wrapper = screen.getByLabelText(content.gameFlappy.ariaLabel);

      expect(
        screen.getByText(content.gameFlappy.hint.idle),
      ).toBeInTheDocument();

      act(() => {
        fireEvent.keyDown(wrapper, { key: ' ' });
      });

      expect(
        screen.getByText(content.gameFlappy.hint.playing),
      ).toBeInTheDocument();
    });

    it('starts the game on Enter key press', () => {
      render(<GameFlappy onBack={onBack} />);
      const wrapper = screen.getByLabelText(content.gameFlappy.ariaLabel);

      expect(
        screen.getByText(content.gameFlappy.hint.idle),
      ).toBeInTheDocument();

      act(() => {
        fireEvent.keyDown(wrapper, { key: 'Enter' });
      });

      expect(
        screen.getByText(content.gameFlappy.hint.playing),
      ).toBeInTheDocument();
    });

    it('restarts from game-over on Space key press', () => {
      render(<GameFlappy onBack={onBack} />);
      const wrapper = screen.getByLabelText(content.gameFlappy.ariaLabel);

      // Play to game over
      act(() => {
        wrapper.click();
      });
      act(() => {
        tickMany(100);
      });

      expect(screen.getByText(OVER_HINT)).toBeInTheDocument();

      // Press Space to restart
      act(() => {
        fireEvent.keyDown(wrapper, { key: ' ' });
      });

      expect(
        screen.getByText(content.gameFlappy.hint.playing),
      ).toBeInTheDocument();
      expect(screen.queryByText(OVER_HINT)).toBeNull();
    });

    it('restarts from game-over on Enter key press', () => {
      render(<GameFlappy onBack={onBack} />);
      const wrapper = screen.getByLabelText(content.gameFlappy.ariaLabel);

      // Play to game over
      act(() => {
        wrapper.click();
      });
      act(() => {
        tickMany(100);
      });

      expect(screen.getByText(OVER_HINT)).toBeInTheDocument();

      // Press Enter to restart
      act(() => {
        fireEvent.keyDown(wrapper, { key: 'Enter' });
      });

      expect(
        screen.getByText(content.gameFlappy.hint.playing),
      ).toBeInTheDocument();
    });

    it('Space and Enter do not throw before game starts', () => {
      render(<GameFlappy onBack={onBack} />);
      const wrapper = screen.getByLabelText(content.gameFlappy.ariaLabel);

      expect(() => {
        act(() => {
          fireEvent.keyDown(wrapper, { key: ' ' });
        });
        act(() => {
          fireEvent.keyDown(wrapper, { key: 'Enter' });
        });
      }).not.toThrow();

      // After keydown, game should be playing
      expect(
        screen.getByText(content.gameFlappy.hint.playing),
      ).toBeInTheDocument();
    });
  });

  /* ── Reduced motion ── */

  describe('reduced motion', () => {
    beforeEach(() => {
      window.localStorage.clear();
      installRafMock();
      installCanvasMock();
      installImageMock();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('slows the bird descent so game-over takes more frames (observable via DOM hints)', () => {
      // Stub matchMedia to signal reduced-motion preference
      stubMatchMedia(true);

      render(<GameFlappy onBack={onBack} />);

      // Start the game
      act(() => {
        screen.getByLabelText(content.gameFlappy.ariaLabel).click();
      });

      // Advance 80 frames — with normal motion the bird would have hit the
      // ground (~50–60 frames), but with reduced motion (gravity × 0.3,
      // jumpForce × 0.5) the bird stays in the air longer (> 85 frames).
      act(() => {
        tickMany(80);
      });

      // Game should NOT be over yet → playing hint is still shown
      expect(
        screen.getByText(content.gameFlappy.hint.playing),
      ).toBeInTheDocument();

      // The over/restart hint should be absent
      expect(screen.queryByText(OVER_HINT)).toBeNull();
    });

    it('reduced-motion preference does not crash the component', () => {
      stubMatchMedia(true);

      render(<GameFlappy onBack={onBack} />);

      // Advance a few frames
      act(() => {
        tickMany(10);
      });

      expect(screen.getByText(content.gameFlappy.title)).toBeInTheDocument();
    });
  });

  /* ── Sprite loading / fallback ── */

  describe('sprite loading', () => {
    beforeEach(() => {
      installImageMock();
      stubMatchMedia();
    });

    it('creates Image instances for Chester frames, background, and obstacle on mount', () => {
      render(<GameFlappy onBack={onBack} />);

      const totalImages = FLAPPY_FRAMES + 2; // 3 Chester frames + bg + obstacle
      expect(imageInstances).toHaveLength(totalImages);

      // First FLAPPY_FRAMES instances are the Chester sprites
      for (let i = 1; i <= FLAPPY_FRAMES; i++) {
        expect(imageInstances[i - 1].src).toContain(`chester${i}.png`);
      }

      // Next instance is the background image (uk.png)
      expect(imageInstances[FLAPPY_FRAMES]).toBeDefined();
      expect(imageInstances[FLAPPY_FRAMES].src).toContain('uk.png');

      // Last instance is the obstacle image (pipes.png)
      expect(imageInstances[FLAPPY_FRAMES + 1]).toBeDefined();
      expect(imageInstances[FLAPPY_FRAMES + 1].src).toContain('pipes.png');
    });

    it('renders without crashing when all frames load successfully', () => {
      render(<GameFlappy onBack={onBack} />);

      for (const img of imageInstances) {
        img.onload?.();
      }

      expect(screen.getByText(content.gameFlappy.title)).toBeInTheDocument();
    });

    it('renders without crashing when a single frame fails to load', () => {
      render(<GameFlappy onBack={onBack} />);

      if (imageInstances.length > 0 && imageInstances[0].onerror) {
        imageInstances[0].onerror();
      }
      for (let i = 1; i < imageInstances.length; i++) {
        imageInstances[i].onload?.();
      }

      expect(screen.getByText(content.gameFlappy.title)).toBeInTheDocument();
    });

    it('renders without crashing when all frames fail to load (heart fallback)', () => {
      render(<GameFlappy onBack={onBack} />);

      for (const img of imageInstances) {
        img.onerror?.();
      }

      expect(screen.getByText(content.gameFlappy.title)).toBeInTheDocument();
    });
  });
});
