import { useState, useRef } from 'react';
import Gallery from './Gallery';
import { content } from '../content/page';
import { useOverlayTrap } from '../hooks/useOverlayTrap';

export default function MemoriesButton() {
  const [isOpen, setIsOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useOverlayTrap({
    isOpen,
    onClose: () => setIsOpen(false),
    overlayRef,
    triggerRef,
    closeButtonSelector: '.memories-overlay__close',
  });

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
