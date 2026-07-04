import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MemoriesButton from './MemoriesButton';
import { content } from '../content/page';

describe('MemoriesButton', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('renders the trigger button with the centralized text', () => {
    render(<MemoriesButton />);
    expect(
      screen.getByText(content.memoriesButton.buttonText),
    ).toBeInTheDocument();
  });

  it('renders the trigger button with the centralized aria-label', () => {
    render(<MemoriesButton />);
    expect(
      screen.getByLabelText(content.memoriesButton.buttonLabel),
    ).toBeInTheDocument();
  });

  it('shows the overlay when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<MemoriesButton />);

    await user.click(screen.getByLabelText(content.memoriesButton.buttonLabel));

    expect(
      screen.getByLabelText(content.memoriesButton.overlayLabel),
    ).toBeInTheDocument();
  });

  it('renders the close button inside the overlay with the centralized label', async () => {
    const user = userEvent.setup();
    render(<MemoriesButton />);

    await user.click(screen.getByLabelText(content.memoriesButton.buttonLabel));

    expect(
      screen.getByLabelText(content.memoriesButton.closeLabel),
    ).toBeInTheDocument();
  });

  it('hides the overlay when the close button is clicked', async () => {
    const user = userEvent.setup();
    render(<MemoriesButton />);

    await user.click(screen.getByLabelText(content.memoriesButton.buttonLabel));
    expect(
      screen.getByLabelText(content.memoriesButton.overlayLabel),
    ).toBeInTheDocument();

    await user.click(screen.getByLabelText(content.memoriesButton.closeLabel));
    expect(
      screen.queryByLabelText(content.memoriesButton.overlayLabel),
    ).not.toBeInTheDocument();
  });

  it('closes the overlay when Escape is pressed', async () => {
    const user = userEvent.setup();
    render(<MemoriesButton />);

    await user.click(screen.getByLabelText(content.memoriesButton.buttonLabel));
    expect(
      screen.getByLabelText(content.memoriesButton.overlayLabel),
    ).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(
      screen.queryByLabelText(content.memoriesButton.overlayLabel),
    ).not.toBeInTheDocument();
  });

  it('sets body overflow to hidden when overlay opens', async () => {
    const user = userEvent.setup();
    render(<MemoriesButton />);

    await user.click(screen.getByLabelText(content.memoriesButton.buttonLabel));

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body overflow when overlay closes', async () => {
    const user = userEvent.setup();
    render(<MemoriesButton />);

    await user.click(screen.getByLabelText(content.memoriesButton.buttonLabel));
    expect(document.body.style.overflow).toBe('hidden');

    await user.click(screen.getByLabelText(content.memoriesButton.closeLabel));
    expect(document.body.style.overflow).toBe('');
  });
});
