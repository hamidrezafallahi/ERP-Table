import { normalizeFilterText } from './filterModel';

export type QuickFilterBlobAccessor = {
  /** Searchable cell values for one row (value + display, etc.). */
  getParts: (rowId: number) => readonly unknown[];
};

/** Normalize query / cell text for quick filter (digits + ي/ك). */
export function normalizeQuickFilterText(value: string): string {
  return normalizeFilterText(value).toLocaleLowerCase('fa').trim();
}

/**
 * Flatten row parts into one searchable blob (PR-93).
 * Empty / null parts are skipped.
 */
export function buildQuickFilterBlob(parts: readonly unknown[]): string {
  const chunks: string[] = [];
  for (const part of parts) {
    if (part == null) continue;
    if (typeof part === 'string' && part.trim() === '') continue;
    if (typeof part === 'number' && Number.isNaN(part)) continue;
    chunks.push(normalizeQuickFilterText(String(part)));
  }
  return chunks.join(' ');
}

function tokenize(blob: string): string[] {
  return blob.split(/[^\p{L}\p{N}]+/u).filter((t) => t.length > 0);
}

/**
 * Per-row text cache + inverted token → rowIds (PR-93).
 * Typing reuses blobs (no per-keystroke cell walk). Cell edits update one row.
 */
export class QuickFilterIndex {
  private readonly blobs = new Map<number, string>();
  private readonly inverted = new Map<string, Set<number>>();

  clear(): void {
    this.blobs.clear();
    this.inverted.clear();
  }

  get size(): number {
    return this.blobs.size;
  }

  getBlob(rowId: number): string {
    return this.blobs.get(rowId) ?? '';
  }

  rowIds(): IterableIterator<number> {
    return this.blobs.keys();
  }

  has(rowId: number): boolean {
    return this.blobs.has(rowId);
  }

  removeRow(rowId: number): void {
    const prev = this.blobs.get(rowId);
    if (prev === undefined) return;
    this.blobs.delete(rowId);
    for (const token of tokenize(prev)) {
      const set = this.inverted.get(token);
      if (!set) continue;
      set.delete(rowId);
      if (set.size === 0) this.inverted.delete(token);
    }
  }

  setRow(rowId: number, parts: readonly unknown[]): void {
    const blob = buildQuickFilterBlob(parts);
    this.removeRow(rowId);
    this.blobs.set(rowId, blob);
    for (const token of tokenize(blob)) {
      let set = this.inverted.get(token);
      if (!set) {
        set = new Set();
        this.inverted.set(token, set);
      }
      set.add(rowId);
    }
  }

  /** Rebuild from an ordered id list + accessor (full invalidate). */
  rebuild(rowIds: readonly number[], accessor: QuickFilterBlobAccessor): void {
    this.clear();
    for (const rowId of rowIds) {
      this.setRow(rowId, accessor.getParts(rowId));
    }
  }

  /**
   * Candidate rows for one query part via inverted tokens (prefix / equality).
   * Used to narrow before blob `includes` verification.
   */
  private candidatesForPart(part: string): Set<number> | null {
    if (part.length === 0) return null;
    const out = new Set<number>();
    let hit = false;
    for (const [token, ids] of this.inverted) {
      if (token === part || token.startsWith(part) || token.includes(part)) {
        hit = true;
        for (const id of ids) out.add(id);
      }
    }
    return hit ? out : null;
  }

  /**
   * Filter `rowIds` whose cached blob contains every whitespace-separated
   * query part (AND). Empty / blank query ⇒ shallow copy of `rowIds`.
   */
  filter(rowIds: readonly number[], quickFilterText: string | null | undefined): number[] {
    const raw = typeof quickFilterText === 'string' ? quickFilterText : '';
    const normalized = normalizeQuickFilterText(raw);
    if (!normalized) return rowIds.slice();

    const parts = normalized.split(/\s+/).filter((p) => p.length > 0);
    if (parts.length === 0) return rowIds.slice();

    let candidates: Set<number> | null = null;
    for (const part of parts) {
      const next = this.candidatesForPart(part);
      if (next) {
        candidates = candidates
          ? intersectSets(candidates, next)
          : next;
        if (candidates.size === 0) {
          // inverted miss — fall through to full blob scan for this part
          candidates = null;
          break;
        }
      } else {
        candidates = null;
        break;
      }
    }

    const source =
      candidates != null
        ? rowIds.filter((id) => candidates!.has(id))
        : rowIds;

    return source.filter((rowId) => {
      const blob = this.blobs.get(rowId) ?? '';
      return parts.every((part) => blob.includes(part));
    });
  }
}

function intersectSets(a: Set<number>, b: Set<number>): Set<number> {
  const out = new Set<number>();
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const id of small) {
    if (large.has(id)) out.add(id);
  }
  return out;
}

/**
 * Pure quick filter over a blob getter (PR-93). Prefer {@link QuickFilterIndex}
 * when filtering repeatedly (typing).
 */
export function applyQuickFilter(
  rowIds: readonly number[],
  quickFilterText: string | null | undefined,
  getBlob: ((rowId: number) => string) | QuickFilterIndex,
): number[] {
  if (getBlob instanceof QuickFilterIndex) {
    return getBlob.filter(rowIds, quickFilterText);
  }
  const raw = typeof quickFilterText === 'string' ? quickFilterText : '';
  const normalized = normalizeQuickFilterText(raw);
  if (!normalized) return rowIds.slice();
  const parts = normalized.split(/\s+/).filter((p) => p.length > 0);
  if (parts.length === 0) return rowIds.slice();
  return rowIds.filter((rowId) => {
    const blob = getBlob(rowId);
    return parts.every((part) => blob.includes(part));
  });
}
