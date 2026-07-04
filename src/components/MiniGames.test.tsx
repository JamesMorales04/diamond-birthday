import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MiniGames from './MiniGames';
import { content } from '../content/page';
import { tpl } from '../utils/tpl';

describe('MiniGames', () => {
  it('renders the mini games section title from centralized content', () => {
    render(<MiniGames />);
    expect(screen.getByText(content.miniGames.title)).toBeInTheDocument();
  });

  it('renders the mini games subtitle from centralized content', () => {
    render(<MiniGames />);
    expect(screen.getByText(content.miniGames.subtitle)).toBeInTheDocument();
  });

  it('renders all game card names from the canonical games array', () => {
    render(<MiniGames />);
    for (const game of content.miniGames.games) {
      expect(screen.getByText(game.name)).toBeInTheDocument();
    }
  });

  it('renders all game card descriptions from the canonical games array', () => {
    render(<MiniGames />);
    for (const game of content.miniGames.games) {
      expect(screen.getByText(game.desc)).toBeInTheDocument();
    }
  });

  it('renders play aria-labels for all game cards from the centralized template', () => {
    render(<MiniGames />);
    for (const game of content.miniGames.games) {
      const expectedLabel = tpl(content.miniGames.playTemplate, {
        name: game.name,
      });
      expect(screen.getByLabelText(expectedLabel)).toBeInTheDocument();
    }
  });

  it('renders the correct number of game cards', () => {
    render(<MiniGames />);
    const expectedCount = content.miniGames.games.length;
    const gameButtons = screen.getAllByRole('button');
    // Each game card is a button; should match the games array length
    expect(gameButtons).toHaveLength(expectedCount);
  });
});
