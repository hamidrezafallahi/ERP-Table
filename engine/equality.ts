// engine/equality.ts — shared equality helpers for selector subscriptions

export function shallowEqualArray(
  a: unknown[] | null | undefined,
  b: unknown[] | null | undefined,
): boolean {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (!Object.is(a[i], b[i])) return false;
  }
  return true;
}

/** Structural compare for plain JSON-like snapshots (rows / view slices). */
export function structuralEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (a == null || b == null) return a === b;
  if (typeof a !== typeof b) return false;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}
