import { useState, useMemo } from 'react';
import {
  galleryImages,
  galleryCategories,
  type GalleryImage,
} from '../data/gallery';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { assetUrl } from '../utils/assets';
import GalleryModal from './GalleryModal';
import { content } from '../content/page';
import { tpl } from '../utils/tpl';

function GalleryThumbnail({
  image,
  index,
  onOpen,
}: {
  image: GalleryImage;
  index: number;
  onOpen: (id: string) => void;
}) {
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
  });
  const [loaded, setLoaded] = useState(false);

  return (
    <button
      ref={ref}
      className={`gallery__thumb ${isVisible ? 'gallery__thumb--visible' : ''}`}
      onClick={() => onOpen(image.id)}
      aria-label={tpl(content.gallery.openPhotoTemplate, { alt: image.alt })}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <div className="gallery__thumb-inner">
        {isVisible && (
          <img
            src={assetUrl(image.thumb)}
            alt={image.alt}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(false)}
            className={`gallery__img ${loaded ? 'gallery__img--loaded' : ''}`}
          />
        )}
        {!loaded && isVisible && (
          <div className="gallery__placeholder" aria-hidden="true">
            <span>✦</span>
          </div>
        )}
        {image.caption && (
          <div className="gallery__caption">
            <span>{image.caption}</span>
          </div>
        )}
      </div>
    </button>
  );
}

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [modalImageId, setModalImageId] = useState<string | null>(null);
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.05,
    triggerOnce: true,
  });

  // Data-failure state: gallery source is empty or unavailable
  const hasImages = galleryImages.length > 0;

  const filtered = useMemo(
    () =>
      !hasImages
        ? []
        : activeCategory === 'all'
          ? galleryImages
          : galleryImages.filter((img) => img.category === activeCategory),
    [activeCategory, hasImages],
  );

  const currentIndex = useMemo(
    () => filtered.findIndex((img) => img.id === modalImageId),
    [modalImageId, filtered],
  );

  const handleOpen = (id: string) => setModalImageId(id);
  const handleClose = () => setModalImageId(null);

  const handlePrev = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : filtered.length - 1;
    setModalImageId(filtered[newIndex]?.id ?? null);
  };

  const handleNext = () => {
    const newIndex = currentIndex < filtered.length - 1 ? currentIndex + 1 : 0;
    setModalImageId(filtered[newIndex]?.id ?? null);
  };

  const currentImage = modalImageId ? filtered[currentIndex] : null;

  // Tabpanel id for aria-controls linkage
  const tabpanelId = 'gallery-tabpanel';

  return (
    <section
      ref={ref}
      className={`section gallery ${isVisible ? 'gallery--visible' : ''}`}
      aria-labelledby="gallery-title"
    >
      <h2 id="gallery-title" className="section__title">
        {content.gallery.title}
      </h2>
      <p className="section__subtitle">{content.gallery.subtitle}</p>

      {!hasImages ? (
        <div className="gallery__error" role="alert">
          <span className="gallery__error-icon" aria-hidden="true">
            ✦
          </span>
          <p className="gallery__error-title">{content.gallery.errorTitle}</p>
          <p className="gallery__error-desc">{content.gallery.errorDesc}</p>
        </div>
      ) : (
        <>
          <div
            className="gallery__categories"
            role="tablist"
            aria-label={content.gallery.tablistLabel}
          >
            <button
              id="gallery-tab-all"
              className={`gallery__cat-btn ${activeCategory === 'all' ? 'gallery__cat-btn--active' : ''}`}
              onClick={() => setActiveCategory('all')}
              role="tab"
              aria-selected={activeCategory === 'all'}
              aria-controls={tabpanelId}
            >
              {content.gallery.allTab}
            </button>
            {galleryCategories.map((cat) => (
              <button
                key={cat.id}
                id={`gallery-tab-${cat.id}`}
                className={`gallery__cat-btn ${activeCategory === cat.id ? 'gallery__cat-btn--active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
                role="tab"
                aria-selected={activeCategory === cat.id}
                aria-controls={tabpanelId}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="gallery__empty" role="status">
              <p>{content.gallery.emptyCategory}</p>
            </div>
          ) : (
            <div
              id={tabpanelId}
              className="gallery__grid"
              role="tabpanel"
              aria-labelledby={`gallery-tab-${activeCategory}`}
            >
              {filtered.map((image, i) => (
                <GalleryThumbnail
                  key={image.id}
                  image={image}
                  index={i}
                  onOpen={handleOpen}
                />
              ))}
            </div>
          )}
        </>
      )}

      {currentImage && (
        <GalleryModal
          image={currentImage}
          total={filtered.length}
          index={currentIndex}
          hasPrev={filtered.length > 1}
          hasNext={filtered.length > 1}
          onPrev={handlePrev}
          onNext={handleNext}
          onClose={handleClose}
        />
      )}
    </section>
  );
}
