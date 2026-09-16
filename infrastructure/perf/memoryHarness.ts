/**
 * Memory profile helpers for 100k × N columns (PR-101).
 * Heap sampling stays in the test file (`process.memoryUsage`) so the publish
 * graph does not need Node types.
 */
import type { GridPerfBudget } from './gridHarness';
import { hydratePerfGrid } from './gridHarness';

export type GridMemoryBudget = {
  readonly rowCount: number;
  readonly columnCount: number;
  /** Max heap delta after hydrate (bytes). Target: < 300 MB for 100k × 20. */
  readonly maxHeapDeltaBytes: number;
};

export type GridMemorySample = {
  readonly rowCount: number;
  readonly columnCount: number;
  readonly heapBeforeBytes: number;
  readonly heapAfterBytes: number;
  readonly heapDeltaBytes: number;
  readonly heapDeltaMb: number;
  /** Mean `row.cells.size` after hydrate (lazy host ≈ 1 = index only). */
  readonly avgCellsPerRow: number;
};

export type GridMemoryCheck = {
  readonly sample: GridMemorySample;
  readonly budget: GridMemoryBudget;
  readonly ok: boolean;
  readonly reasons: string[];
};

export const DEFAULT_GRID_MEMORY_BUDGET: GridMemoryBudget = {
  rowCount: 100_000,
  columnCount: 20,
  maxHeapDeltaBytes: 300 * 1024 * 1024,
};

export type HeapSampler = {
  heapUsed(): number;
  tryGc?(): void;
};

/**
 * Hydrate 100k×N via createGrid and report heap delta using the provided sampler.
 */
export async function measureGridMemory(
  budget: GridMemoryBudget,
  sampler: HeapSampler,
): Promise<GridMemorySample> {
  sampler.tryGc?.();
  const heapBeforeBytes = sampler.heapUsed();

  const perfBudget: GridPerfBudget = {
    rowCount: budget.rowCount,
    columnCount: budget.columnCount,
    hydrateMaxMs: 120_000,
    firstWindowMaxMs: 1_000,
    scroll1000MaxMs: 10_000,
    edit100MaxMs: 60_000,
    sortMaxMs: 60_000,
    filterMaxMs: 60_000,
  };

  const { result } = await hydratePerfGrid(perfBudget);

  let cellMapEntries = 0;
  const rows = result.table.getRows();
  for (const row of rows) {
    cellMapEntries += (row as { cells: Map<string, unknown> }).cells.size;
  }
  const avgCells = cellMapEntries / Math.max(1, rows.length);

  sampler.tryGc?.();
  const heapAfterBytes = sampler.heapUsed();
  const heapDeltaBytes = Math.max(0, heapAfterBytes - heapBeforeBytes);

  void result.table.getRows().length;

  return {
    rowCount: rows.length,
    columnCount: budget.columnCount,
    heapBeforeBytes,
    heapAfterBytes,
    heapDeltaBytes,
    heapDeltaMb: heapDeltaBytes / (1024 * 1024),
    avgCellsPerRow: avgCells,
  };
}

export function checkGridMemoryBudget(
  sample: GridMemorySample,
  budget: GridMemoryBudget,
): GridMemoryCheck {
  const reasons: string[] = [];
  if (sample.rowCount < budget.rowCount) {
    reasons.push(
      `rowCount ${sample.rowCount} < required ${budget.rowCount}`,
    );
  }
  if (sample.columnCount < budget.columnCount) {
    reasons.push(
      `columnCount ${sample.columnCount} < required ${budget.columnCount}`,
    );
  }
  if (sample.heapDeltaBytes > budget.maxHeapDeltaBytes) {
    reasons.push(
      `heapDelta ${sample.heapDeltaMb.toFixed(1)} MB exceeds budget ${(
        budget.maxHeapDeltaBytes /
        (1024 * 1024)
      ).toFixed(0)} MB`,
    );
  }
  return {
    sample,
    budget,
    ok: reasons.length === 0,
    reasons,
  };
}
