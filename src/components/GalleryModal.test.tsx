import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GalleryModal from './GalleryModal';
import { content } from '../content/page';
import { tpl } from '../utils/tpl';

const baseImage = {
  id: 'test-1',
  src: '/photos/test.svg',
  thumb: '/photos/test.svg',
  alt: 'Test image description',
  caption: 'A meaningful caption',
  category: 'journey',
};

beforeEach(() => {
  document.body.style.overflow = '';
});

describe('GalleryModal', () => {
  /* ---------- rendering ---------- */

  it('renders the dialog with image caption and close button', () => {
    render(
      <GalleryModal
        image={baseImage}
        hasPrev={false}
        hasNext={false}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');

    expect(screen.getByText('A meaningful caption')).toBeInTheDocument();
    expect(
      screen.getByLabelText(content.galleryModal.closeViewer),
    ).toBeInTheDocument();
  });

  it('shows the photo counter when total and index are provided', () => {
    render(
      <GalleryModal
        image={baseImage}
        total={8}
        index={2}
        hasPrev
        hasNext
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.getByText(
        tpl(content.galleryModal.ofTemplate, { current: 3, total: 8 }),
      ),
    ).toBeInTheDocument();
  });

  it('renders prev / next nav buttons only when hasPrev / hasNext is true', () => {
    const { rerender } = render(
      <GalleryModal
        image={baseImage}
        hasPrev
        hasNext
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.getByLabelText(content.galleryModal.prevPhoto),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(content.galleryModal.nextPhoto),
    ).toBeInTheDocument();

    rerender(
      <GalleryModal
        image={baseImage}
        hasPrev={false}
        hasNext={false}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(
      screen.queryByLabelText(content.galleryModal.prevPhoto),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(content.galleryModal.nextPhoto),
    ).not.toBeInTheDocument();
  });

  /* ---------- keyboard navigation ---------- */

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(
      <GalleryModal
        image={baseImage}
        hasPrev
        hasNext
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onClose={onClose}
      />,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onPrev when ArrowLeft is pressed and hasPrev is true', () => {
    const onPrev = vi.fn();
    render(
      <GalleryModal
        image={baseImage}
        hasPrev
        hasNext
        onPrev={onPrev}
        onNext={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(onPrev).toHaveBeenCalledOnce();
  });

  it('calls onNext when ArrowRight is pressed and hasNext is true', () => {
    const onNext = vi.fn();
    render(
      <GalleryModal
        image={baseImage}
        hasPrev
        hasNext
        onPrev={vi.fn()}
        onNext={onNext}
        onClose={vi.fn()}
      />,
    );

    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('does not call onPrev when hasPrev is false and ArrowLeft is pressed', () => {
    const onPrev = vi.fn();
    render(
      <GalleryModal
        image={baseImage}
        hasPrev={false}
        hasNext
        onPrev={onPrev}
        onNext={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(onPrev).not.toHaveBeenCalled();
  });

  it('does not call onNext when hasNext is false and ArrowRight is pressed', () => {
    const onNext = vi.fn();
    render(
      <GalleryModal
        image={baseImage}
        hasPrev
        hasNext={false}
        onPrev={vi.fn()}
        onNext={onNext}
        onClose={vi.fn()}
      />,
    );

    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(onNext).not.toHaveBeenCalled();
  });

  /* ---------- focus trap ---------- */

  it('wraps Tab focus between close button and next button', async () => {
    render(
      <GalleryModal
        image={baseImage}
        total={5}
        index={0}
        hasPrev={false}
        hasNext
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const closeBtn = screen.getByLabelText(content.galleryModal.closeViewer);
    const nextBtn = screen.getByLabelText(content.galleryModal.nextPhoto);

    closeBtn.focus();
    expect(document.activeElement).toBe(closeBtn);

    // Tab forward: close → next
    await userEvent.tab();
    expect(document.activeElement).toBe(nextBtn);

    // Tab forward again: next → wraps to close
    await userEvent.tab();
    expect(document.activeElement).toBe(closeBtn);
  });

  it('wraps Shift+Tab focus backwards', async () => {
    render(
      <GalleryModal
        image={baseImage}
        hasPrev={false}
        hasNext
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const closeBtn = screen.getByLabelText(content.galleryModal.closeViewer);
    const nextBtn = screen.getByLabelText(content.galleryModal.nextPhoto);

    closeBtn.focus();
    expect(document.activeElement).toBe(closeBtn);

    // Shift+Tab: close → wraps to next
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(nextBtn);
  });

  /* ---------- backdrop click ---------- */

  it('calls onClose when backdrop is clicked (not a child)', async () => {
    const onClose = vi.fn();
    render(
      <GalleryModal
        image={baseImage}
        hasPrev
        hasNext
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onClose={onClose}
      />,
    );

    const overlay = screen.getByRole('dialog');
    await userEvent.click(overlay);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not double-fire onClose when a child button is clicked', async () => {
    const onClose = vi.fn();
    render(
      <GalleryModal
        image={baseImage}
        hasPrev
        hasNext
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onClose={onClose}
      />,
    );

    // Click the close button (child). It has its own onClick → onClose fires.
    // But the backdrop click handler must not also fire.
    await userEvent.click(
      screen.getByLabelText(content.galleryModal.closeViewer),
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  /* ---------- image loading states ---------- */

  it('shows a spinner while the image is loading and removes it on load', () => {
    render(
      <GalleryModal
        image={baseImage}
        hasPrev={false}
        hasNext={false}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    // Spinner is present before load
    const spinner = document.querySelector('.gallery-modal__spinner');
    expect(spinner).toBeInTheDocument();

    // Fire load event on the image → spinner disappears
    const img = document.querySelector('.gallery-modal__img');
    expect(img).toBeInTheDocument();
    fireEvent.load(img!);
    expect(
      document.querySelector('.gallery-modal__spinner'),
    ).not.toBeInTheDocument();
  });

  it('shows an error state when the image fails to load and clears the spinner', () => {
    render(
      <GalleryModal
        image={baseImage}
        hasPrev={false}
        hasNext={false}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    // Before error: spinner is visible
    expect(
      document.querySelector('.gallery-modal__spinner'),
    ).toBeInTheDocument();

    // Fire error on the image
    const img = document.querySelector('.gallery-modal__img');
    expect(img).toBeInTheDocument();
    fireEvent.error(img!);

    // Spinner is gone
    expect(
      document.querySelector('.gallery-modal__spinner'),
    ).not.toBeInTheDocument();

    // Error message appears with role="alert"
    const errorEl = screen.getByRole('alert');
    expect(errorEl).toBeInTheDocument();
    expect(errorEl).toHaveTextContent(content.galleryModal.loadError);
    // The image is no longer rendered
    expect(
      document.querySelector('.gallery-modal__img'),
    ).not.toBeInTheDocument();
  });

  it('resets loaded and error states when the image prop changes', () => {
    const { rerender } = render(
      <GalleryModal
        image={baseImage}
        hasPrev={false}
        hasNext={false}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    // Simulate successful load
    fireEvent.load(document.querySelector('.gallery-modal__img')!);
    expect(
      document.querySelector('.gallery-modal__spinner'),
    ).not.toBeInTheDocument();

    const nextImage = { ...baseImage, id: 'test-2', src: '/photos/test2.svg' };

    rerender(
      <GalleryModal
        image={nextImage}
        hasPrev={false}
        hasNext={false}
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    // State should have reset: spinner is back, no error yet
    expect(
      document.querySelector('.gallery-modal__spinner'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  /* ---------- body scroll ---------- */

  it('sets body overflow to hidden when mounted', () => {
    render(
      <GalleryModal
        image={baseImage}
        hasPrev
        hasNext
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body overflow when unmounted', () => {
    const { unmount } = render(
      <GalleryModal
        image={baseImage}
        hasPrev
        hasNext
        onPrev={vi.fn()}
        onNext={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    unmount();
    expect(document.body.style.overflow).toBe('');
  });
});
