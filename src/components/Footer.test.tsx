import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';
import { content } from '../content/page';

describe('Footer', () => {
  it('renders the footer with contentinfo role', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('renders the first footer line from centralized content', () => {
    render(<Footer />);
    expect(screen.getByText(content.footer.line1)).toBeInTheDocument();
  });

  it('renders the second footer line from centralized content', () => {
    render(<Footer />);
    expect(screen.getByText(content.footer.line2)).toBeInTheDocument();
  });

  it('renders the current year', () => {
    render(<Footer />);
    expect(screen.getByText('2026')).toBeInTheDocument();
  });
});
