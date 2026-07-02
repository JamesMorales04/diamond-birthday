import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Gallery from './Gallery';
import { content } from '../content/page';
import { galleryImages, galleryCategories } from '../data/gallery';
import { tpl } from '../utils/tpl';

describe('Gallery', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

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

  it('renders category tab buttons from gallery data', () => {
    render(<Gallery />);
    for (const cat of galleryCategories) {
      expect(screen.getByText(cat.name)).toBeInTheDocument();
    }
  });

  it('renders the tablist with the centralized label', () => {
    render(<Gallery />);
    expect(screen.getByLabelText(content.gallery.tablistLabel)).toBeInTheDocument();
  });

  it('renders image thumbnails with aria-labels from the centralized template', () => {
    render(<Gallery />);
    for (const img of galleryImages) {
      const expectedLabel = tpl(content.gallery.openPhotoTemplate, { alt: img.alt });
      expect(screen.getByLabelText(expectedLabel)).toBeInTheDocument();
    }
  });

  it('renders image captions from gallery data', () => {
    render(<Gallery />);
    for (const img of galleryImages) {
      if (img.caption) {
        expect(screen.getByText(img.caption)).toBeInTheDocument();
      }
    }
  });
});
