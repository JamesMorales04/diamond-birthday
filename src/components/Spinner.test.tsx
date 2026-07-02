import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Spinner from './Spinner';
import { content } from '../content/page';
import { tpl } from '../utils/tpl';

describe('Spinner', () => {
  it('renders the spinner section title from centralized content', () => {
    render(<Spinner />);
    expect(screen.getByText(content.spinner.title)).toBeInTheDocument();
  });

  it('renders the spinner subtitle from centralized content', () => {
    render(<Spinner />);
    expect(screen.getByText(content.spinner.subtitle)).toBeInTheDocument();
  });

  it('renders the spin button with the centralized label', () => {
    render(<Spinner />);
    expect(screen.getByText(content.spinner.spinButton)).toBeInTheDocument();
  });

  it('renders all wheel option labels from the canonical content array', () => {
    render(<Spinner />);
    for (const option of content.spinner.options) {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    }
  });

  it('renders each wheel option label exactly once', () => {
    render(<Spinner />);
    // Each option label from the canonical array should appear exactly once in the DOM
    for (const option of content.spinner.options) {
      expect(screen.getAllByText(option.label)).toHaveLength(1);
    }
  });

  it('renders the default aria-label on the wheel element', () => {
    render(<Spinner />);
    expect(screen.getByLabelText(content.spinner.ariaDefault)).toBeInTheDocument();
  });

  it('shows the spinning state when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<Spinner />);

    const button = screen.getByText(content.spinner.spinButton);
    await user.click(button);

    // After clicking, the button text changes to "Girando..." (spinning)
    expect(await screen.findByText(content.spinner.spinning)).toBeInTheDocument();
  });
});

describe('Spinner animation completion', () => {
  let originalRAF: typeof window.requestAnimationFrame;
  let originalCancelRAF: typeof window.cancelAnimationFrame;
  let originalGlobalRAF: typeof globalThis.requestAnimationFrame;
  let originalGlobalCancelRAF: typeof globalThis.cancelAnimationFrame;

  beforeEach(() => {
    originalRAF = window.requestAnimationFrame;
    originalCancelRAF = window.cancelAnimationFrame;
    originalGlobalRAF = globalThis.requestAnimationFrame;
    originalGlobalCancelRAF = globalThis.cancelAnimationFrame;

    const raf = ((cb: FrameRequestCallback) =>
      window.setTimeout(() => cb(performance.now()), 16)) as typeof window.requestAnimationFrame;
    const cancelRaf = ((handle: number) => window.clearTimeout(handle)) as typeof window.cancelAnimationFrame;

    window.requestAnimationFrame = raf;
    window.cancelAnimationFrame = cancelRaf;
    globalThis.requestAnimationFrame = raf;
    globalThis.cancelAnimationFrame = cancelRaf;
  });

  afterEach(() => {
    window.requestAnimationFrame = originalRAF;
    window.cancelAnimationFrame = originalCancelRAF;
    globalThis.requestAnimationFrame = originalGlobalRAF;
    globalThis.cancelAnimationFrame = originalGlobalCancelRAF;
    vi.useRealTimers();
  });

  it('renders the result after the spin animation completes', () => {
    vi.useFakeTimers();
    render(<Spinner />);

    // Use synchronous fireEvent since we're inside fake timers
    fireEvent.click(screen.getByText(content.spinner.spinButton));

    // Button shows spinning state immediately
    expect(screen.getByText(content.spinner.spinning)).toBeInTheDocument();

    // Advance timers past the SPIN_DURATION (4000ms) to complete animation
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    // Spinning state is gone
    expect(screen.queryByText(content.spinner.spinning)).not.toBeInTheDocument();

    // A result template should be rendered (exact result is random)
    expect(screen.getByText(/^Esta noche: /)).toBeInTheDocument();

    // The wheel aria-label should update to the result template
    const resultText = screen.getByText(/^Esta noche: /).textContent!;
    const expectedAriaLabel = tpl(content.spinner.ariaResultTemplate, {
      result: resultText.replace('Esta noche: ', ''),
    });
    expect(screen.getByLabelText(expectedAriaLabel)).toBeInTheDocument();
  });
});
