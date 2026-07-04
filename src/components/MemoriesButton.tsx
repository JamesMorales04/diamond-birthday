import { useState, useEffect, useRef } from 'react';
import Gallery from './Gallery';
import { content } from '../content/page';

export default function MemoriesButton() {
  const [isOpen, setIsOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Focus trap + Escape inside overlay
  useEffect(() => {
    if (!isOpen) return;
    const overlay = overlayRef.current;
    if (!overlay) return;

    // Focus the close button on open
    const closeBtn = overlay.querySelector<HTMLButtonElement>(
      '.memories-overlay__close',
    );
    closeBtn?.focus();

    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
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

  return (
    <>
      <button
        ref={triggerRef}
        className="memories-btn"
        onClick={() => setIsOpen(true)}
        aria-label={content.memoriesButton.buttonLabel}
        title={content.memoriesButton.buttonText}
      >
        <span className="memories-btn__icon" aria-hidden="true">
          ◆
        </span>
        <span className="memories-btn__text">
          {content.memoriesButton.buttonText}
        </span>
      </button>

      {isOpen && (
        <div
          ref={overlayRef}
          className="memories-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={content.memoriesButton.overlayLabel}
        >
          <div className="memories-overlay__header">
            <button
              className="memories-overlay__close"
              onClick={() => setIsOpen(false)}
              aria-label={content.memoriesButton.closeLabel}
            >
              ✕
            </button>
          </div>
          <div className="memories-overlay__content">
            <Gallery />
          </div>
        </div>
      )}
    </>
  );
}
