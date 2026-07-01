import { useEffect, useCallback, useRef, useState } from 'react';
import { useSwipe } from '../hooks/useSwipe';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { assetUrl } from '../utils/assets';
import type { GalleryImage } from '../data/gallery';

interface GalleryModalProps {
  image: GalleryImage;
  total?: number;
  index?: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}

export default function GalleryModal({
  image,
  total,
  index,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onClose,
}: GalleryModalProps) {
  const reducedMotion = useReducedMotion();
  const [loaded, setLoaded] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const captionId = `gallery-caption-${image.id}`;

  // Reset loaded state when image changes
  useEffect(() => {
    setLoaded(false);
  }, [image.id]);

  // Focus trap and escape key
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'ArrowLeft' && hasPrev) {
        onPrev();
        e.preventDefault();
      }
      if (e.key === 'ArrowRight' && hasNext) {
        onNext();
        e.preventDefault();
      }

      // Focus trap
      if (e.key === 'Tab') {
        const focusable = dialog.querySelectorAll<HTMLElement>(focusableSelector);
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
    dialog.focus();

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  const swipeHandlers = useSwipe(
    {
      onSwipeLeft: hasNext ? onNext : undefined,
      onSwipeRight: hasPrev ? onPrev : undefined,
    },
    { threshold: 60 },
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  return (
    <div
      className="modal-overlay gallery-modal"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index != null ? (index + 1) : ''}${total ? ` of ${total}` : ''}`}
      aria-describedby={captionId}
      ref={dialogRef}
      tabIndex={-1}
    >
      <div className="gallery-modal__container" {...swipeHandlers}>
        <div className="gallery-modal__top">
          <div className="gallery-modal__info">
            {total != null && index != null && (
              <span className="gallery-modal__counter" aria-hidden="true">
                {index + 1} of {total}
              </span>
            )}
            <span id={captionId} className="gallery-modal__caption">
              {image.caption}
            </span>
          </div>
          <button
            className="gallery-modal__close"
            onClick={onClose}
            aria-label="Close photo viewer"
          >
            ✕
          </button>
        </div>

        <div className="gallery-modal__image-wrap">
          {hasPrev && (
            <button
              className="gallery-modal__nav gallery-modal__nav--prev"
              onClick={onPrev}
              aria-label="Previous photo"
            >
              ‹
            </button>
          )}

          <div className="gallery-modal__image">
            {!loaded && (
              <div className="gallery-modal__spinner" aria-hidden="true">
                <span>✦</span>
              </div>
            )}
            <img
              src={assetUrl(image.src)}
              alt={image.alt}
              className={`gallery-modal__img ${loaded ? 'gallery-modal__img--loaded' : ''} ${reducedMotion ? '' : 'gallery-modal__img--fade'}`}
              onLoad={() => setLoaded(true)}
            />
          </div>

          {hasNext && (
            <button
              className="gallery-modal__nav gallery-modal__nav--next"
              onClick={onNext}
              aria-label="Next photo"
            >
              ›
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
