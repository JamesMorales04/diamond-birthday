import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Gallery from './Gallery';
import { content } from '../content/page';
import { tpl } from '../utils/tpl';

// Fixture data must be in vi.hoisted() so it is available before vi.mock's
// factory runs (vi.mock is hoisted above static imports).
const fixture = vi.hoisted(() => {
  const categories = [
    { id: 'journey', name: 'Nuestro Viaje', description: 'El comienzo de todo' },
    { id: 'adventures', name: 'Aventuras', description: 'Nuestras aventuras' },
    { id: 'home', name: 'Hogar', description: 'Nuestro hogar' },
  ] as const;

  const images = [
    { id: 'j1', src: '/test/j1.jpg', thumb: '/test/j1.jpg', alt: 'Viaje 1', caption: 'Primer viaje', category: 'journey' },
    { id: 'j2', src: '/test/j2.jpg', thumb: '/test/j2.jpg', alt: 'Viaje 2', category: 'journey' },
    { id: 'a1', src: '/test/a1.jpg', thumb: '/test/a1.jpg', alt: 'Aventura 1', caption: 'Aventura en la playa', category: 'adventures' },
    { id: 'a2', src: '/test/a2.jpg', thumb: '/test/a2.jpg', alt: 'Aventura 2', category: 'adventures' },
    { id: 'a3', src: '/test/a3.jpg', thumb: '/test/a3.jpg', alt: 'Aventura 3', category: 'adventures' },
    { id: 'h1', src: '/test/h1.jpg', thumb: '/test/h1.jpg', alt: 'Hogar 1', category: 'home' },
    { id: 'h2', src: '/test/h2.jpg', thumb: '/test/h2.jpg', alt: 'Hogar 2', caption: 'Nuestra casita', category: 'home' },
    { id: 'h3', src: '/test/h3.jpg', thumb: '/test/h3.jpg', alt: 'Hogar 3', category: 'home' },
  ];

  const counts: Record<string, number> = {
    all: images.length,
  };
  for (const img of images) {
    counts[img.category] = (counts[img.category] ?? 0) + 1;
  }

  return { categories, images, counts };
});

// Use a small, deterministic fixture instead of the full 102-image dataset.
vi.mock('../data/gallery', () => ({
  galleryImages: fixture.images,
  galleryCategories: fixture.categories,
}));

function labelForImage(alt: string): string {
  return tpl(content.gallery.openPhotoTemplate, { alt });
}

describe('Gallery', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  /* ---------- rendering ---------- */

  it('renders the gallery section title from centralized content', () => {
    render(<Gallery />);
    expect(screen.getByText(content.gallery.title)).toBeInTheDocument();
  });

  it('renders the gallery subtitle from centralized content', () => {
    render(<Gallery />);
    expect(screen.getByText(content.gallery.subtitle)).toBeInTheDocument();
  });

  it('renders the "All" tab button from centralized content', () => {
    render(<Gallery />);
    expect(screen.getByText(content.gallery.allTab)).toBeInTheDocument();
  });

  it('renders category tab buttons from the fixture dataset', () => {
    render(<Gallery />);
    for (const cat of fixture.categories) {
      expect(screen.getByText(cat.name)).toBeInTheDocument();
    }
  });

  it('renders all category tab buttons plus the All tab (total = categories + 1)', () => {
    render(<Gallery />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(fixture.categories.length + 1); // +1 for 'Todos'
  });

  it('renders the tablist with the centralized label', () => {
    render(<Gallery />);
    expect(
      screen.getByLabelText(content.gallery.tablistLabel),
    ).toBeInTheDocument();
  });

  it('renders image thumbnails with aria-labels from the centralized template', () => {
    render(<Gallery />);
    for (const img of fixture.images) {
      expect(screen.getByLabelText(labelForImage(img.alt))).toBeInTheDocument();
    }
  });

  it('renders captions for images that have them, and omits them for images without', () => {
    render(<Gallery />);
    const imagesWithCaption = fixture.images.filter((i) => i.caption);
    const imagesWithoutCaption = fixture.images.filter((i) => !i.caption);

    // Images with captions should show their caption text
    for (const img of imagesWithCaption) {
      expect(screen.getByText(img.caption!)).toBeInTheDocument();
    }

    // Images without captions should NOT render a caption
    for (const img of imagesWithoutCaption) {
      const thumb = screen.getByLabelText(labelForImage(img.alt));
      // Verify no caption element exists within this thumbnail
      expect(
        thumb.querySelector('.gallery__caption'),
      ).not.toBeInTheDocument();
    }
  });

  /* ---------- interaction ---------- */

  it('shows all images when "Todos" tab is active', () => {
    render(<Gallery />);
    const thumbs = screen.getAllByRole('button', { name: /Abrir recuerdo:/ });
    expect(thumbs).toHaveLength(fixture.counts.all);
  });

  it('filters images when a category tab is clicked', async () => {
    const user = userEvent.setup();

    render(<Gallery />);

    // Click the first category tab
    const firstCategory = fixture.categories[0];
    await user.click(screen.getByText(firstCategory.name));

    const filteredThumbs = screen.getAllByRole('button', {
      name: /Abrir recuerdo:/,
    });
    expect(filteredThumbs).toHaveLength(
      fixture.counts[firstCategory.id],
    );

    // The "Todos" tab should be unselected
    expect(screen.getByText(content.gallery.allTab)).toHaveAttribute(
      'aria-selected',
      'false',
    );

    // The active category tab should be selected
    expect(screen.getByText(firstCategory.name)).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('switches between categories and shows updated image counts', async () => {
    const user = userEvent.setup();

    render(<Gallery />);

    for (const cat of fixture.categories) {
      await user.click(screen.getByText(cat.name));
      const thumbs = screen.getAllByRole('button', {
        name: /Abrir recuerdo:/,
      });
      expect(thumbs).toHaveLength(fixture.counts[cat.id]);
    }
  });

  it('opens the modal viewer when a thumbnail is clicked', async () => {
    const user = userEvent.setup();

    render(<Gallery />);

    // Click the first thumbnail
    const firstThumb = screen.getByLabelText(labelForImage(fixture.images[0].alt));
    await user.click(firstThumb);

    // Modal dialog should be visible with correct image info
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    // Close the modal
    const closeBtn = screen.getByLabelText(content.galleryModal.closeViewer);
    await user.click(closeBtn);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('navigates prev/next within the modal in the integrated Gallery flow', async () => {
    const user = userEvent.setup();

    render(<Gallery />);

    const total = fixture.counts.all;

    // Open modal from the first thumbnail
    await user.click(
      screen.getByLabelText(labelForImage(fixture.images[0].alt)),
    );

    const dialogLabel = () =>
      screen.getByRole('dialog').getAttribute('aria-label');

    // Initially on image 1 of N
    expect(dialogLabel()).toBe(
      tpl(content.galleryModal.photoAriaLabel, {
        index: '1',
        total: String(total),
      }),
    );

    // Navigate next → image 2 of N
    await user.click(screen.getByLabelText(content.galleryModal.nextPhoto));
    expect(dialogLabel()).toBe(
      tpl(content.galleryModal.photoAriaLabel, {
        index: '2',
        total: String(total),
      }),
    );

    // Navigate next again → image 3 of N
    await user.click(screen.getByLabelText(content.galleryModal.nextPhoto));
    expect(dialogLabel()).toBe(
      tpl(content.galleryModal.photoAriaLabel, {
        index: '3',
        total: String(total),
      }),
    );

    // Navigate prev → image 2 of N again
    await user.click(screen.getByLabelText(content.galleryModal.prevPhoto));
    expect(dialogLabel()).toBe(
      tpl(content.galleryModal.photoAriaLabel, {
        index: '2',
        total: String(total),
      }),
    );

    // Navigate prev twice more → wrapping: 2 → 1 → last (total)
    await user.click(screen.getByLabelText(content.galleryModal.prevPhoto));
    await user.click(screen.getByLabelText(content.galleryModal.prevPhoto));
    expect(dialogLabel()).toBe(
      tpl(content.galleryModal.photoAriaLabel, {
        index: String(total),
        total: String(total),
      }),
    );

    // Navigate next once → wrapping: last → first
    await user.click(screen.getByLabelText(content.galleryModal.nextPhoto));
    expect(dialogLabel()).toBe(
      tpl(content.galleryModal.photoAriaLabel, {
        index: '1',
        total: String(total),
      }),
    );
  });

  it('navigates photos with keyboard ArrowRight and ArrowLeft in the integrated Gallery flow', async () => {
    const user = userEvent.setup();

    render(<Gallery />);

    const total = fixture.counts.all;

    // Open modal from the second thumbnail (index 1)
    await user.click(
      screen.getByLabelText(labelForImage(fixture.images[1].alt)),
    );

    const dialogLabel = () =>
      screen.getByRole('dialog').getAttribute('aria-label');

    // Initially on image 2 of N
    expect(dialogLabel()).toBe(
      tpl(content.galleryModal.photoAriaLabel, {
        index: '2',
        total: String(total),
      }),
    );

    // ArrowRight → image 3 of N
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(dialogLabel()).toBe(
      tpl(content.galleryModal.photoAriaLabel, {
        index: '3',
        total: String(total),
      }),
    );

    // ArrowLeft → image 2 of N
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(dialogLabel()).toBe(
      tpl(content.galleryModal.photoAriaLabel, {
        index: '2',
        total: String(total),
      }),
    );
  });

  /* ---------- error handling ---------- */

  it('toggles placeholder visibility on thumbnail image load and error', () => {
    render(<Gallery />);

    // Initially every thumbnail shows a placeholder (✦)
    expect(screen.queryAllByText('✦')).toHaveLength(fixture.images.length);

    // Fire load on the first image — placeholder disappears for that image
    fireEvent.load(screen.getByAltText(fixture.images[0].alt));
    expect(screen.queryAllByText('✦')).toHaveLength(fixture.images.length - 1);

    // Fire error on the same image — placeholder reappears
    fireEvent.error(screen.getByAltText(fixture.images[0].alt));
    expect(screen.queryAllByText('✦')).toHaveLength(fixture.images.length);
  });

  it('handles image load error gracefully without crashing', () => {
    render(<Gallery />);

    // Simulate error on every thumbnail image
    for (const img of fixture.images) {
      const imgEl = screen.getByAltText(img.alt);
      fireEvent.error(imgEl);
    }

    // All thumbnails still render
    const thumbs = screen.getAllByRole('button', { name: /Abrir recuerdo:/ });
    expect(thumbs).toHaveLength(fixture.images.length);
  });
});
