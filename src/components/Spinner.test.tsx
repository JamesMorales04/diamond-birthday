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
    expect(
      screen.getByRole('img', { name: content.spinner.ariaDefault }),
    ).toBeInTheDocument();
  });

  it('shows the spinning state when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<Spinner />);

    const button = screen.getByText(content.spinner.spinButton);
    await user.click(button);

    // After clicking, the button text changes to "Girando..." (spinning)
    expect(
      await screen.findByText(content.spinner.spinning),
    ).toBeInTheDocument();
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
      window.setTimeout(
        () => cb(performance.now()),
        16,
      )) as typeof window.requestAnimationFrame;
    const cancelRaf = ((handle: number) =>
      window.clearTimeout(handle)) as typeof window.cancelAnimationFrame;

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
    expect(
      screen.queryByText(content.spinner.spinning),
    ).not.toBeInTheDocument();

    // A result template should be rendered (exact result is random)
    expect(screen.getByText(/^Nuestro plan: /)).toBeInTheDocument();

    // The wheel aria-label should update to the result template
    const resultText = screen.getByText(/^Nuestro plan: /).textContent!;
    const expectedAriaLabel = tpl(content.spinner.ariaResultTemplate, {
      result: resultText.replace('Nuestro plan: ', ''),
    });
    // Use getByRole('img') for consistency with other wheel-selection tests
    expect(
      screen.getByRole('img', { name: expectedAriaLabel }),
    ).toBeInTheDocument();
  });
});

describe('Spinner deterministic slice selection', () => {
  let originalRAF: typeof window.requestAnimationFrame;
  let originalCancelRAF: typeof window.cancelAnimationFrame;

  beforeEach(() => {
    originalRAF = window.requestAnimationFrame;
    originalCancelRAF = window.cancelAnimationFrame;

    const raf = ((cb: FrameRequestCallback) =>
      window.setTimeout(
        () => cb(performance.now()),
        16,
      )) as typeof window.requestAnimationFrame;
    const cancelRaf = ((handle: number) =>
      window.clearTimeout(handle)) as typeof window.cancelAnimationFrame;

    window.requestAnimationFrame = raf;
    window.cancelAnimationFrame = cancelRaf;
  });

  afterEach(() => {
    window.requestAnimationFrame = originalRAF;
    window.cancelAnimationFrame = originalCancelRAF;
    vi.useRealTimers();
    // Targeted restore: only reset the Math.random spy if it was created
    // during the test.
    if (
      typeof (Math.random as unknown as { mockRestore?: () => void })
        .mockRestore === 'function'
    ) {
      (Math.random as unknown as { mockRestore: () => void }).mockRestore();
    }
  });

  it('result text matches the visual slice under the top pointer after spin', () => {
    // ── Deterministic Math.random setup ────────────────────────────
    // The spin() callback calls Math.random three times:
    //   1st: targetIndex = floor(r1 × 10).  r1=0.75 → targetIndex=7.
    //   2nd: segmentOffset = (POINTER_ANGLE - segmentCenter) + (r2-0.5) * SEGMENT_ANGLE * 0.7.
    //        segmentCenter = 7×36 + 18 = 270.  POINTER_ANGLE=270.
    //        baseOffset = (270-270+360)%360 = 0.  r2=0.5 → (0.5-0.5)×36×0.7 = 0.
    //        → segmentOffset = 0.
    //   3rd: extraSpins = 3 + floor(r3×5).  r3=0.0 → extraSpins=3.
    //
    // Computed: targetAngle = 3×360 + 0 = 1080.
    //           finalRotation = 0 + 1080 - (0%360) = 1080.
    //           normalized = ((270 - 1080) % 360 + 360) % 360 = 270.
    //           idx = Math.floor(270 / 36) = 7.
    //
    // ── Test expectation ───────────────────────────────────────────
    // With the pointer-aware result math (POINTER_ANGLE=270), slice 7
    // ("Bailar lento en la sala") is correctly resolved.
    // Before the pointer-offset fix the old math would have computed
    //   idx = Math.floor(normalized / SEGMENT_ANGLE) = Math.floor(0/36) = 0
    // (without accounting for POINTER_ANGLE), which is wrong.

    let callCount = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => {
      callCount++;
      switch (callCount) {
        case 1:
          return 0.75; // targetIndex = floor(0.75×10) = 7
        case 2:
          return 0.5; // (r2-0.5)×36×0.7 = 0 → segmentOffset = baseOffset
        case 3:
          return 0.0; // extraSpins = 3 + floor(0×5) = 3
        default:
          return 0.5;
      }
    });

    vi.useFakeTimers();
    render(<Spinner />);

    fireEvent.click(screen.getByText(content.spinner.spinButton));
    expect(screen.getByText(content.spinner.spinning)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    // The result must be slice 7 — "Bailar lento en la sala"
    const resultText = screen.getByText(/^Nuestro plan: /);
    expect(resultText).toHaveTextContent('Bailar lento en la sala');

    // The aria-label must also match the same visual slice
    const expectedAria = tpl(content.spinner.ariaResultTemplate, {
      result: 'Bailar lento en la sala',
    });
    expect(screen.getByRole('img', { name: expectedAria })).toBeInTheDocument();
  });
});

describe('Spinner wheel label geometry', () => {
  beforeEach(() => {
    // Ensure matchMedia is stubbed before render() because
    // useReducedMotion reads it during component mount.  The setup file
    // (src/test/setup.ts) provides the initial stub, but sibling describe
    // blocks that reassign window.matchMedia can leave it unset here.
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

  it('renders wedge layer with correct number of segments (no labels inside)', () => {
    render(<Spinner />);
    const wheel = screen.getByRole('img', {
      name: content.spinner.ariaDefault,
    });
    const segments = wheel.querySelectorAll('.spinner-section__segment');

    expect(segments.length).toBe(content.spinner.options.length);
    segments.forEach((segment) => {
      // Segments (wedges) are pure backgrounds — no label children
      expect(segment.querySelector('.spinner-section__label')).toBeNull();
    });
  });

  it('renders each option label in the separate label layer', () => {
    render(<Spinner />);
    const wheel = screen.getByRole('img', {
      name: content.spinner.ariaDefault,
    });
    const labelsLayer = wheel.querySelector('.spinner-section__labels');
    expect(labelsLayer).toBeInTheDocument();
    expect(labelsLayer).toHaveAttribute('aria-hidden', 'true');

    const wrappers = labelsLayer!.querySelectorAll(
      '.spinner-section__label-wrapper',
    );
    expect(wrappers.length).toBe(content.spinner.options.length);
    wrappers.forEach((wrapper, i) => {
      const label = wrapper.querySelector('.spinner-section__label');
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent(content.spinner.options[i].label);
    });
  });

  it('applies an inline rotation transform to every segment element', () => {
    render(<Spinner />);
    const wheel = screen.getByRole('img', {
      name: content.spinner.ariaDefault,
    });
    const segments = wheel.querySelectorAll('.spinner-section__segment');
    expect(segments.length).toBeGreaterThan(0);
    segments.forEach((segment) => {
      expect(segment.getAttribute('style')).toMatch(
        /transform:\s*rotate\([\d.]+deg\)/,
      );
    });
  });

  it('applies rotation on wrappers and translation on labels', () => {
    render(<Spinner />);
    const wheel = screen.getByRole('img', {
      name: content.spinner.ariaDefault,
    });
    const wrappers = wheel.querySelectorAll('.spinner-section__label-wrapper');
    expect(wrappers.length).toBeGreaterThan(0);
    wrappers.forEach((wrapper) => {
      // Rotation is on the wrapper (positions at segment centreline)
      expect(wrapper.getAttribute('style')).toMatch(
        /transform:\s*rotate\([\d.]+deg\)/,
      );
    });

    const labels = wheel.querySelectorAll('.spinner-section__label');
    expect(labels.length).toBeGreaterThan(0);
    labels.forEach((label) => {
      const el = label as HTMLElement;
      // Translation (outward from centre) is applied via CSS on
      // .spinner-section__label (not inline). Rotation (centreline
      // positioning) is on the parent wrapper — verify no inline
      // transform or rotate on the label itself.
      expect(el.style.transform).toBe('');
      expect(el.style.rotate).toBe('');
      expect(label).toHaveClass('spinner-section__label');
    });
  });

  it('renders the label layer after all segments in DOM order for correct paint stacking', () => {
    render(<Spinner />);
    const wheel = screen.getByRole('img', {
      name: content.spinner.ariaDefault,
    });
    const segments = wheel.querySelectorAll('.spinner-section__segment');
    const labelsLayer = wheel.querySelector('.spinner-section__labels');

    expect(segments.length).toBe(content.spinner.options.length);
    expect(labelsLayer).toBeInTheDocument();

    // The label layer appears after the last segment in DOM order,
    // ensuring it paints above all wedge backgrounds (later in DOM
    // = later paint order for same stacking context).
    const lastSegment = segments[segments.length - 1];
    const position = lastSegment.compareDocumentPosition(labelsLayer!);
    expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('applies rotation on wrappers and translation on labels with reduced motion', () => {
    const originalMatchMedia = window.matchMedia;
    try {
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })) as unknown as typeof window.matchMedia;

      render(<Spinner />);
      const wheel = screen.getByRole('img', {
        name: content.spinner.ariaDefault,
      });

      // Same geometric contract as the non-reduced-motion case
      const labelsLayer = wheel.querySelector('.spinner-section__labels');
      expect(labelsLayer).toBeInTheDocument();
      expect(labelsLayer).toHaveAttribute('aria-hidden', 'true');

      const wrappers = labelsLayer!.querySelectorAll(
        '.spinner-section__label-wrapper',
      );
      expect(wrappers.length).toBe(content.spinner.options.length);
      wrappers.forEach((wrapper) => {
        expect(wrapper.getAttribute('style')).toMatch(
          /transform:\s*rotate\([\d.]+deg\)/,
        );
      });

      const labels = labelsLayer!.querySelectorAll('.spinner-section__label');
      expect(labels.length).toBe(content.spinner.options.length);
      labels.forEach((label) => {
        const el = label as HTMLElement;
        expect(el.style.transform).toBe('');
        expect(el.style.rotate).toBe('');
        expect(label).toHaveClass('spinner-section__label');
      });
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});
