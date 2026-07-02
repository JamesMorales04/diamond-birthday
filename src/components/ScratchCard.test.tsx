import { describe, it, expect, vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
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
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4), width: 0, height: 0 })),
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
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext);
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
    expect(screen.getByText(content.scratchCard.hiddenMessage)).toBeInTheDocument();
  });

  it('renders the default aria-label on the scratch card role-img', () => {
    render(<ScratchCard />);
    expect(screen.getByLabelText(content.scratchCard.ariaHiddenLabel)).toBeInTheDocument();
  });

  it('updates aria-label to hidden message when revealed via reduced motion', () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    vi.useFakeTimers();
    render(<ScratchCard />);

    // Initial state: card has the default hidden label
    expect(screen.getByLabelText(content.scratchCard.ariaHiddenLabel)).toBeInTheDocument();

    // Advance timers past the 500ms reveal delay in initCanvas
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // After reveal: card aria-label should be the hidden message text
    expect(screen.getByLabelText(content.scratchCard.hiddenMessage)).toBeInTheDocument();
  });
});
