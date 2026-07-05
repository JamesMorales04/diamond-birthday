import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MemoriesButton from './MemoriesButton';
import { content } from '../content/page';

describe('MemoriesButton', () => {
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

  it('returns focus to the trigger button after closing via close button', async () => {
    const user = userEvent.setup();
    render(<MemoriesButton />);

    const trigger = screen.getByLabelText(content.memoriesButton.buttonLabel);
    await user.click(trigger);
    expect(
      screen.getByLabelText(content.memoriesButton.overlayLabel),
    ).toBeInTheDocument();

    await user.click(screen.getByLabelText(content.memoriesButton.closeLabel));
    expect(
      screen.queryByLabelText(content.memoriesButton.overlayLabel),
    ).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });

  it('returns focus to the trigger button after closing via Escape', async () => {
    const user = userEvent.setup();
    render(<MemoriesButton />);

    const trigger = screen.getByLabelText(content.memoriesButton.buttonLabel);
    await user.click(trigger);
    expect(
      screen.getByLabelText(content.memoriesButton.overlayLabel),
    ).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(
      screen.queryByLabelText(content.memoriesButton.overlayLabel),
    ).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
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

  it('does not render the overlay initially', () => {
    render(<MemoriesButton />);
    expect(
      screen.queryByLabelText(content.memoriesButton.overlayLabel),
    ).not.toBeInTheDocument();
  });

  it('moves focus to the close button when the overlay opens', async () => {
    const user = userEvent.setup();
    render(<MemoriesButton />);

    await user.click(screen.getByLabelText(content.memoriesButton.buttonLabel));

    expect(document.activeElement).toBe(
      screen.getByLabelText(content.memoriesButton.closeLabel),
    );
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

  it('traps Tab focus within the overlay', async () => {
    const user = userEvent.setup();
    render(<MemoriesButton />);

    await user.click(screen.getByLabelText(content.memoriesButton.buttonLabel));

    const overlay = screen.getByLabelText(
      content.memoriesButton.overlayLabel,
    );
    const closeBtn = screen.getByLabelText(content.memoriesButton.closeLabel);
    expect(document.activeElement).toBe(closeBtn);

    // Tab moves to the next focusable element inside the overlay.
    await user.tab();

    expect(overlay.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).not.toBe(closeBtn);
  });

  it('traps Shift+Tab focus within the overlay', async () => {
    const user = userEvent.setup();
    render(<MemoriesButton />);

    await user.click(screen.getByLabelText(content.memoriesButton.buttonLabel));

    const overlay = screen.getByLabelText(
      content.memoriesButton.overlayLabel,
    );
    const closeBtn = screen.getByLabelText(content.memoriesButton.closeLabel);
    expect(document.activeElement).toBe(closeBtn);

    // Shift+Tab from the first element wraps to the last focusable element.
    await user.tab({ shift: true });

    expect(overlay.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).not.toBe(closeBtn);
  });
});
