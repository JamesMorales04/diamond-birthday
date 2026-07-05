import { useEffect, useRef } from 'react';

interface UseOverlayTrapOptions {
  /** Whether the overlay is currently open. */
  isOpen: boolean;
  /** Called when Escape is pressed. Typically closes the overlay. */
  onClose: () => void;
  /** Ref attached to the overlay container element. */
  overlayRef: { current: HTMLDivElement | null };
  /** Ref attached to the trigger button, used for focus restoration on close. */
  triggerRef: { current: HTMLButtonElement | null };
  /** CSS selector for the close button inside the overlay. */
  closeButtonSelector: string;
}

/**
 * Encapsulates standard overlay accessibility behaviour:
 * - Focuses the close button on open
 * - Traps Tab / Shift+Tab focus cycling inside the overlay
 * - Closes on Escape
 * - Locks body scroll while open
 * - Restores body scroll and returns focus to the trigger on close
 */
export function useOverlayTrap({
  isOpen,
  onClose,
  overlayRef,
  triggerRef,
  closeButtonSelector,
}: UseOverlayTrapOptions) {
  // Keep the latest onClose in a ref so the effect never needs to re-run
  // when the consumer passes a new inline arrow function.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const overlay = overlayRef.current;
    if (!overlay) return;

    const closeBtn =
      overlay.querySelector<HTMLButtonElement>(closeButtonSelector);
    closeBtn?.focus();

    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }

      if (e.key === 'Tab') {
        const focusable =
          overlay.querySelectorAll<HTMLElement>(focusableSelector);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            last?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first?.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      triggerRef.current?.focus();
    };
  }, [isOpen]);
}
