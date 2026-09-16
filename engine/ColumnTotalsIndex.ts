/**
 * Incremental numeric column aggregates for footer (PR-99).
 * Rebuild on structure change; patch on single cell edits.
 */
export class ColumnTotalsIndex {
  private totals = new Map<string, number>();
  private dirty = true;

  invalidate(): void {
    this.dirty = true;
  }

  get isDirty(): boolean {
    return this.dirty;
  }

  clear(): void {
    this.totals.clear();
    this.dirty = true;
  }

  rebuild(
    columnIds: readonly string[],
    sumForColumn: (columnId: string) => number,
  ): void {
    this.totals.clear();
    for (const columnId of columnIds) {
      this.totals.set(columnId, sumForColumn(columnId));
    }
    this.dirty = false;
  }

  /** Adjust one column by (newValue - oldValue). No-op if dirty. */
  patch(columnId: string, oldValue: unknown, newValue: unknown): void {
    if (this.dirty) return;
    if (!this.totals.has(columnId)) return;
    const prev = this.totals.get(columnId) ?? 0;
    this.totals.set(
      columnId,
      prev - (Number(oldValue) || 0) + (Number(newValue) || 0),
    );
  }

  toRecord(): Record<string, number> {
    const out: Record<string, number> = {};
    for (const [k, v] of this.totals) out[k] = v;
    return out;
  }
}
