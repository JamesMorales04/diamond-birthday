import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Timeline from './Timeline';
import { content } from '../content/page';
import { timeline } from '../data/timeline';

describe('Timeline', () => {
  it('renders the timeline section title from centralized content', () => {
    render(<Timeline />);
    expect(screen.getByText(content.timeline.title)).toBeInTheDocument();
  });

  it('renders the timeline subtitle from centralized content', () => {
    render(<Timeline />);
    expect(screen.getByText(content.timeline.subtitle)).toBeInTheDocument();
  });

  it('renders all timeline entries from data', () => {
    render(<Timeline />);
    for (const entry of timeline) {
      expect(screen.getByText(entry.title)).toBeInTheDocument();
      expect(screen.getByText(entry.description)).toBeInTheDocument();
    }
  });

  it('renders the year for each timeline entry (accepting duplicates)', () => {
    render(<Timeline />);
    // Use getAllByText for each unique year; years can repeat (e.g. 2017 appears 3×)
    const uniqueYears = [...new Set(timeline.map((e) => e.year))];
    for (const year of uniqueYears) {
      const occurrences = timeline.filter((e) => e.year === year).length;
      expect(screen.getAllByText(year)).toHaveLength(occurrences);
    }
  });
});
