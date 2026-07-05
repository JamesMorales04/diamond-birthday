import { useState, useRef } from 'react';
import { content } from '../content/page';
import { assetUrl } from '../utils/assets';
import { useOverlayTrap } from '../hooks/useOverlayTrap';

export default function HeartButton() {
  const [isOpen, setIsOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useOverlayTrap({
    isOpen,
    onClose: () => setIsOpen(false),
    overlayRef,
    triggerRef,
    closeButtonSelector: '.heart-overlay__close',
  });

  return (
    <>
      <button
        ref={triggerRef}
        className="heart-btn"
        onClick={() => setIsOpen(true)}
        aria-label={content.familyPage.buttonLabel}
        title={content.familyPage.buttonText}
      >
        <span className="heart-btn__icon" aria-hidden="true">
          ♥
        </span>
        <span className="heart-btn__text">{content.familyPage.buttonText}</span>
      </button>

      {isOpen && (
        <div
          ref={overlayRef}
          className="heart-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={content.familyPage.overlayLabel}
        >
          <div className="heart-overlay__header">
            <button
              className="heart-overlay__close"
              onClick={() => setIsOpen(false)}
              aria-label={content.familyPage.closeLabel}
            >
              ✕
            </button>
          </div>
          <div className="heart-overlay__content">
            <h2 className="heart-overlay__title">{content.familyPage.title}</h2>
            <div className="heart-overlay__image-wrap">
              <img
                src={assetUrl('/photos/familia/familia.png')}
                alt={content.familyPage.imageAlt}
                className="heart-overlay__image"
              />
            </div>
            <div className="heart-overlay__message">
              {content.familyPage.message.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
