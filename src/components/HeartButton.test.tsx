import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HeartButton from './HeartButton';
import { content } from '../content/page';

describe('HeartButton', () => {
  // No beforeEach global mock setup needed

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('renders the trigger button with the centralized text', () => {
    render(<HeartButton />);
    expect(screen.getByText(content.familyPage.buttonText)).toBeInTheDocument();
  });

  it('renders the trigger button with the centralized aria-label', () => {
    render(<HeartButton />);
    expect(
      screen.getByLabelText(content.familyPage.buttonLabel),
    ).toBeInTheDocument();
  });

  it('shows the overlay when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<HeartButton />);

    await user.click(screen.getByLabelText(content.familyPage.buttonLabel));

    expect(
      screen.getByLabelText(content.familyPage.overlayLabel),
    ).toBeInTheDocument();
  });

  it('renders the close button inside the overlay with the centralized label', async () => {
    const user = userEvent.setup();
    render(<HeartButton />);

    await user.click(screen.getByLabelText(content.familyPage.buttonLabel));

    expect(
      screen.getByLabelText(content.familyPage.closeLabel),
    ).toBeInTheDocument();
  });

  it('renders the title from centralized content', async () => {
    const user = userEvent.setup();
    render(<HeartButton />);

    await user.click(screen.getByLabelText(content.familyPage.buttonLabel));

    expect(screen.getByText(content.familyPage.title)).toBeInTheDocument();
  });

  it('renders the family message as multiple paragraphs split on \\n\\n', async () => {
    const user = userEvent.setup();
    render(<HeartButton />);

    await user.click(screen.getByLabelText(content.familyPage.buttonLabel));

    const paragraphs =
      document.querySelectorAll('.heart-overlay__message > p');
    const segments = content.familyPage.message.split('\n\n');

    expect(paragraphs).toHaveLength(segments.length);
    paragraphs.forEach((p, i) => {
      expect(p.textContent).toBe(segments[i]);
    });
  });

  it('renders an image with the centralized alt text in the overlay', async () => {
    const user = userEvent.setup();
    render(<HeartButton />);

    await user.click(screen.getByLabelText(content.familyPage.buttonLabel));

    const img = screen.getByAltText(content.familyPage.imageAlt);
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src');
    const src = img.getAttribute('src');
    expect(src).toMatch(/\/photos\/familia\/familia\.png/);
  });

  it('renders the affectionate Spanish message from centralized content', async () => {
    const user = userEvent.setup();
    render(<HeartButton />);

    await user.click(screen.getByLabelText(content.familyPage.buttonLabel));

    const messageContainer = document.querySelector('.heart-overlay__message');
    expect(messageContainer?.textContent).toBe(
      content.familyPage.message.split('\n\n').join(''),
    );
  });

  it('does not render the overlay initially', () => {
    render(<HeartButton />);
    expect(
      screen.queryByLabelText(content.familyPage.overlayLabel),
    ).not.toBeInTheDocument();
  });

  it('moves focus to the close button when the overlay opens', async () => {
    const user = userEvent.setup();
    render(<HeartButton />);

    await user.click(screen.getByLabelText(content.familyPage.buttonLabel));

    expect(document.activeElement).toBe(
      screen.getByLabelText(content.familyPage.closeLabel),
    );
  });

  it('hides the overlay when the close button is clicked', async () => {
    const user = userEvent.setup();
    render(<HeartButton />);

    await user.click(screen.getByLabelText(content.familyPage.buttonLabel));
    expect(
      screen.getByLabelText(content.familyPage.overlayLabel),
    ).toBeInTheDocument();

    await user.click(screen.getByLabelText(content.familyPage.closeLabel));
    expect(
      screen.queryByLabelText(content.familyPage.overlayLabel),
    ).not.toBeInTheDocument();
  });

  it('returns focus to the trigger button after closing via close button', async () => {
    const user = userEvent.setup();
    render(<HeartButton />);

    const trigger = screen.getByLabelText(content.familyPage.buttonLabel);
    await user.click(trigger);
    expect(
      screen.getByLabelText(content.familyPage.overlayLabel),
    ).toBeInTheDocument();

    await user.click(screen.getByLabelText(content.familyPage.closeLabel));
    expect(
      screen.queryByLabelText(content.familyPage.overlayLabel),
    ).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });

  it('returns focus to the trigger button after closing via Escape', async () => {
    const user = userEvent.setup();
    render(<HeartButton />);

    const trigger = screen.getByLabelText(content.familyPage.buttonLabel);
    await user.click(trigger);
    expect(
      screen.getByLabelText(content.familyPage.overlayLabel),
    ).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(
      screen.queryByLabelText(content.familyPage.overlayLabel),
    ).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });

  it('closes the overlay when Escape is pressed', async () => {
    const user = userEvent.setup();
    render(<HeartButton />);

    await user.click(screen.getByLabelText(content.familyPage.buttonLabel));
    expect(
      screen.getByLabelText(content.familyPage.overlayLabel),
    ).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(
      screen.queryByLabelText(content.familyPage.overlayLabel),
    ).not.toBeInTheDocument();
  });

  it('sets body overflow to hidden when overlay opens', async () => {
    const user = userEvent.setup();
    render(<HeartButton />);

    await user.click(screen.getByLabelText(content.familyPage.buttonLabel));

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body overflow when overlay closes', async () => {
    const user = userEvent.setup();
    render(<HeartButton />);

    await user.click(screen.getByLabelText(content.familyPage.buttonLabel));
    expect(document.body.style.overflow).toBe('hidden');

    await user.click(screen.getByLabelText(content.familyPage.closeLabel));
    expect(document.body.style.overflow).toBe('');
  });

  it('traps Tab focus within the overlay', async () => {
    const user = userEvent.setup();
    render(<HeartButton />);

    await user.click(screen.getByLabelText(content.familyPage.buttonLabel));

    const closeBtn = screen.getByLabelText(content.familyPage.closeLabel);
    expect(document.activeElement).toBe(closeBtn);

    // Only the close button is focusable inside the overlay — Tab wraps back.
    await user.tab();
    expect(document.activeElement).toBe(closeBtn);
  });

  it('traps Shift+Tab focus within the overlay', async () => {
    const user = userEvent.setup();
    render(<HeartButton />);

    await user.click(screen.getByLabelText(content.familyPage.buttonLabel));

    const closeBtn = screen.getByLabelText(content.familyPage.closeLabel);
    expect(document.activeElement).toBe(closeBtn);

    // Only the close button is focusable — Shift+Tab also wraps back.
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(closeBtn);
  });
});
