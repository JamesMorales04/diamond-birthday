import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameMemoryMatch from './GameMemoryMatch';
import { GAME_STORAGE_KEY, defaultHighScores } from '../data/games';
import { content } from '../content/page';
import { tpl } from '../utils/tpl';

// Mock shuffle to be identity so adjacent card indices form matching pairs.
// With createMemoryMatchCards(): [pairId:0, pairId:0, pairId:1, pairId:1, pairId:2, pairId:2, pairId:3, pairId:3, pairId:4, pairId:4]
// Cards at indices (0,1), (2,3), (4,5), (6,7), (8,9) match.
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

    expect(screen.getByText(content.gameMemoryMatch.title)).toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getByLabelText(content.gameMemoryMatch.backLabel)).toBeInTheDocument();
  });

  it('shows 10 hidden cards (5 pairs, photo deck)', () => {
    render(<GameMemoryMatch onBack={onBack} />);

    const hiddenCards = screen.getAllByRole('button', { name: content.gameMemoryMatch.hiddenCardLabel });
    expect(hiddenCards).toHaveLength(10);
  });

  it('renders each image asset exactly twice in the deck', () => {
    render(<GameMemoryMatch onBack={onBack} />);

    const grid = screen.getByRole('grid');
    const imgs = grid.querySelectorAll('img');
    expect(imgs).toHaveLength(10);

    // With identity shuffle, the 5 unique asset src values each appear twice
    const srcs = Array.from(imgs).map((img) => img.getAttribute('src'));
    const counts = srcs.reduce<Record<string, number>>((acc, s) => {
      acc[s!] = (acc[s!] || 0) + 1;
      return acc;
    }, {});
    expect(Object.keys(counts)).toHaveLength(5);
    Object.values(counts).forEach((c) => expect(c).toBe(2));
  });

  it('shows a hint before any card is clicked', () => {
    render(<GameMemoryMatch onBack={onBack} />);

    expect(screen.getByText(content.gameMemoryMatch.hint)).toBeInTheDocument();
  });

  it('renders move counter at zero initially', () => {
    render(<GameMemoryMatch onBack={onBack} />);

    expect(screen.getByText(tpl(content.gameMemoryMatch.movesLabel, { count: 0 }))).toBeInTheDocument();
  });

  /* ---------- back button ---------- */

  it('calls onBack when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<GameMemoryMatch onBack={onBack} />);

    await user.click(screen.getByLabelText(content.gameMemoryMatch.backLabel));
    expect(onBack).toHaveBeenCalledOnce();
  });

  /* ---------- card interaction ---------- */

  it('flips a card when clicked, showing its face instead of a placeholder', async () => {
    const user = userEvent.setup();
    render(<GameMemoryMatch onBack={onBack} />);

    const hiddenCards = screen.getAllByRole('button', { name: content.gameMemoryMatch.hiddenCardLabel });
    expect(hiddenCards).toHaveLength(10);

    await user.click(hiddenCards[0]);

    // One card is flipped — it no longer has the hidden label
    const stillHidden = screen.getAllByRole('button', { name: content.gameMemoryMatch.hiddenCardLabel });
    expect(stillHidden).toHaveLength(9);

    // The flipped card now shows the revealed label (not a placeholder)
    const revealedCards = screen.getAllByRole('button', { name: content.gameMemoryMatch.revealedCardLabel });
    expect(revealedCards).toHaveLength(1);

    // The revealed card contains an actual image, not just the "?" placeholder
    const img = revealedCards[0].querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src');
  });

  it('hides the hint after first click', async () => {
    const user = userEvent.setup();
    render(<GameMemoryMatch onBack={onBack} />);

    expect(screen.getByText(content.gameMemoryMatch.hint)).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: content.gameMemoryMatch.hiddenCardLabel })[0]);

    expect(screen.queryByText(content.gameMemoryMatch.hint)).not.toBeInTheDocument();
  });

  it('increments moves when two cards are clicked', async () => {
    const user = userEvent.setup();
    render(<GameMemoryMatch onBack={onBack} />);

    const hiddenCards = screen.getAllByRole('button', { name: content.gameMemoryMatch.hiddenCardLabel });

    await user.click(hiddenCards[0]);
    await user.click(hiddenCards[1]);

    expect(screen.getByText(tpl(content.gameMemoryMatch.movesLabel, { count: 1 }))).toBeInTheDocument();
  });

  /* ---------- match / mismatch ---------- */

  it('handles a matching pair click through the flip-delay cycle', () => {
    render(<GameMemoryMatch onBack={onBack} />);

    // Use fireEvent (synchronous) with consistent fake timers
    vi.useFakeTimers();
    const hiddenCards = screen.getAllByRole('button', { name: content.gameMemoryMatch.hiddenCardLabel });
    fireEvent.click(hiddenCards[0]);
    fireEvent.click(hiddenCards[1]);

    // Advance past flipDelay so the match completes
    act(() => {
      vi.advanceTimersByTime(700);
    });

    // After a match, both cards show the matched label
    const matchedCards = screen.getAllByRole('button', { name: content.gameMemoryMatch.matchedCardLabel });
    expect(matchedCards).toHaveLength(2);

    // Moves counter should be 1
    expect(screen.getByText(tpl(content.gameMemoryMatch.movesLabel, { count: 1 }))).toBeInTheDocument();

    // Remaining cards are still hidden
    const stillHidden = screen.getAllByRole('button', { name: content.gameMemoryMatch.hiddenCardLabel });
    expect(stillHidden).toHaveLength(8);

    vi.useRealTimers();
  });

  it('flips mismatched cards back after the delay cycle', () => {
    render(<GameMemoryMatch onBack={onBack} />);

    vi.useFakeTimers();

    // Cards at indices 0 (pairId:0) and 2 (pairId:1) do NOT match with identity shuffle
    const hiddenCards = screen.getAllByRole('button', { name: content.gameMemoryMatch.hiddenCardLabel });
    fireEvent.click(hiddenCards[0]);
    fireEvent.click(hiddenCards[2]);

    // Advance past flipDelay so the unmatch completes
    act(() => {
      vi.advanceTimersByTime(700);
    });

    // After a mismatch, all cards should be hidden again
    const afterMismatch = screen.getAllByRole('button', { name: content.gameMemoryMatch.hiddenCardLabel });
    expect(afterMismatch).toHaveLength(10);

    // Moves counter should still be 1
    expect(screen.getByText(tpl(content.gameMemoryMatch.movesLabel, { count: 1 }))).toBeInTheDocument();

    vi.useRealTimers();
  });

  /* ---------- high score / persistence ---------- */

  it('displays a best score loaded from localStorage', () => {
    window.localStorage.setItem(
      GAME_STORAGE_KEY,
      JSON.stringify({ ...defaultHighScores, memory: 55 }),
    );

    render(<GameMemoryMatch onBack={onBack} />);

    expect(screen.getByText(tpl(content.gameMemoryMatch.bestLabel, { score: '55s' }))).toBeInTheDocument();
  });

  it('displays a dash when no high score record exists', () => {
    render(<GameMemoryMatch onBack={onBack} />);

    expect(screen.getByText(content.gameMemoryMatch.bestDash)).toBeInTheDocument();
  });

  /* ---------- game won ---------- */

  it('shows the win screen when all pairs are matched', () => {
    render(<GameMemoryMatch onBack={onBack} />);

    // With identity shuffle, adjacent card indices always form matching pairs.
    // After they match, they leave the hidden query, and the next two hidden cards
    // are the next pair. Re-query before each pair click to always hit cards[0] and cards[1].
    vi.useFakeTimers();

    for (let p = 0; p < 5; p++) {
      const cards = screen.getAllByRole('button', { name: content.gameMemoryMatch.hiddenCardLabel });
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      act(() => {
        vi.advanceTimersByTime(700);
      });
    }

    vi.useRealTimers();

    // Win screen should now be visible
    expect(screen.getByText(content.gameMemoryMatch.winTitle)).toBeInTheDocument();
    // Use a regex to match the win text with any number of moves
    const winTextPattern = new RegExp(
      tpl(content.gameMemoryMatch.winText, { moves: '\\d+' })
    );
    expect(screen.getByText(winTextPattern)).toBeInTheDocument();
    expect(screen.getByText(content.gameMemoryMatch.playAgain)).toBeInTheDocument();
  });

  it('persists high score to localStorage when game is won', () => {
    window.localStorage.setItem(
      GAME_STORAGE_KEY,
      JSON.stringify({ ...defaultHighScores }),
    );

    render(<GameMemoryMatch onBack={onBack} />);

    vi.useFakeTimers();

    for (let p = 0; p < 5; p++) {
      const cards = screen.getAllByRole('button', { name: content.gameMemoryMatch.hiddenCardLabel });
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      act(() => {
        vi.advanceTimersByTime(700);
      });
    }

    vi.useRealTimers();

    // Verify win screen
    expect(screen.getByText(content.gameMemoryMatch.winTitle)).toBeInTheDocument();

    // Verify localStorage now contains a high score for memory
    const stored = window.localStorage.getItem(GAME_STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.memory).toBeGreaterThan(0);
  });

  /* ---------- restart ---------- */

  it('restart creates a shuffled fresh board', () => {
    render(<GameMemoryMatch onBack={onBack} />);

    vi.useFakeTimers();

    // Complete the game
    for (let p = 0; p < 5; p++) {
      const cards = screen.getAllByRole('button', { name: content.gameMemoryMatch.hiddenCardLabel });
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      act(() => {
        vi.advanceTimersByTime(700);
      });
    }

    vi.useRealTimers();

    // Play again
    fireEvent.click(screen.getByLabelText(content.gameMemoryMatch.restartLabel));

    // Board is fresh: 10 hidden cards, move counter zero, hint visible
    expect(screen.getAllByRole('button', { name: content.gameMemoryMatch.hiddenCardLabel })).toHaveLength(10);
    expect(screen.getByText(tpl(content.gameMemoryMatch.movesLabel, { count: 0 }))).toBeInTheDocument();
    expect(screen.getByText(content.gameMemoryMatch.hint)).toBeInTheDocument();
  });

  /* ---------- no placeholder faces ---------- */

  it('every card in the grid carries an img element with a non-empty src (no placeholder faces)', () => {
    render(<GameMemoryMatch onBack={onBack} />);

    const grid = screen.getByRole('grid');
    const buttons = within(grid).getAllByRole('button');
    expect(buttons).toHaveLength(10);

    buttons.forEach((btn) => {
      const img = btn.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img!.getAttribute('src')).toBeTruthy();
    });
  });
});
