/** Moves the item at `from` to `to`, returning a new array. */
export function arrayMove<T>(items: readonly T[], from: number, to: number): T[] {
  const out = items.slice();
  const [moved] = out.splice(from, 1);
  out.splice(to, 0, moved);
  return out;
}

/** Returns copies of the items with `order` set to their index. */
export function withSequentialOrder<T extends { order: number }>(items: readonly T[]): T[] {
  return items.map((item, index) => ({ ...item, order: index }));
}
