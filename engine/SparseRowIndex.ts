/**
 * Sparse ordered index for large tables: O(1) id lookup + O(window) projection.
 * Keeps full row payloads in a Map; visible window never walks all rows.
 */
export class SparseRowIndex<T> {
  private readonly byId = new Map<number, T>();
  private orderedIds: number[] = [];

  constructor(entries: Iterable<readonly [number, T]> = []) {
    for (const [id, value] of entries) {
      this.byId.set(id, value);
      this.orderedIds.push(id);
    }
  }

  get size(): number {
    return this.orderedIds.length;
  }

  getOrderedIds(): readonly number[] {
    return this.orderedIds;
  }

  getById(id: number): T | undefined {
    return this.byId.get(id);
  }

  set(id: number, value: T): void {
    const existed = this.byId.has(id);
    this.byId.set(id, value);
    if (!existed) this.orderedIds.push(id);
  }

  /** Replace order without rebuilding payloads (e.g. after sort). */
  setOrder(orderedIds: readonly number[]): void {
    this.orderedIds = orderedIds.slice();
  }

  clear(): void {
    this.byId.clear();
    this.orderedIds = [];
  }

  /** Project only the visible window — O(window), not O(n). */
  projectVisible(range: {
    startIndex: number;
    endIndex: number;
  }): T[] {
    const out: T[] = [];
    const end = Math.min(range.endIndex, this.orderedIds.length);
    for (let i = range.startIndex; i < end; i += 1) {
      const row = this.byId.get(this.orderedIds[i]);
      if (row !== undefined) out.push(row);
    }
    return out;
  }
}
