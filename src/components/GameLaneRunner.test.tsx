import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameLaneRunner from './GameLaneRunner';
import { content } from '../content/page';

describe('GameLaneRunner', () => {
  const onBack = vi.fn();

  beforeEach(() => {
    onBack.mockClear();
  });

  it('renders the game title from centralized content', () => {
    render(<GameLaneRunner onBack={onBack} />);
    expect(screen.getByText(content.gameLaneRunner.title)).toBeInTheDocument();
  });

  it('renders the back button with the centralized aria-label', () => {
    render(<GameLaneRunner onBack={onBack} />);
    expect(screen.getByLabelText(content.gameLaneRunner.backLabel)).toBeInTheDocument();
  });

  it('renders the canvas wrapper with the centralized aria-label', () => {
    render(<GameLaneRunner onBack={onBack} />);
    expect(screen.getByLabelText(content.gameLaneRunner.ariaLabel)).toBeInTheDocument();
  });

  it('renders the hint from centralized content', () => {
    render(<GameLaneRunner onBack={onBack} />);
    expect(screen.getByText(content.gameLaneRunner.hint)).toBeInTheDocument();
  });

  it('renders the move left button with the centralized aria-label', () => {
    render(<GameLaneRunner onBack={onBack} />);
    expect(screen.getByLabelText(content.gameLaneRunner.moveLeft)).toBeInTheDocument();
  });

  it('renders the move right button with the centralized aria-label', () => {
    render(<GameLaneRunner onBack={onBack} />);
    expect(screen.getByLabelText(content.gameLaneRunner.moveRight)).toBeInTheDocument();
  });

  it('renders the controls hint text', () => {
    render(<GameLaneRunner onBack={onBack} />);
    expect(screen.getByText(content.gameLaneRunner.controlsHint)).toBeInTheDocument();
  });

  it('calls onBack when the back button is clicked', async () => {
    const user = userEvent.setup();
    render(<GameLaneRunner onBack={onBack} />);

    await user.click(screen.getByLabelText(content.gameLaneRunner.backLabel));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('renders a canvas element inside the game wrapper', () => {
    render(<GameLaneRunner onBack={onBack} />);

    const wrapper = screen.getByLabelText(content.gameLaneRunner.ariaLabel);
    const canvas = wrapper.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('does not throw when move buttons are clicked', async () => {
    const user = userEvent.setup();
    render(<GameLaneRunner onBack={onBack} />);

    await user.click(screen.getByLabelText(content.gameLaneRunner.moveLeft));
    await user.click(screen.getByLabelText(content.gameLaneRunner.moveRight));

    // Component should still be rendered
    expect(screen.getByText(content.gameLaneRunner.title)).toBeInTheDocument();
  });
});
