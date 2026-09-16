/**
 * Sparse ordered index for large tables: O(1) id lookup + O(window) projection.
 * Position map enables O(1) neighbor for keyboard nav (PR-99).
 */
export class SparseRowIndex<T> {
  private readonly byId = new Map<number, T>();
  private orderedIds: number[] = [];
  /** id → position in `orderedIds` (PR-99). */
  private readonly posById = new Map<number, number>();

  constructor(entries: Iterable<readonly [number, T]> = []) {
    for (const [id, value] of entries) {
      this.byId.set(id, value);
      this.posById.set(id, this.orderedIds.length);
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

  /** O(1) position of `id`, or `-1`. */
  indexOf(id: number): number {
    const pos = this.posById.get(id);
    return pos === undefined ? -1 : pos;
  }

  /** O(1) neighbor id along the ordered index, or `undefined`. */
  neighbor(id: number, delta: 1 | -1): number | undefined {
    const pos = this.posById.get(id);
    if (pos === undefined) return undefined;
    const next = pos + delta;
    if (next < 0 || next >= this.orderedIds.length) return undefined;
    return this.orderedIds[next];
  }

  set(id: number, value: T): void {
    const existed = this.byId.has(id);
    this.byId.set(id, value);
    if (!existed) {
      this.posById.set(id, this.orderedIds.length);
      this.orderedIds.push(id);
    }
  }

  /** Insert `id` at `pos` (0…size). Shifts later positions — O(n-pos). */
  insertAt(pos: number, id: number, value: T): void {
    if (this.byId.has(id)) {
      this.byId.set(id, value);
      return;
    }
    const at = Math.max(0, Math.min(pos, this.orderedIds.length));
    this.byId.set(id, value);
    this.orderedIds.splice(at, 0, id);
    for (let i = at; i < this.orderedIds.length; i += 1) {
      this.posById.set(this.orderedIds[i]!, i);
    }
  }

  remove(id: number): boolean {
    if (!this.byId.has(id)) return false;
    this.byId.delete(id);
    const pos = this.posById.get(id);
    this.posById.delete(id);
    if (pos === undefined) return true;
    this.orderedIds.splice(pos, 1);
    for (let i = pos; i < this.orderedIds.length; i += 1) {
      this.posById.set(this.orderedIds[i]!, i);
    }
    return true;
  }

  /** Replace order without rebuilding payloads (e.g. after sort). */
  setOrder(orderedIds: readonly number[]): void {
    this.orderedIds = orderedIds.slice();
    this.posById.clear();
    for (let i = 0; i < this.orderedIds.length; i += 1) {
      this.posById.set(this.orderedIds[i]!, i);
    }
  }

  /** Full replace of ids + values in one pass (PR-99 rebuild). */
  replaceAll(orderedIds: readonly number[], valueFor: (id: number) => T): void {
    this.byId.clear();
    this.orderedIds = orderedIds.slice();
    this.posById.clear();
    for (let i = 0; i < this.orderedIds.length; i += 1) {
      const id = this.orderedIds[i]!;
      this.byId.set(id, valueFor(id));
      this.posById.set(id, i);
    }
  }

  clear(): void {
    this.byId.clear();
    this.orderedIds = [];
    this.posById.clear();
  }

  /** Project only the visible window — O(window), not O(n). */
  projectVisible(range: {
    startIndex: number;
    endIndex: number;
  }): T[] {
    const out: T[] = [];
    const end = Math.min(range.endIndex, this.orderedIds.length);
    for (let i = range.startIndex; i < end; i += 1) {
      const row = this.byId.get(this.orderedIds[i]!);
      if (row !== undefined) out.push(row);
    }
    return out;
  }
}
