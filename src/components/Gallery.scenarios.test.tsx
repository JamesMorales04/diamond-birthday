import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { content } from '../content/page';

describe('Gallery error state', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  it('shows error title and description when gallery images data is empty', async () => {
    vi.resetModules();
    vi.doMock('../data/gallery', () => ({
      galleryImages: [],
      galleryCategories: [{ id: 'test', name: 'Test', description: '' }],
    }));

    const { default: GalleryLocal } = await import('./Gallery');
    render(<GalleryLocal />);

    expect(screen.getByText(content.gallery.errorTitle)).toBeInTheDocument();
    expect(screen.getByText(content.gallery.errorDesc)).toBeInTheDocument();
  });
});

describe('Gallery empty category', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  it('shows empty category message when no images match the selected category', async () => {
    vi.resetModules();
    vi.doMock('../data/gallery', () => ({
      galleryImages: [
        {
          id: 'j1',
          src: '',
          thumb: '',
          alt: 'test',
          caption: 'test',
          category: 'journey',
        },
      ],
      galleryCategories: [
        { id: 'journey', name: 'Nuestro Viaje', description: '' },
        { id: 'other', name: 'Other Cat', description: '' },
      ],
    }));

    const { default: GalleryLocal } = await import('./Gallery');
    render(<GalleryLocal />);

    fireEvent.click(screen.getByText('Other Cat'));

    expect(screen.getByText(content.gallery.emptyCategory)).toBeInTheDocument();
  });
});
