import { describe, expect, it } from 'vitest';
import { arrayMove, withSequentialOrder } from './reorder';

const items = ['a', 'b', 'c', 'd'].map((id, order) => ({ id, order }));

describe('arrayMove', () => {
  it('moves an item forward', () => {
    expect(arrayMove(items, 0, 2).map((i) => i.id)).toEqual(['b', 'c', 'a', 'd']);
  });
  it('moves an item backward', () => {
    expect(arrayMove(items, 3, 0).map((i) => i.id)).toEqual(['d', 'a', 'b', 'c']);
  });
});

describe('withSequentialOrder', () => {
  it('keeps order values contiguous after a move', () => {
    const moved = withSequentialOrder(arrayMove(items, 1, 3));
    expect(moved.map((i) => i.order)).toEqual([0, 1, 2, 3]);
    expect(moved.map((i) => i.id)).toEqual(['a', 'c', 'd', 'b']);
  });
});
