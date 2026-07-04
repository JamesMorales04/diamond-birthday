import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSwipe } from './useSwipe';

/**
 * Build a minimal React TouchEvent-like object.
 * jsdom does not implement TouchEvent fully, so we use plain objects
 * with the properties the hook actually accesses.
 */
function touchEvent(overrides: {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}): { start: React.TouchEvent; end: React.TouchEvent } {
  const start = {
    touches: [{ clientX: overrides.startX, clientY: overrides.startY }],
    changedTouches: [{ clientX: overrides.startX, clientY: overrides.startY }],
    cancelable: true,
    preventDefault: vi.fn(),
  } as unknown as React.TouchEvent;

  const end = {
    touches: [{ clientX: overrides.endX, clientY: overrides.endY }],
    changedTouches: [{ clientX: overrides.endX, clientY: overrides.endY }],
    cancelable: true,
    preventDefault: vi.fn(),
  } as unknown as React.TouchEvent;

  return { start, end };
}

describe('useSwipe', () => {
  it('calls onSwipeRight when swiping right past the threshold', () => {
    const onSwipeRight = vi.fn();
    const { result } = renderHook(() =>
      useSwipe({ onSwipeRight }, { threshold: 50 }),
    );

    const { start, end } = touchEvent({
      startX: 100,
      startY: 100,
      endX: 200,
      endY: 100,
    });
    result.current.onTouchStart(start);
    result.current.onTouchEnd(end);

    expect(onSwipeRight).toHaveBeenCalledOnce();
  });

  it('calls onSwipeLeft when swiping left past the threshold', () => {
    const onSwipeLeft = vi.fn();
    const { result } = renderHook(() =>
      useSwipe({ onSwipeLeft }, { threshold: 50 }),
    );

    const { start, end } = touchEvent({
      startX: 200,
      startY: 100,
      endX: 100,
      endY: 100,
    });
    result.current.onTouchStart(start);
    result.current.onTouchEnd(end);

    expect(onSwipeLeft).toHaveBeenCalledOnce();
  });

  it('does not call any handler when swipe distance is below threshold', () => {
    const onSwipeRight = vi.fn();
    const onSwipeLeft = vi.fn();
    const { result } = renderHook(() =>
      useSwipe({ onSwipeRight, onSwipeLeft }, { threshold: 50 }),
    );

    const { start, end } = touchEvent({
      startX: 100,
      startY: 100,
      endX: 120,
      endY: 100,
    });
    result.current.onTouchStart(start);
    result.current.onTouchEnd(end);

    expect(onSwipeRight).not.toHaveBeenCalled();
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it('calls onSwipeDown for a downward swipe past threshold', () => {
    const onSwipeDown = vi.fn();
    const { result } = renderHook(() =>
      useSwipe({ onSwipeDown }, { threshold: 50 }),
    );

    const { start, end } = touchEvent({
      startX: 100,
      startY: 100,
      endX: 100,
      endY: 200,
    });
    result.current.onTouchStart(start);
    result.current.onTouchEnd(end);

    expect(onSwipeDown).toHaveBeenCalledOnce();
  });

  it('calls onSwipeUp for an upward swipe past threshold', () => {
    const onSwipeUp = vi.fn();
    const { result } = renderHook(() =>
      useSwipe({ onSwipeUp }, { threshold: 50 }),
    );

    const { start, end } = touchEvent({
      startX: 100,
      startY: 200,
      endX: 100,
      endY: 100,
    });
    result.current.onTouchStart(start);
    result.current.onTouchEnd(end);

    expect(onSwipeUp).toHaveBeenCalledOnce();
  });

  it('prioritises horizontal swipe over vertical when |diffX| > |diffY|', () => {
    const onSwipeRight = vi.fn();
    const onSwipeDown = vi.fn();
    const { result } = renderHook(() =>
      useSwipe({ onSwipeRight, onSwipeDown }, { threshold: 30 }),
    );

    // Large horizontal, small vertical → horizontal wins
    const { start, end } = touchEvent({
      startX: 100,
      startY: 100,
      endX: 200,
      endY: 110,
    });
    result.current.onTouchStart(start);
    result.current.onTouchEnd(end);

    expect(onSwipeRight).toHaveBeenCalledOnce();
    expect(onSwipeDown).not.toHaveBeenCalled();
  });

  it('does nothing if onTouchEnd is called without onTouchStart', () => {
    const onSwipeLeft = vi.fn();
    const { result } = renderHook(() => useSwipe({ onSwipeLeft }));

    const { end } = touchEvent({ startX: 0, startY: 0, endX: 200, endY: 100 });
    result.current.onTouchEnd(end);

    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it('respects a custom threshold option', () => {
    const onSwipeRight = vi.fn();
    const { result } = renderHook(() =>
      useSwipe({ onSwipeRight }, { threshold: 150 }),
    );

    const { start, end } = touchEvent({
      startX: 100,
      startY: 100,
      endX: 200,
      endY: 100,
    });
    result.current.onTouchStart(start);
    result.current.onTouchEnd(end);

    // 100px < 150px threshold → no call
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  /* ---------- vertical-priority boundary ---------- */

  it('prioritises vertical swipe over horizontal when |diffY| > |diffX|', () => {
    const onSwipeRight = vi.fn();
    const onSwipeDown = vi.fn();
    const { result } = renderHook(() =>
      useSwipe({ onSwipeRight, onSwipeDown }, { threshold: 20 }),
    );

    // Large vertical movement, small horizontal → vertical wins
    const { start, end } = touchEvent({
      startX: 100,
      startY: 100,
      endX: 110,
      endY: 200,
    });
    result.current.onTouchStart(start);
    result.current.onTouchEnd(end);

    expect(onSwipeDown).toHaveBeenCalledOnce();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('falls through to vertical branch when |diffX| equals |diffY|', () => {
    const onSwipeRight = vi.fn();
    const onSwipeDown = vi.fn();
    const { result } = renderHook(() =>
      useSwipe({ onSwipeRight, onSwipeDown }, { threshold: 20 }),
    );

    // diffX === diffY (45° diagonal) → neither |diffX| > |diffY| nor |diffY| > |diffX|
    // The `if (Math.abs(diffX) > Math.abs(diffY))` is false for equality,
    // so it enters the `else` (vertical) branch.
    const { start, end } = touchEvent({
      startX: 100,
      startY: 100,
      endX: 200,
      endY: 200,
    });
    result.current.onTouchStart(start);
    result.current.onTouchEnd(end);

    // Vertical branch: diffY (100) > threshold (20), diffY > 0 → onSwipeDown called
    expect(onSwipeDown).toHaveBeenCalledOnce();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  /* ---------- after-unmount safety ---------- */

  it('does not throw when onTouchEnd is called after the hook is no longer mounted', () => {
    const onSwipeLeft = vi.fn();
    const { result, unmount } = renderHook(() => useSwipe({ onSwipeLeft }));

    unmount();

    // After unmount, the refs still exist but isTracking.current is false,
    // so onTouchEnd returns early. This should not throw.
    const { end } = touchEvent({ startX: 0, startY: 0, endX: 200, endY: 100 });
    expect(() => result.current.onTouchEnd(end)).not.toThrow();
  });
});
