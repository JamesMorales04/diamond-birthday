import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameFlappy from './GameFlappy';
import { content } from '../content/page';

describe('GameFlappy', () => {
  const onBack = vi.fn();

  beforeEach(() => {
    onBack.mockClear();
  });

  it('renders the game title from centralized content', () => {
    render(<GameFlappy onBack={onBack} />);
    expect(screen.getByText(content.gameFlappy.title)).toBeInTheDocument();
  });

  it('renders the back button with the centralized aria-label', () => {
    render(<GameFlappy onBack={onBack} />);
    expect(screen.getByLabelText(content.gameFlappy.backLabel)).toBeInTheDocument();
  });

  it('renders the canvas wrapper with the centralized aria-label', () => {
    render(<GameFlappy onBack={onBack} />);
    expect(screen.getByLabelText(content.gameFlappy.ariaLabel)).toBeInTheDocument();
  });

  it('renders the idle hint from centralized content', () => {
    render(<GameFlappy onBack={onBack} />);
    expect(screen.getByText(content.gameFlappy.hint.idle)).toBeInTheDocument();
  });

  it('calls onBack when the back button is clicked', async () => {
    const user = userEvent.setup();
    render(<GameFlappy onBack={onBack} />);

    await user.click(screen.getByLabelText(content.gameFlappy.backLabel));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('renders a canvas element inside the game wrapper', () => {
    render(<GameFlappy onBack={onBack} />);

    const wrapper = screen.getByLabelText(content.gameFlappy.ariaLabel);
    const canvas = wrapper.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('does not throw when the canvas wrapper area is clicked', async () => {
    const user = userEvent.setup();
    render(<GameFlappy onBack={onBack} />);

    await user.click(screen.getByLabelText(content.gameFlappy.ariaLabel));

    // Component should still be mounted and render the title
    expect(screen.getByText(content.gameFlappy.title)).toBeInTheDocument();
  });
});
