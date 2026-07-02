/**
 * Re-exports gallery data and types from the canonical content file.
 *
 * All visible-text content is consolidated in src/content/page.ts.
 * This file re-exports for backward compatibility with existing imports.
 */
export { galleryImages, galleryCategories } from '../content/page';
export type { GalleryImage, GalleryCategory } from '../content/page';
