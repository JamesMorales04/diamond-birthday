import { useRef, useCallback } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface SwipeOptions {
  threshold?: number;
}

export function useSwipe(handlers: SwipeHandlers, options: SwipeOptions = {}) {
  const { threshold = 50 } = options;
  const startX = useRef(0);
  const startY = useRef(0);
  const isTracking = useRef(false);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
      isTracking.current = true;
    },
    [],
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isTracking.current) return;
      isTracking.current = false;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = endX - startX.current;
      const diffY = endY - startY.current;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (Math.abs(diffX) > threshold) {
          if (diffX > 0 && handlers.onSwipeRight) handlers.onSwipeRight();
          if (diffX < 0 && handlers.onSwipeLeft) handlers.onSwipeLeft();
        }
      } else {
        if (Math.abs(diffY) > threshold) {
          if (diffY > 0 && handlers.onSwipeDown) handlers.onSwipeDown();
          if (diffY < 0 && handlers.onSwipeUp) handlers.onSwipeUp();
        }
      }
    },
    [handlers, threshold],
  );

  return { onTouchStart, onTouchEnd };
}
