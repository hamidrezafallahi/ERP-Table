/**
 * Block cache for infinite / server-side row models (PR-102).
 * Pure — no React/DOM.
 */

export type BlockCacheEntry<T> = {
  readonly rows: readonly T[];
  lastAccess: number;
};

export function blockIndexForRow(rowIndex: number, blockSize: number): number {
  const size = Math.max(1, blockSize);
  return Math.floor(Math.max(0, rowIndex) / size);
}

export function blockRange(
  blockIndex: number,
  blockSize: number,
): { startRow: number; endRow: number } {
  const size = Math.max(1, blockSize);
  const startRow = Math.max(0, blockIndex) * size;
  return { startRow, endRow: startRow + size };
}

/** Inclusive of start, exclusive of end — all block indices that overlap. */
export function blocksCovering(
  startRow: number,
  endRow: number,
  blockSize: number,
): number[] {
  const size = Math.max(1, blockSize);
  const start = Math.max(0, startRow);
  const end = Math.max(start, endRow);
  if (end <= start) return [];
  const first = blockIndexForRow(start, size);
  const last = blockIndexForRow(end - 1, size);
  const out: number[] = [];
  for (let i = first; i <= last; i += 1) out.push(i);
  return out;
}

/**
 * LRU map of block index → rows. Evicts least-recently-used when over capacity.
 */
export class BlockCache<T> {
  private readonly blocks = new Map<number, BlockCacheEntry<T>>();
  private clock = 0;

  constructor(private readonly maxBlocks: number) {}

  get size(): number {
    return this.blocks.size;
  }

  has(blockIndex: number): boolean {
    return this.blocks.has(blockIndex);
  }

  get(blockIndex: number): readonly T[] | undefined {
    const entry = this.blocks.get(blockIndex);
    if (!entry) return undefined;
    entry.lastAccess = ++this.clock;
    return entry.rows;
  }

  set(blockIndex: number, rows: readonly T[]): void {
    this.blocks.set(blockIndex, {
      rows: rows.slice(),
      lastAccess: ++this.clock,
    });
    this.evictIfNeeded();
  }

  clear(): void {
    this.blocks.clear();
    this.clock = 0;
  }

  keys(): number[] {
    return [...this.blocks.keys()].sort((a, b) => a - b);
  }

  private evictIfNeeded(): void {
    const max = Math.max(1, this.maxBlocks);
    while (this.blocks.size > max) {
      let victim: number | undefined;
      let oldest = Infinity;
      for (const [idx, entry] of this.blocks) {
        if (entry.lastAccess < oldest) {
          oldest = entry.lastAccess;
          victim = idx;
        }
      }
      if (victim === undefined) break;
      this.blocks.delete(victim);
    }
  }
}

export type AssembleBlockWindowResult<T> = {
  rows: T[];
  /** Absolute row indices still loading (no cache hit). */
  loadingIndices: number[];
};

/**
 * Build a contiguous `[startRow, endRow)` slice from cached blocks.
 * Missing cells use `placeholder(absoluteIndex)`.
 */
export function assembleBlockWindow<T>(
  cache: BlockCache<T>,
  startRow: number,
  endRow: number,
  blockSize: number,
  placeholder: (absoluteIndex: number) => T,
): AssembleBlockWindowResult<T> {
  const start = Math.max(0, startRow);
  const end = Math.max(start, endRow);
  const rows: T[] = [];
  const loadingIndices: number[] = [];
  for (let i = start; i < end; i += 1) {
    const bi = blockIndexForRow(i, blockSize);
    const block = cache.get(bi);
    if (!block) {
      rows.push(placeholder(i));
      loadingIndices.push(i);
      continue;
    }
    const offset = i - bi * Math.max(1, blockSize);
    if (offset < block.length) {
      rows.push(block[offset] as T);
    } else {
      // Past end of a short final block — stop assembling.
      break;
    }
  }
  return { rows, loadingIndices };
}
