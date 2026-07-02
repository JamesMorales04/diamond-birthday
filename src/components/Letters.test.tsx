import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Letters from './Letters';
import { content } from '../content/page';
import { letters } from '../data/messages';

describe('Letters', () => {
  it('renders the letters section title from centralized content', () => {
    render(<Letters />);
    expect(screen.getByText(content.letters.title)).toBeInTheDocument();
  });

  it('renders the letters subtitle from centralized content', () => {
    render(<Letters />);
    expect(screen.getByText(content.letters.subtitle)).toBeInTheDocument();
  });

  it('renders all letter titles from data', () => {
    render(<Letters />);
    for (const letter of letters) {
      expect(screen.getByText(letter.title)).toBeInTheDocument();
    }
  });

  it('renders all letter dates from data', () => {
    render(<Letters />);
    for (const letter of letters) {
      expect(screen.getByText(letter.date)).toBeInTheDocument();
    }
  });

  it('renders excerpts for all letters', () => {
    render(<Letters />);
    for (const letter of letters) {
      expect(screen.getByText(letter.excerpt)).toBeInTheDocument();
    }
  });

  it('renders the first letter content by default (open state)', () => {
    render(<Letters />);
    const firstLetter = letters[0];
    // First letter should be open by default; check that some content paragraphs render
    const paragraphs = firstLetter.content.split('\n\n');
    // Each paragraph should be in the document (first paragraph at minimum)
    expect(screen.getByText(paragraphs[0])).toBeInTheDocument();
  });
});
