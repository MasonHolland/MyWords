import { describe, expect, it } from 'vitest';
import { shuffle } from './shuffle';

describe('shuffle', () => {
  it('returns a permutation with the same elements', () => {
    const input = Array.from({ length: 50 }, (_, i) => i);
    const out = shuffle(input);
    expect(out).toHaveLength(input.length);
    expect([...out].sort((a, b) => a - b)).toEqual(input);
  });

  it('does not mutate the input', () => {
    const input = [1, 2, 3, 4];
    shuffle(input);
    expect(input).toEqual([1, 2, 3, 4]);
  });

  it('handles empty and single-item arrays', () => {
    expect(shuffle([])).toEqual([]);
    expect(shuffle(['a'])).toEqual(['a']);
  });

  it('is deterministic given a random source', () => {
    expect(shuffle([1, 2, 3], () => 0)).toEqual([2, 3, 1]);
  });
});
