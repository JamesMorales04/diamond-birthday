/**
 * Re-exports letters and Letter type from the canonical content file.
 *
 * All visible-text content is consolidated in src/content/page.ts.
 * This file re-exports for backward compatibility with existing imports.
 */
export { letters } from '../content/page';
export type { Letter } from '../content/page';
