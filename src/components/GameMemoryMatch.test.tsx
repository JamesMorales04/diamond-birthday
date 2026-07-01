import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameMemoryMatch from './GameMemoryMatch';
import { GAME_STORAGE_KEY, defaultHighScores } from '../data/games';

// Mock shuffle to be identity so adjacent card indices form matching pairs.
// With createCards(): [♥, ♥, ✦, ✦, ◆, ◆, ♡, ♡, ✿, ✿, ◇, ◇, ♤, ♤, ○, ○]
// Cards at indices (0,1), (2,3), (4,5), (6,7), (8,9), (10,11), (12,13), (14,15) match.
vi.mock('../utils/shuffle', () => ({
  shuffle: <T,>(arr: T[]): T[] => arr,
}));

beforeEach(() => {
  window.localStorage.clear();
  // Ensure matchMedia is stubbed (vitest's mock restoration may undo the global setup)
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
  vi.useRealTimers();
});

describe('GameMemoryMatch', () => {
  const onBack = vi.fn();

  beforeEach(() => {
    onBack.mockClear();
  });

  /* ---------- rendering ---------- */

  it('renders the game header and grid', () => {
    render(<GameMemoryMatch onBack={onBack} />);

    expect(screen.getByText('Memory Match')).toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getByLabelText('Back to games menu')).toBeInTheDocument();
  });

  it('shows 16 hidden cards (4×4 grid)', () => {
    render(<GameMemoryMatch onBack={onBack} />);

    const hiddenCards = screen.getAllByRole('button', { name: 'Hidden card' });
    expect(hiddenCards).toHaveLength(16);
  });

  it('shows a hint before any card is clicked', () => {
    render(<GameMemoryMatch onBack={onBack} />);

    expect(screen.getByText('Click any card to start!')).toBeInTheDocument();
  });

  it('renders move counter at zero initially', () => {
    render(<GameMemoryMatch onBack={onBack} />);

    expect(screen.getByText(/Moves:\s*0/)).toBeInTheDocument();
  });

  /* ---------- back button ---------- */

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<GameMemoryMatch onBack={onBack} />);

    await user.click(screen.getByLabelText('Back to games menu'));
    expect(onBack).toHaveBeenCalledOnce();
  });

  /* ---------- card interaction ---------- */

  it('flips a card when clicked', async () => {
    const user = userEvent.setup();
    render(<GameMemoryMatch onBack={onBack} />);

    const hiddenCards = screen.getAllByRole('button', { name: 'Hidden card' });
    expect(hiddenCards).toHaveLength(16);

    await user.click(hiddenCards[0]);

    // One card is no longer hidden — it now has an aria-label like "Card: ♥"
    const stillHidden = screen.getAllByRole('button', { name: 'Hidden card' });
    expect(stillHidden).toHaveLength(15);

    // The flipped card is revealed with a "Card:" aria-label
    const revealedCards = screen.getAllByRole('button').filter(
      (btn) => btn.getAttribute('aria-label')?.startsWith('Card:'),
    );
    expect(revealedCards).toHaveLength(1);
  });

  it('hides the hint after first click', async () => {
    const user = userEvent.setup();
    render(<GameMemoryMatch onBack={onBack} />);

    expect(screen.getByText('Click any card to start!')).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'Hidden card' })[0]);

    expect(screen.queryByText('Click any card to start!')).not.toBeInTheDocument();
  });

  it('increments moves when two cards are clicked', async () => {
    const user = userEvent.setup();
    render(<GameMemoryMatch onBack={onBack} />);

    const hiddenCards = screen.getAllByRole('button', { name: 'Hidden card' });

    await user.click(hiddenCards[0]);
    await user.click(hiddenCards[1]);

    expect(screen.getByText(/Moves:\s*1/)).toBeInTheDocument();
  });

  /* ---------- match / mismatch ---------- */

  it('handles a pair click through the flip-delay cycle without error', () => {
    render(<GameMemoryMatch onBack={onBack} />);

    const hiddenCards = screen.getAllByRole('button', { name: 'Hidden card' });

    // Use fireEvent (synchronous) with consistent fake timers to avoid
    // switching timer implementations mid-test.
    vi.useFakeTimers();
    fireEvent.click(hiddenCards[0]);
    fireEvent.click(hiddenCards[1]);

    // Advance past flipDelay so the match/unmatch completes
    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(screen.getByRole('grid')).toBeInTheDocument();
    vi.useRealTimers();
  });

  /* ---------- high score / persistence ---------- */

  it('displays a best score loaded from localStorage', () => {
    window.localStorage.setItem(
      GAME_STORAGE_KEY,
      JSON.stringify({ ...defaultHighScores, memoryMatch: 55 }),
    );

    render(<GameMemoryMatch onBack={onBack} />);

    expect(screen.getByText('Best: 55s')).toBeInTheDocument();
  });

  it('displays a dash when no high score record exists', () => {
    render(<GameMemoryMatch onBack={onBack} />);

    expect(screen.getByText('Best: —')).toBeInTheDocument();
  });

  /* ---------- game won ---------- */

  it('shows the win screen when all pairs are matched', () => {
    render(<GameMemoryMatch onBack={onBack} />);

    // With identity shuffle, the first two hidden cards always form a matching pair.
    // After they match, they leave the query, and the next two hidden cards are the next pair.
    // Re-query before each pair click to always hit cards[0] and cards[1].
    vi.useFakeTimers();

    for (let p = 0; p < 8; p++) {
      const cards = screen.getAllByRole('button', { name: 'Hidden card' });
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      act(() => {
        vi.advanceTimersByTime(700);
      });
    }

    vi.useRealTimers();

    // Win screen should now be visible
    expect(screen.getByText('You Did It!')).toBeInTheDocument();
    expect(screen.getByText(/All pairs matched in/)).toBeInTheDocument();
    expect(screen.getByText('Play Again')).toBeInTheDocument();
  });

  it('persists high score to localStorage when game is won', () => {
    window.localStorage.setItem(
      GAME_STORAGE_KEY,
      JSON.stringify({ ...defaultHighScores }),
    );

    render(<GameMemoryMatch onBack={onBack} />);

    vi.useFakeTimers();

    for (let p = 0; p < 8; p++) {
      const cards = screen.getAllByRole('button', { name: 'Hidden card' });
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      act(() => {
        vi.advanceTimersByTime(700);
      });
    }

    vi.useRealTimers();

    // Verify win screen
    expect(screen.getByText('You Did It!')).toBeInTheDocument();

    // Verify localStorage now contains a high score for memoryMatch
    const stored = window.localStorage.getItem(GAME_STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.memoryMatch).toBeGreaterThan(0);
  });
});
