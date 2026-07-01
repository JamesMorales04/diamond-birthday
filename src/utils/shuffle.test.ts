import { describe, it, expect } from 'vitest';
import { shuffle } from './shuffle';

describe('shuffle', () => {
  it('returns a new array with the same length', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result).not.toBe(input);
    expect(result).toHaveLength(input.length);
  });

  it('contains all original elements', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect([...result].sort()).toEqual([...input].sort());
  });

  it('returns an empty array for empty input', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('returns single-element array unchanged', () => {
    expect(shuffle([42])).toEqual([42]);
  });

  it('does not mutate the original array', () => {
    const input = [1, 2, 3, 4, 5];
    const copy = [...input];
    shuffle(input);
    expect(input).toEqual(copy);
  });

  it('handles arrays with mixed types', () => {
    const input = [1, 'two', { three: 3 }, null];
    const result = shuffle(input);
    expect(result).toHaveLength(4);
    expect(result).toEqual(expect.arrayContaining(input));
  });

  it('produces a different order for most calls (probabilistic)', () => {
    // Run shuffles many times; it is extremely unlikely all produce the same order
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const results = new Set<string>();
    for (let i = 0; i < 50; i++) {
      results.add(shuffle(input).join(','));
    }
    // With 10 elements, Fisher-Yates has 10! ≈ 3.6M permutations
    // Getting all 50 runs identical is virtually impossible
    expect(results.size).toBeGreaterThan(1);
  });
});
