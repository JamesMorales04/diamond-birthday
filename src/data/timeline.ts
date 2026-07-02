/**
 * Re-exports timeline and TimelineEntry type from the canonical content file.
 *
 * All visible-text content is consolidated in src/content/page.ts.
 * This file re-exports for backward compatibility with existing imports.
 */
export { timeline } from '../content/page';
export type { TimelineEntry } from '../content/page';
