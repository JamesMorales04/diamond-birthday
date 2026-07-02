import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameSnake from './GameSnake';
import { content } from '../content/page';

describe('GameSnake', () => {
  const onBack = vi.fn();

  beforeEach(() => {
    onBack.mockClear();
  });

  it('renders the game title from centralized content', () => {
    render(<GameSnake onBack={onBack} />);
    expect(screen.getByText(content.gameSnake.title)).toBeInTheDocument();
  });

  it('renders the back button with the centralized aria-label', () => {
    render(<GameSnake onBack={onBack} />);
    expect(screen.getByLabelText(content.gameSnake.backLabel)).toBeInTheDocument();
  });

  it('renders the canvas wrapper with the centralized aria-label', () => {
    render(<GameSnake onBack={onBack} />);
    expect(screen.getByLabelText(content.gameSnake.ariaLabel)).toBeInTheDocument();
  });

  it('renders the hint from centralized content', () => {
    render(<GameSnake onBack={onBack} />);
    expect(screen.getByText(content.gameSnake.hint)).toBeInTheDocument();
  });

  it('calls onBack when the back button is clicked', async () => {
    const user = userEvent.setup();
    render(<GameSnake onBack={onBack} />);

    await user.click(screen.getByLabelText(content.gameSnake.backLabel));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('renders a canvas element inside the game wrapper', () => {
    render(<GameSnake onBack={onBack} />);

    const wrapper = screen.getByLabelText(content.gameSnake.ariaLabel);
    const canvas = wrapper.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('does not throw when arrow keys are pressed', () => {
    render(<GameSnake onBack={onBack} />);

    // Pressing an arrow key should not throw (starts the game)
    fireEvent.keyDown(document, { key: 'ArrowRight' });

    // Component should still be rendered
    expect(screen.getByText(content.gameSnake.title)).toBeInTheDocument();
  });
});
