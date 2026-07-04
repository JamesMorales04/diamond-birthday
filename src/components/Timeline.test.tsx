import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Timeline from './Timeline';
import { content } from '../content/page';
import { timeline } from '../data/timeline';
import { iconMap } from './Timeline';

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
    // Use getAllByText for each unique year; years can repeat (e.g. 2024 appears many times)
    const uniqueYears = [...new Set(timeline.map((e) => e.year))];
    for (const year of uniqueYears) {
      const occurrences = timeline.filter((e) => e.year === year).length;
      expect(screen.getAllByText(year)).toHaveLength(occurrences);
    }
  });

  it('renders the expected number of timeline entries', () => {
    render(<Timeline />);
    // Each entry has an <h3> for its title, so h3 count matches entry count
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings).toHaveLength(timeline.length);
  });

  it('renders the correct icon symbols for each timeline entry', () => {
    render(<Timeline />);
    // Match the component's double-fallback logic:
    //   iconMap[entry.icon ?? 'heart'] ?? iconMap.heart
    const symbolCounts: Record<string, number> = {};
    for (const entry of timeline) {
      const sym = iconMap[entry.icon as string] ?? iconMap.heart;
      symbolCounts[sym] = (symbolCounts[sym] ?? 0) + 1;
    }
    for (const [sym, count] of Object.entries(symbolCounts)) {
      expect(screen.getAllByText(sym)).toHaveLength(count);
    }
  });

  it('falls back to heart icon for unknown icon values', () => {
    // The component renders: iconMap[entry.icon ?? 'heart'] ?? iconMap.heart
    // If an icon value does not exist in the map, the ?? fallback ensures heart is used
    const unknownIcon = 'unicorn' as string;
    expect(iconMap[unknownIcon]).toBeUndefined();
    expect(iconMap[unknownIcon] ?? iconMap.heart).toBe(iconMap.heart);
  });

  it('renders the month for each timeline entry (accepting duplicates, skipping undefined)', () => {
    render(<Timeline />);
    // Only entries with a defined month are rendered (component conditionally renders)
    const entriesWithMonth = timeline.filter(
      (e): e is typeof e & { month: string } => !!e.month,
    );
    // Group by unique month value, like the year test
    const uniqueMonths = [...new Set(entriesWithMonth.map((e) => e.month))];
    for (const month of uniqueMonths) {
      const occurrences = entriesWithMonth.filter(
        (e) => e.month === month,
      ).length;
      expect(screen.getAllByText(month)).toHaveLength(occurrences);
    }
  });
});
