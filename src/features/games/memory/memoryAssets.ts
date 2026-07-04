/**
 * Static asset manifest for Memory Match images.
 *
 * All image paths are explicitly declared here — no dynamic directory
 * scanning or generated paths. The manifest uses `import.meta.env.BASE_URL`
 * so assets resolve correctly on GitHub Pages.
 *
 * Currently provides exactly five assets, each used as one matching pair
 * (10 cards total). To add new cards, add a new entry to MEMORY_ASSETS.
 */

import { shuffle } from '../../../utils/shuffle';

export interface MemoryCard {
  id: number;
  pairId: number;
  image: string;
  flipped: boolean;
  matched: boolean;
}

interface MemoryAsset {
  id: string;
  src: string;
}

const BASE = import.meta.env.BASE_URL ?? '/';

const MEMORY_ASSETS: readonly MemoryAsset[] = [
  { id: 'memory-1', src: `${BASE}photos/assets/memory/1.png` },
  { id: 'memory-2', src: `${BASE}photos/assets/memory/2.png` },
  { id: 'memory-3', src: `${BASE}photos/assets/memory/3.png` },
  { id: 'memory-4', src: `${BASE}photos/assets/memory/4.png` },
  { id: 'memory-5', src: `${BASE}photos/assets/memory/5.png` },
] as const;

/**
 * Creates a shuffled deck of exactly 10 cards (5 matching pairs).
 * Each image from the manifest appears exactly twice.
 */
export function createMemoryMatchCards(): MemoryCard[] {
  const cards: MemoryCard[] = [];

  MEMORY_ASSETS.forEach((asset, index) => {
    cards.push({
      id: index * 2,
      pairId: index,
      image: asset.src,
      flipped: false,
      matched: false,
    });
    cards.push({
      id: index * 2 + 1,
      pairId: index,
      image: asset.src,
      flipped: false,
      matched: false,
    });
  });

  return shuffle(cards);
}
