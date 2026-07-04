import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from 'vitest';
import { render, screen, act } from '@testing-library/react';
import ScratchCard from './ScratchCard';
import { content } from '../content/page';

vi.mock('../hooks/useReducedMotion', () => ({
  useReducedMotion: vi.fn(),
}));

vi.mock('../utils/confetti');

import { useReducedMotion } from '../hooks/useReducedMotion';

/** Minimal CanvasRenderingContext2D mock so initCanvas() can schedule
 *  the reduced-motion auto-reveal timeout in jsdom (which returns null
 *  for getContext('2d') without the optional canvas package). */
function createMockContext(): CanvasRenderingContext2D {
  return {
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    scale: vi.fn(),
    clearRect: vi.fn(),
    arc: vi.fn(),
    beginPath: vi.fn(),
    fill: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(4),
      width: 0,
      height: 0,
    })),
    globalCompositeOperation: 'source-over',
    fillStyle: '#000',
    strokeStyle: '#000',
    lineWidth: 1,
    font: '',
    textAlign: 'start' as CanvasTextAlign,
    shadowColor: 'transparent',
    shadowBlur: 0,
    canvas: null as unknown as HTMLCanvasElement,
  } as unknown as CanvasRenderingContext2D;
}

let mockContext: CanvasRenderingContext2D;

beforeAll(() => {
  mockContext = createMockContext();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    mockContext,
  );
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('ScratchCard', () => {
  beforeEach(() => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the scratch card section title from centralized content', () => {
    render(<ScratchCard />);
    expect(screen.getByText(content.scratchCard.title)).toBeInTheDocument();
  });

  it('renders the scratch card subtitle from centralized content', () => {
    render(<ScratchCard />);
    expect(screen.getByText(content.scratchCard.subtitle)).toBeInTheDocument();
  });

  it('renders the hidden message in the message div', () => {
    render(<ScratchCard />);
    expect(
      screen.getByText(content.scratchCard.hiddenMessage),
    ).toBeInTheDocument();
  });

  it('renders the default aria-label on the scratch card role-img', () => {
    render(<ScratchCard />);
    expect(
      screen.getByLabelText(content.scratchCard.ariaHiddenLabel),
    ).toBeInTheDocument();
  });

  it('updates aria-label to hidden message when revealed via reduced motion', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    vi.useFakeTimers();
    render(<ScratchCard />);

    // Initial state: card has the default hidden label
    expect(
      screen.getByLabelText(content.scratchCard.ariaHiddenLabel),
    ).toBeInTheDocument();

    // Advance timers past the 500ms reveal delay in initCanvas
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // After reveal: card aria-label should be the hidden message text
    expect(
      screen.getByLabelText(content.scratchCard.hiddenMessage),
    ).toBeInTheDocument();
  });

  it('uses full rect.height (not a fraction) for canvas size and fill drawing', () => {
    const PANEL_W = 400;
    const PANEL_H = 280;
    const mockRect = {
      width: PANEL_W,
      height: PANEL_H,
      top: 0,
      left: 0,
      right: PANEL_W,
      bottom: PANEL_H,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect;

    // Scope the getBoundingClientRect mock only to this test so existing
    // tests (which rely on the default jsdom zero-size rect) are unaffected.
    const rectSpy = vi.spyOn(Element.prototype, 'getBoundingClientRect');
    rectSpy.mockReturnValue(mockRect);

    try {
      render(<ScratchCard />);

      const canvas = document.querySelector('canvas')!;

      // CSS style dimensions must match the full panel size —
      // would be shorter if code used rect.height * 0.7 or similar fraction.
      expect(canvas.style.height).toBe(`${PANEL_H}px`);
      expect(canvas.style.width).toBe(`${PANEL_W}px`);

      // Backing-store dimensions reflect device-pixel-ratio 2x.
      expect(canvas.height).toBe(PANEL_H * 2);
      expect(canvas.width).toBe(PANEL_W * 2);

      // The initial fill must paint the full logical area.
      // A regression to rect.height * 0.7 would produce fillRect(0,0,400,196).
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, PANEL_W, PANEL_H);
    } finally {
      rectSpy.mockRestore();
    }
  });
});
